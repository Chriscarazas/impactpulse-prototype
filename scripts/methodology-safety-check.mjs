import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

const appSource = readProjectFile("src/app.js");
const docsSource = [
  "docs/PRODUCT_VISION.md",
  "docs/PAGE_SPECIFICATIONS.md",
  "docs/DESIGN_DECISIONS.md",
  "docs/IMPLEMENTATION_SEQUENCE.md",
  "docs/APP_ARCHITECTURE.md"
]
  .map((filePath) => readProjectFile(filePath))
  .join("\n\n");

const packageSource = readProjectFile("package.json");

const requiredFlags = [
  "impactAccountDefault",
  "sroiSafetyBaseline",
  "sroiRequiresEligibility",
  "sroiComparisonBlocked",
  "benchmarkEligibilityRequired",
  "eligibilityDowngradeRequired",
  "proxyQualityGateRequired",
  "stakeholderLegitimacyRequired",
  "harmReviewRequired",
  "assuranceMatrixRequired"
];

const requiredSourceStrings = [
  "Impact Account default view",
  "SROI eligibility not assessed",
  "Exploratory demo only - SROI eligibility has not been assessed.",
  "Stakeholder legitimacy not assessed",
  "Harm review incomplete",
  "Benchmark comparability not assessed",
  "Not for public reporting",
  "SROI may be explored internally, but it must not be used for public reporting, benchmark comparison, allocation optimization, or assurance-ready claims.",
  "SROI status: ${methodologySafety.sroiEligibility.status}",
  "Method selection before monetization",
  "Recommended method: Contribution Account",
  "SROI downgraded to Exploratory Only",
  "renderImpactAccountOverview",
  "renderSroiEligibilitySnapshot",
  "renderMethodSelectionWorkspace",
  "renderBenchmarksWorkspace",
  "renderAssuranceMatrix"
];

const forbiddenSourceStrings = [
  "Aggregate SROI",
  "Evidence-adjusted result",
  "Use 3.9x central case",
  "Probability above 1.0x",
  "SROI-comparable"
];

const requiredDocsStrings = [
  "Impact Account Default and SROI Safety Baseline",
  "SROI appears only as governed method context",
  "non-destructive migration phase",
  "Rollback",
  "No database migration is required"
];

const requiredPackageScripts = [
  "\"test\": \"node scripts/methodology-safety-check.mjs\"",
  "\"test:methodology\": \"node scripts/methodology-safety-check.mjs\"",
  "\"lint\":",
  "\"build\":",
  "\"quality\":"
];

const failures = [];

for (const flag of requiredFlags) {
  if (!appSource.includes(`${flag}: true`)) {
    failures.push(`Missing enabled methodology feature flag: ${flag}`);
  }
}

for (const required of requiredSourceStrings) {
  if (!appSource.includes(required)) {
    failures.push(`Missing required source guard: ${required}`);
  }
}

for (const forbidden of forbiddenSourceStrings) {
  if (appSource.includes(forbidden)) {
    failures.push(`Forbidden source phrase still present: ${forbidden}`);
  }
}

for (const required of requiredDocsStrings) {
  if (!docsSource.includes(required)) {
    failures.push(`Missing required documentation phrase: ${required}`);
  }
}

for (const required of requiredPackageScripts) {
  if (!packageSource.includes(required)) {
    failures.push(`Missing required package script fragment: ${required}`);
  }
}

if (failures.length > 0) {
  console.error("Methodology safety check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Methodology safety check passed.");
