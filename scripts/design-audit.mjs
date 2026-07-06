import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { createStaticServer } from "./serve.mjs";

const require = createRequire(import.meta.url);
const args = new Set(process.argv.slice(2));
const visualOnly = args.has("--visual-only");
const accessibilityOnly = args.has("--accessibility-only");
const shouldCaptureScreenshots = !accessibilityOnly;
const shouldRunAccessibility = !visualOnly;

const routes = [
  { name: "sroi-results", path: "/" },
  { name: "evidence-review", path: "/evidence/" }
];
const viewports = [
  { name: "desktop-wide", width: 1440, height: 1000 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile-large", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
];

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    throw new Error(
      "Playwright is required for design audits. Run `pnpm install`, then retry `pnpm quality`."
    );
  }
}

async function launchAuditedBrowser(chromium) {
  try {
    return await chromium.launch();
  } catch (error) {
    const knownExecutables = [
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    ].filter(Boolean);

    const executablePath = knownExecutables.find((candidate) => existsSync(candidate));

    if (executablePath) {
      return chromium.launch({ executablePath });
    }

    throw error;
  }
}

function markdownList(items) {
  if (!items.length) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

async function getLayoutReport(page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const viewportWidth = documentElement.clientWidth;
    const viewportHeight = documentElement.clientHeight;
    const scrollWidth = Math.max(documentElement.scrollWidth, body.scrollWidth);
    const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
    const offenders = [];

    function isHorizontallyScrollable(element) {
      const style = window.getComputedStyle(element);
      return (
        ["auto", "scroll"].includes(style.overflowX) &&
        element.scrollWidth > element.clientWidth + 1
      );
    }

    function hasScrollableAncestor(element) {
      let node = element;
      while (node && node !== document.body) {
        if (isHorizontallyScrollable(node)) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    }

    for (const element of Array.from(document.querySelectorAll("body *"))) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const isVisible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0;

      if (!isVisible) {
        continue;
      }

      if ((rect.left < -1 || rect.right > viewportWidth + 1) && !hasScrollableAncestor(element)) {
        offenders.push({
          tag: element.tagName.toLowerCase(),
          className: element.className?.toString() || "",
          text: element.textContent?.trim().slice(0, 80) || "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          viewportWidth
        });
      }
    }

    const main = document.querySelector("main");
    const mainRect = main?.getBoundingClientRect();

    return {
      viewportWidth,
      viewportHeight,
      scrollWidth,
      scrollHeight,
      hasHorizontalPageOverflow: scrollWidth > viewportWidth + 1,
      mainHasSize: Boolean(mainRect && mainRect.width > 100 && mainRect.height > 100),
      offenders: offenders.slice(0, 8)
    };
  });
}

async function getAccessibilityReport(page) {
  return page.evaluate(() => {
    const issues = [];
    const warnings = [];

    function textAlternative(element) {
      return (
        element.getAttribute("aria-label") ||
        element.getAttribute("title") ||
        element.textContent ||
        ""
      ).trim();
    }

    function parseRgb(value) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
    }

    function luminance([r, g, b]) {
      const values = [r, g, b].map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    }

    function contrast(foreground, background) {
      const l1 = luminance(foreground);
      const l2 = luminance(background);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    function nearestBackground(element) {
      let node = element;
      while (node && node !== document.documentElement) {
        const color = window.getComputedStyle(node).backgroundColor;
        if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
          return color;
        }
        node = node.parentElement;
      }
      return "rgb(255, 255, 255)";
    }

    if (!document.documentElement.lang) {
      issues.push("The document is missing a language attribute.");
    }

    if (!document.title.trim()) {
      issues.push("The document is missing a title.");
    }

    if (!document.querySelector("main")) {
      issues.push("The page is missing a main landmark.");
    }

    if (!document.querySelector("nav")) {
      issues.push("The page is missing navigation.");
    }

    const h1s = Array.from(document.querySelectorAll("h1"));
    if (h1s.length !== 1) {
      issues.push(`Expected one h1, found ${h1s.length}.`);
    }

    let previousHeadingLevel = 0;
    for (const heading of Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))) {
      const level = Number(heading.tagName.slice(1));
      if (previousHeadingLevel && level > previousHeadingLevel + 1) {
        issues.push(`Heading order skips from h${previousHeadingLevel} to h${level}: "${heading.textContent.trim()}".`);
      }
      previousHeadingLevel = level;
    }

    for (const button of Array.from(document.querySelectorAll("button"))) {
      if (!textAlternative(button)) {
        issues.push("A button is missing an accessible name.");
      }
    }

    for (const link of Array.from(document.querySelectorAll("a[href]"))) {
      if (!textAlternative(link)) {
        issues.push(`A link to ${link.getAttribute("href")} is missing an accessible name.`);
      }
    }

    for (const input of Array.from(document.querySelectorAll("input, select, textarea"))) {
      const id = input.getAttribute("id");
      const hasLabel = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
      const hasAria = input.getAttribute("aria-label") || input.getAttribute("aria-labelledby");
      if (!hasLabel && !hasAria) {
        issues.push(`A ${input.tagName.toLowerCase()} control is missing a label.`);
      }
    }

    for (const image of Array.from(document.querySelectorAll("img"))) {
      if (!image.hasAttribute("alt")) {
        issues.push("An image is missing alt text.");
      }
    }

    for (const svg of Array.from(document.querySelectorAll("svg[role='img']"))) {
      const labelledBy = svg.getAttribute("aria-labelledby");
      if (!labelledBy) {
        issues.push("An SVG chart with role img is missing aria-labelledby.");
      }
    }

    for (const table of Array.from(document.querySelectorAll("table"))) {
      if (!table.querySelector("caption")) {
        warnings.push("A table is missing a caption.");
      }
      if (!table.querySelector("th[scope]")) {
        warnings.push("A table has header cells without scope attributes.");
      }
    }

    const sampledText = Array.from(document.querySelectorAll("body *"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          element.childElementCount === 0 &&
          (element.textContent || "").trim().length > 0
        );
      })
      .slice(0, 140);

    for (const element of sampledText) {
      const style = window.getComputedStyle(element);
      const foreground = parseRgb(style.color);
      const background = parseRgb(nearestBackground(element));
      const text = element.textContent.trim().slice(0, 60);
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);

      if (foreground && background) {
        const ratio = contrast(foreground, background);
        const minimum = isLarge ? 3 : 4.5;
        if (ratio < minimum) {
          issues.push(`Low text contrast (${ratio.toFixed(2)}:1) for "${text}".`);
        }
      }
    }

    return {
      issues,
      warnings
    };
  });
}

async function run() {
  const artifactRoot = resolve("artifacts", "design-audit", "latest");
  const screenshotsRoot = join(artifactRoot, "screenshots");
  const reportsRoot = join(artifactRoot, "reports");
  const failures = [];
  const warnings = [];
  const screenshotFiles = [];

  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(screenshotsRoot, { recursive: true });
  await mkdir(reportsRoot, { recursive: true });

  const { chromium } = loadPlaywright();
  const { server, origin } = await createStaticServer({ port: 0 });
  const browser = await launchAuditedBrowser(chromium);

  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        const page = await browser.newPage({ viewport });
        const url = `${origin}${route.path}`;
        await page.goto(url, { waitUntil: "networkidle" });

        const layoutReport = await getLayoutReport(page);

        if (layoutReport.hasHorizontalPageOverflow) {
          failures.push(
            `${route.name} at ${viewport.width}x${viewport.height} has horizontal page overflow: document width ${layoutReport.scrollWidth}px.`
          );
        }

        if (!layoutReport.mainHasSize) {
          failures.push(`${route.name} at ${viewport.width}x${viewport.height} has no usable main content area.`);
        }

        for (const offender of layoutReport.offenders) {
          warnings.push(
            `${route.name} at ${viewport.width}x${viewport.height}: ${offender.tag}.${offender.className} may extend beyond viewport (${offender.left}-${offender.right}px).`
          );
        }

        if (shouldRunAccessibility) {
          const accessibilityReport = await getAccessibilityReport(page);
          failures.push(
            ...accessibilityReport.issues.map(
              (issue) => `${route.name} at ${viewport.width}x${viewport.height}: ${issue}`
            )
          );
          warnings.push(
            ...accessibilityReport.warnings.map(
              (warning) => `${route.name} at ${viewport.width}x${viewport.height}: ${warning}`
            )
          );
        }

        if (shouldCaptureScreenshots) {
          const screenshotFile = join(
            screenshotsRoot,
            `${route.name}-${viewport.name}-${viewport.width}x${viewport.height}.png`
          );
          await page.screenshot({ path: screenshotFile, fullPage: true });
          screenshotFiles.push(screenshotFile);
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const report = [
    "# ImpactPulse Design Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Routes",
    "",
    markdownList(routes.map((route) => `${route.name}: ${route.path}`)),
    "",
    "## Viewports",
    "",
    markdownList(viewports.map((viewport) => `${viewport.width}x${viewport.height}`)),
    "",
    "## Screenshots",
    "",
    shouldCaptureScreenshots
      ? markdownList(screenshotFiles.map((file) => file.replace(process.cwd(), ".")))
      : "- Skipped by --accessibility-only",
    "",
    "## Critical Failures",
    "",
    markdownList([...new Set(failures)]),
    "",
    "## Warnings",
    "",
    markdownList([...new Set(warnings)]),
    "",
    "## Result",
    "",
    failures.length ? "Failed" : "Passed"
  ].join("\n");

  await writeFile(join(reportsRoot, "design-audit.md"), report, "utf8");
  await writeFile(
    join(reportsRoot, "design-audit.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        routes,
        viewports,
        screenshots: screenshotFiles.map((file) => file.replace(process.cwd(), ".")),
        failures: [...new Set(failures)],
        warnings: [...new Set(warnings)],
        result: failures.length ? "failed" : "passed"
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(report);

  if (failures.length) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
