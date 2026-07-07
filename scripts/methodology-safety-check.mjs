import { readFile } from "node:fs/promises";

const appSource = await readFile("src/app.js", "utf8");
const pageSpecs = await readFile("docs/PAGE_SPECIFICATIONS.md", "utf8");
const designDecisions = await readFile("docs/DESIGN_DECISIONS.md", "utf8");

const requiredFeatureFlags = [
  "impactAccountDefault",
  "sroiRequiresEligibility",
  "sroiComparisonBlocked",
  "benchmarkEligibilityRequired",
  "harmReviewRequired",
  "stakeholderLegitimacyRequired",
  "assuranceMatrixRequired"
];

const requiredSafetyRoutes = [
  '"/"',
  '"/decision/"',
  '"/reports/"',
  '"/portfolio/"',
  '"/benchmarks/"',
  '"/valuation/"',
  '"/assurance/"'
];

const requiredGateText = [
  "SROI eligibility not assessed",
  "Benchmark comparability not assessed",
  "Harm review incomplete",
  "Stakeholder legitimacy not assessed",
  "Not for public reporting"
];

const requiredImpactAccountText = [
  "Impact Account default view",
  "Outcomes",
  "People affected",
  "Harms and disbenefits",
  "Equity status",
  "Evidence distribution",
  "Total investment",
  "Uncertainty status",
  "Unmonetized material outcomes",
  "Reporting period",
  "Decision implication"
];

function expectIncludes(text, expected, context) {
  if (!text.includes(expected)) {
    throw new Error(`${context} is missing required text: "${expected}"`);
  }
}

function expectExcludes(text, forbidden, context) {
  if (text.includes(forbidden)) {
    throw new Error(`${context} still contains unsafe wording: "${forbidden}"`);
  }
}

function expectPattern(text, pattern, context) {
  if (!pattern.test(text)) {
    throw new Error(`${context} does not match required pattern: ${pattern}`);
  }
}

for (const flag of requiredFeatureFlags) {
  expectIncludes(appSource, flag, "src/app.js methodology feature flags");
}

for (const route of requiredSafetyRoutes) {
  expectIncludes(appSource, route, "methodology safety route set");
}

for (const label of requiredGateText) {
  expectIncludes(appSource, label, "methodology gate labels");
}

for (const label of requiredImpactAccountText) {
  expectIncludes(appSource, label, "Impact Account view");
}

expectIncludes(
  appSource,
  "Exploratory demo only - SROI eligibility has not been assessed.",
  "SROI safety warning"
);
expectIncludes(appSource, 'view: "impactAccount"', "portfolio route");
expectIncludes(appSource, "renderImpactAccountOverview", "route renderer");
expectIncludes(appSource, "evidence-adjusted value", "safe evidence distribution caveat");
expectExcludes(appSource, "Evidence-adjusted result", "portfolio source");
expectExcludes(appSource, "Aggregate SROI", "portfolio source");
expectPattern(
  appSource,
  /Each option carries evidence, method eligibility, risk, equity, dissent, and next owner\./,
  "decision route copy"
);

expectIncludes(pageSpecs, "Impact Account default view before any SROI ratio", "page specifications");
expectIncludes(pageSpecs, "Evidence distribution without converting confidence", "page specifications");
expectIncludes(designDecisions, "Add Fortified Methodology Safety Baseline", "design decisions");
expectIncludes(designDecisions, "Rollback is non-destructive", "rollback documentation");

console.log("Methodology safety baseline static checks passed.");
