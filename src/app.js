import {
  captureAuthSessionFromUrl,
  getBackendStatus,
  getEvidenceUploadStatus,
  loadOutcomesWorkspace,
  requestMagicLink,
  uploadEvidenceFile
} from "./backend/supabase.js";

const demoProject = {
  id: "00000000-0000-4000-8000-000000000101",
  organizationId: "00000000-0000-4000-8000-000000000001",
  name: "Workforce Pathways 2026",
  period: "FY 2026 forecast",
  location: "3 sites, Midwest US",
  readiness: "Developing",
  version: "Draft v0.4",
  investment: "$1.2M",
  socialValue: "$4.7M",
  sroi: "3.9x",
  range: "2.8x to 4.8x",
  coverage: "74%",
  confidence: "Moderate"
};

const methodologyFeatureFlags = {
  impactAccountDefault: true,
  sroiSafetyBaseline: true,
  sroiRequiresEligibility: true,
  sroiComparisonBlocked: true,
  benchmarkEligibilityRequired: true,
  eligibilityDowngradeRequired: true,
  proxyQualityGateRequired: true,
  stakeholderLegitimacyRequired: true,
  harmReviewRequired: true,
  assuranceMatrixRequired: true
};

const methodologySafety = {
  sroiEligibility: {
    label: "SROI eligibility not assessed",
    status: "Exploratory Only",
    detail:
      "Exploratory demo only - SROI eligibility has not been assessed. Use the Impact Account for decision review until the gate is complete."
  },
  stakeholderLegitimacy: {
    label: "Stakeholder legitimacy not assessed",
    detail: "Stakeholder universe, representation gaps, consent, and community validation are not complete."
  },
  harmReview: {
    label: "Harm review incomplete",
    detail: "Negative and unintended outcomes are visible but have not passed a mandatory harm and disbenefit review."
  },
  benchmarkEligibility: {
    label: "Benchmark comparability not assessed",
    detail: "SROI must not be compared across projects until boundaries, stakeholders, outcomes, periods, methods, proxies, and evidence maturity are aligned."
  },
  reportingGuard: {
    label: "Not for public reporting",
    detail:
      "SROI may be explored internally, but it must not be used for public reporting, benchmark comparison, allocation optimization, or assurance-ready claims."
  }
};

const impactAccountSections = [
  ["Outcomes", "4 material outcomes tracked; 1 negative effect remains under review."],
  ["People affected", "820 enrolled participants, with rural participants underrepresented in follow-up evidence."],
  ["Harms and disbenefits", "Transport burden is material and cannot be netted out by positive value."],
  ["Equity status", "Rural access gap blocks stronger equity and SDG 10.2 language."],
  ["Evidence distribution", "74% reviewed coverage; follow-up and investment boundary conflicts remain open."],
  ["Total investment", "$1.2M cash boundary, with donated facilities still unresolved."],
  ["Uncertainty status", "Central case is draft; conservative case and switching values are required before publication."],
  ["Unmonetized material outcomes", "Confidence, transport burden, and employer context stay visible outside monetized value."],
  ["Reporting period", demoProject.period],
  ["Decision implication", "Use the contribution narrative for internal planning; hold public SROI claims."]
];

const sroiEligibilityCriteria = [
  ["Outcome materiality", "Partial", "Material outcomes are identified, but transport burden requires review."],
  ["Stakeholder legitimacy", "Not assessed", "Representation, consent, dissent, and community validation are incomplete."],
  ["Evidence sufficiency", "Premature", "Six-month follow-up and rural response coverage are not strong enough for a decision-grade ratio."],
  ["Counterfactual credibility", "Premature", "Deadweight and attribution rely on draft comparator assumptions."],
  ["Proxy quality", "Needs review", "The wage proxy is approved locally; other lower-grade proxies need transferability review."],
  ["Negative outcomes", "Incomplete", "Harm review must be finished before high confidence or assurance-ready language."],
  ["Benchmark comparability", "Not assessed", "Comparable cohorts are not yet eligible for SROI comparison."]
];

const demoStakeholders = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    name: "Adult job seekers",
    segment: "Participants",
    estimated_count: 820,
    inclusion_note: "Rural participants need additional validation before equity claims are approved."
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    name: "Local employers",
    segment: "Hiring partners",
    estimated_count: 46,
    inclusion_note: "Employer benefit is supporting context, not counted as primary social value yet."
  }
];

const demoOutcomes = [
  {
    id: "00000000-0000-4000-8000-000000000401",
    stakeholder_id: "00000000-0000-4000-8000-000000000201",
    name: "Sustained employment",
    description: "Participants remain employed six months after completing training.",
    change_type: "positive",
    materiality_score: 92,
    evidence_status: "needs_review",
    valuation_readiness: "needs_review",
    decision_note: "Collect missing follow-up before public SROI reporting.",
    sort_order: 1
  },
  {
    id: "00000000-0000-4000-8000-000000000402",
    stakeholder_id: "00000000-0000-4000-8000-000000000201",
    name: "Wage progression",
    description: "Participants increase hourly wages after placement.",
    change_type: "positive",
    materiality_score: 78,
    evidence_status: "approved",
    valuation_readiness: "approved",
    decision_note: "Use approved local wage proxy for central case.",
    sort_order: 2
  },
  {
    id: "00000000-0000-4000-8000-000000000403",
    stakeholder_id: "00000000-0000-4000-8000-000000000201",
    name: "Reduced emergency support reliance",
    description: "Participants need fewer short-term emergency supports after stable employment.",
    change_type: "positive",
    materiality_score: 63,
    evidence_status: "estimated",
    valuation_readiness: "draft",
    decision_note: "Keep as draft until source strength improves.",
    sort_order: 3
  },
  {
    id: "00000000-0000-4000-8000-000000000404",
    stakeholder_id: "00000000-0000-4000-8000-000000000201",
    name: "Transport burden for rural participants",
    description: "Program participation may increase travel time and cost for some rural participants.",
    change_type: "negative",
    materiality_score: 71,
    evidence_status: "needs_review",
    valuation_readiness: "blocked",
    decision_note: "Validate rural sample before equity or SDG 10.2 claim language.",
    sort_order: 4
  }
];

const demoIndicators = [
  {
    outcome_id: "00000000-0000-4000-8000-000000000401",
    name: "Participants employed at six months",
    unit: "participants",
    observed_value: 351,
    target_value: 410,
    collection_frequency: "six-month follow-up"
  },
  {
    outcome_id: "00000000-0000-4000-8000-000000000402",
    name: "Average hourly wage lift",
    unit: "USD per hour",
    observed_value: 2.9,
    target_value: 3.25,
    collection_frequency: "placement review"
  },
  {
    outcome_id: "00000000-0000-4000-8000-000000000403",
    name: "Emergency supports avoided",
    unit: "cases",
    observed_value: 84,
    target_value: 120,
    collection_frequency: "quarterly review"
  },
  {
    outcome_id: "00000000-0000-4000-8000-000000000404",
    name: "Rural participants reporting transport barrier",
    unit: "percent",
    observed_value: 31,
    target_value: 20,
    collection_frequency: "stakeholder interview round"
  }
];

const demoOutcomeTasks = [
  {
    title: "Complete six-month follow-up",
    task_type: "collection",
    priority: 1,
    status: "needs_review",
    due_on: "2026-07-12",
    affected_area: "Sustained employment"
  },
  {
    title: "Validate rural transport barrier",
    task_type: "stakeholder_validation",
    priority: 2,
    status: "needs_review",
    due_on: "2026-07-16",
    affected_area: "Transport burden"
  },
  {
    title: "Confirm emergency support attribution",
    task_type: "method_review",
    priority: 3,
    status: "draft",
    due_on: "2026-07-19",
    affected_area: "Reduced emergency support reliance"
  }
];

const sroiSteps = [
  "Scope",
  "People",
  "Outcomes",
  "Evidence",
  "Valuation",
  "Adjustments",
  "SROI",
  "Sensitivity",
  "Decision",
  "Report"
];

const routeDefinitions = [
  {
    path: "/",
    nav: "Impact Account",
    title: "Impact Account",
    kicker: "Impact Account default view",
    activeStep: null,
    lead: "Decision account for outcomes, people affected, evidence, uncertainty, harms, unmonetized value, and next action before any SROI ratio is used.",
    action: "Review account",
    view: "impactAccount"
  },
  {
    path: "/quick-start/",
    nav: "Quick Start",
    title: "Upload to First Insight",
    kicker: "Flagship flow",
    activeStep: 1,
    lead: "Upload existing material and receive a reviewable first model: people affected, outcomes, evidence, gaps, comparators, SDG suggestions, assumptions, and next action.",
    action: "Generate insight",
    view: "quickStart"
  },
  {
    path: "/evidence/",
    nav: "Evidence",
    title: "Evidence Review Queue",
    kicker: "Evidence Review Queue",
    activeStep: 4,
    lead: "Review the sources and extracted claims that feed outcomes, assumptions, SDG mappings, Impact Account sections, and exploratory SROI context.",
    action: "Assign evidence tasks",
    view: "evidence"
  },
  {
    path: "/data-quality/",
    nav: "Data Quality",
    title: "Data Quality Overview",
    kicker: "Measurement trust",
    activeStep: 4,
    lead: "Profile sufficiency, conflicts, coverage, gaps, and treatments before evidence can drive method context or assurance claims.",
    action: "Create collection plan",
    view: "dataQuality",
    capabilities: ["Quality profile", "Conflict queue", "Gap prioritization", "Treatment log"],
    nextBuild: "Turn the evidence queue gaps into a ranked data collection plan."
  },
  {
    path: "/outcomes/",
    nav: "Outcomes",
    title: "Outcomes and Indicators",
    kicker: "Impact model",
    activeStep: 3,
    lead: "Define material outcomes, affected groups, indicators, risks, negative effects, and evidence requirements.",
    action: "Review outcomes",
    view: "outcomes",
    capabilities: ["Theory of Change", "Outcome register", "Indicator mapping", "Materiality review"],
    nextBuild: "Connect every outcome to evidence, stakeholder validation, and valuation readiness."
  },
  {
    path: "/valuation/",
    nav: "Valuation",
    title: "Method and Valuation Gate",
    kicker: "Governed method",
    activeStep: 5,
    lead: "Confirm the method, SROI eligibility, proxy quality, and intended use before monetized value shapes a decision.",
    action: "Review method",
    view: "methodGate",
    capabilities: ["Method selection", "SROI eligibility", "Proxy quality gate", "Intended-use guard"],
    nextBuild: "Add method-selection rules, SROI eligibility criteria, and proxy governance before deeper valuation."
  },
  {
    path: "/assumptions/",
    nav: "Assumptions",
    title: "Assumptions Lab",
    kicker: "Sensitivity",
    activeStep: 8,
    lead: "Test the assumptions that shape SROI, confidence, decision quality, and assurance readiness.",
    action: "Save scenario",
    view: "assumptions"
  },
  {
    path: "/decision/",
    nav: "Decision",
    title: "Decision Room",
    kicker: "Use the result",
    activeStep: 9,
    lead: "Compare options, surface evidence and dissent, record the decision, and assign follow-up actions.",
    action: "Record decision",
    view: "decision"
  },
  {
    path: "/reports/",
    nav: "Reports",
    title: "Report Storyboard",
    kicker: "Decision-ready reporting",
    activeStep: 10,
    lead: "Build audience-specific reports from approved evidence, calculations, limitations, and methodology versions.",
    action: "Prepare report",
    view: "reports"
  },
  {
    path: "/portfolio/",
    nav: "Portfolio",
    title: "Organization Impact Account",
    kicker: "Impact Account default view",
    activeStep: null,
    lead: "Summarize outcomes, people affected, evidence strength, uncertainty, harms, unmonetized value, and decision implications without ratio-led comparison.",
    action: "Review portfolio",
    view: "impactAccount",
    capabilities: ["Coverage disclosure", "Impact Account", "Evidence distribution", "Theme and country drill-down"],
    nextBuild: "Use approved project data to create trustworthy organization-level Impact Accounts."
  },
  {
    path: "/benchmarks/",
    nav: "Benchmarks",
    title: "Benchmark Cohort Builder",
    kicker: "Comparable evidence",
    activeStep: null,
    lead: "Construct defensible peer cohorts and block SROI comparison when methods, populations, outcomes, boundaries, or evidence maturity are misaligned.",
    action: "Build cohort",
    view: "benchmarks",
    capabilities: ["Similarity", "Comparability", "Transferability", "No-match state"],
    nextBuild: "Let users widen or narrow cohorts and see the effect on comparability."
  },
  {
    path: "/sdg/",
    nav: "SDG Mapping",
    title: "SDG Target Mapping",
    kicker: "Claims control",
    activeStep: 3,
    lead: "Map approved outcomes to SDG targets, indicators, evidence, contribution type, confidence, and trade-offs.",
    action: "Review mappings",
    capabilities: ["Target-level mapping", "Claims ladder", "Trade-off review", "Human approval"],
    nextBuild: "Prevent broad Goal claims from becoming published language without target evidence."
  },
  {
    path: "/assurance/",
    nav: "Assurance",
    title: "Assurance Matrix",
    kicker: "Verification",
    activeStep: 10,
    lead: "Separate principles alignment, stakeholder engagement, data verification, calculation reproduction, proxy review, causal design, privacy, ethics, report assurance, and external review.",
    action: "Create remediation plan",
    view: "assurance",
    capabilities: ["SVI principles", "Evidence checks", "Calculation reproduction", "Independent review"],
    nextBuild: "Turn each assurance dimension into assigned remediation tasks without implying a single badge covers all verification."
  }
];

const app = document.querySelector("[data-app-shell]");

function currentRoute() {
  const pathname = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;
  const route = routeDefinitions.find((item) => item.path !== "/" && pathname.endsWith(item.path));
  return route || routeDefinitions[0];
}

function routeHref(path) {
  return path;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function status(label, tone = "approved") {
  return `<span class="status ${tone}">${escapeHtml(label)}</span>`;
}

function formatLabel(value) {
  if (!value) {
    return "Not set";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function evidenceTone(value) {
  return (
    {
      observed: "verified",
      derived: "verified",
      estimated: "estimated",
      ai_suggested: "review",
      approved: "approved",
      verified: "verified",
      needs_review: "review",
      conflict: "risk"
    }[value] || "review"
  );
}

function reviewTone(value) {
  return (
    {
      approved: "approved",
      needs_review: "review",
      blocked: "risk",
      draft: "estimated",
      archived: "estimated"
    }[value] || "review"
  );
}

function formatMetric(value, unit) {
  if (value === null || value === undefined || value === "") {
    return "No observation";
  }

  return `${value}${unit ? ` ${unit}` : ""}`;
}

function renderHeader(route) {
  const navItems = [
    routeDefinitions[0],
    routeDefinitions[1],
    routeDefinitions[2],
    routeDefinitions.find((item) => item.path === "/assumptions/"),
    routeDefinitions.find((item) => item.path === "/reports/"),
    routeDefinitions.find((item) => item.path === "/assurance/")
  ].filter(Boolean);

  return `
    <header class="site-header">
      <a class="brand" href="${routeHref("/")}" aria-label="ImpactPulse home">
        <span class="brand-mark" aria-hidden="true">IP</span>
        <span>ImpactPulse</span>
      </a>
      <nav class="global-nav" aria-label="Global">
        ${navItems
          .map(
            (item) =>
              `<a href="${routeHref(item.path)}" ${item.path === route.path ? 'aria-current="page"' : ""}>${item.nav}</a>`
          )
          .join("")}
      </nav>
      <div class="header-actions">
        <button class="button secondary" type="button" data-open-drawer>Review lineage</button>
        <button class="button primary" type="button">${route.action}</button>
      </div>
    </header>
  `;
}

function renderStepRail(route) {
  return `
    <aside class="side-rail" aria-label="Guided impact decision process">
      <p class="rail-title">Guided analysis</p>
      <ol class="step-list">
        ${sroiSteps
          .map((step, index) => {
            const stepNumber = index + 1;
            const stepRoutes = {
              3: "/outcomes/",
              4: "/evidence/",
              5: "/valuation/",
              7: "/",
              8: "/assumptions/",
              9: "/decision/",
              10: "/reports/"
            };
            const href = stepRoutes[stepNumber] || route.path;
            return `<li><a href="${routeHref(href)}" ${
              route.activeStep === stepNumber ? 'aria-current="step"' : ""
            }><span class="step-index">${stepNumber}</span><span>${step}</span></a></li>`;
          })
          .join("")}
      </ol>
      <div class="route-mini-map">
        <p class="rail-title">Build Map</p>
        <a href="${routeHref("/quick-start/")}">Upload flow</a>
        <a href="${routeHref("/portfolio/")}">Impact Account</a>
        <a href="${routeHref("/benchmarks/")}">Benchmarks</a>
        <a href="${routeHref("/sdg/")}">SDG claims</a>
      </div>
    </aside>
  `;
}

function renderProjectHeader(route) {
  return `
    <section class="project-header" aria-labelledby="page-title">
      <div class="project-title-row">
        <div>
          <p class="project-kicker">${route.kicker}</p>
          <h1 id="page-title">${route.title}</h1>
          <p class="lead">${route.lead}</p>
        </div>
        <a class="button ghost" href="${route.path === "/" ? routeHref("/quick-start/") : routeHref("/")}">${
          route.path === "/" ? "Start upload flow" : "Return to Impact Account"
        }</a>
      </div>
      <dl class="meta-grid" aria-label="Project context">
        <div class="meta-item"><dt class="meta-label">Period</dt><dd class="meta-value">${demoProject.period}</dd></div>
        <div class="meta-item"><dt class="meta-label">Location</dt><dd class="meta-value">${demoProject.location}</dd></div>
        <div class="meta-item"><dt class="meta-label">Readiness</dt><dd class="meta-value">${demoProject.readiness}</dd></div>
        <div class="meta-item"><dt class="meta-label">Version</dt><dd class="meta-value">${demoProject.version}</dd></div>
      </dl>
    </section>
  `;
}

function renderSafetyBanner() {
  return `
    <section class="safety-banner" aria-labelledby="safety-title">
      <div>
        <p class="project-kicker">Fortified methodology safety baseline</p>
        <h2 id="safety-title">SROI is exploratory until eligibility is reviewed</h2>
        <p>${methodologySafety.reportingGuard.detail}</p>
      </div>
      <div class="status-row" aria-label="Methodology guard status">
        ${status(methodologySafety.sroiEligibility.label, "risk")}
        ${status(methodologySafety.stakeholderLegitimacy.label, "review")}
        ${status(methodologySafety.harmReview.label, "review")}
        ${status(methodologySafety.benchmarkEligibility.label, "risk")}
        ${status(methodologySafety.reportingGuard.label, "risk")}
      </div>
    </section>
  `;
}

function renderFeatureFlagPanel() {
  return `
    <section class="panel" aria-labelledby="flags-title">
      <div class="section-header">
        <div>
          <h2 id="flags-title">Methodology feature flags</h2>
          <p>Flags make the safety baseline reversible while preserving existing demo behavior.</p>
        </div>
        ${status("Feature flags active", "verified")}
      </div>
      <dl class="flag-list">
        ${Object.entries(methodologyFeatureFlags)
          .map(([key, enabled]) => `<div><dt>${formatLabel(key)}</dt><dd>${enabled ? "Enabled" : "Disabled"}</dd></div>`)
          .join("")}
      </dl>
    </section>
  `;
}

function renderImpactAccountOverview() {
  return `
    ${renderSafetyBanner()}
    <section class="section" aria-labelledby="account-title">
      <div class="account-hero">
        <div>
          <p class="project-kicker">Impact Account default view</p>
          <h2 id="account-title">Decision account before monetized claims</h2>
          <p class="lead">This view leads with outcomes, people affected, evidence strength, harms, equity, uncertainty, unmonetized value, costs, and the next decision. SROI appears only as governed method context when eligible.</p>
          <div class="status-row" aria-label="Impact Account status">
            ${status("Impact Account default view", "verified")}
            ${status(`SROI status: ${methodologySafety.sroiEligibility.status}`, "review")}
            ${status(methodologySafety.reportingGuard.label, "risk")}
          </div>
        </div>
        <dl class="account-metrics" aria-label="Impact Account summary">
          <div><dt>Material outcomes</dt><dd><strong>4</strong><span>1 negative effect under review</span></dd></div>
          <div><dt>People affected</dt><dd><strong>820</strong><span>Rural sample incomplete</span></dd></div>
          <div><dt>Evidence coverage</dt><dd><strong>${demoProject.coverage}</strong><span>Internal planning only</span></dd></div>
          <div><dt>Total investment</dt><dd><strong>${demoProject.investment}</strong><span>Boundary conflict open</span></dd></div>
        </dl>
      </div>
    </section>
    <div class="content-grid">
      <div class="main">
        <section class="section" aria-labelledby="account-sections-title">
          <div class="section-header">
            <div>
              <h2 id="account-sections-title">Impact Account sections</h2>
              <p>Every section stays visible even when monetization is premature.</p>
            </div>
          </div>
          <div class="account-section-grid">
            ${impactAccountSections
              .map(([label, text]) => `<article class="account-section"><span>${label}</span><p>${text}</p></article>`)
              .join("")}
          </div>
        </section>
        ${renderSroiEligibilitySnapshot()}
        ${renderValueBridge()}
      </div>
      <aside class="panel-stack" aria-label="Impact Account governance">
        ${renderFeatureFlagPanel()}
        ${renderAssumptionPanel()}
        ${renderDecisionPanel()}
      </aside>
    </div>
  `;
}

function renderSroiEligibilitySnapshot() {
  return `
    <section class="section" aria-labelledby="eligibility-title">
      <div class="section-header">
        <div>
          <h2 id="eligibility-title">SROI eligibility snapshot</h2>
          <p>${methodologySafety.sroiEligibility.detail}</p>
        </div>
        ${status(methodologySafety.sroiEligibility.status, "review")}
      </div>
      <div class="eligibility-grid">
        ${sroiEligibilityCriteria
          .map(
            ([criterion, finding, detail]) => `
              <article class="eligibility-item">
                <span>${criterion}</span>
                <strong>${finding}</strong>
                <p>${detail}</p>
              </article>`
          )
          .join("")}
      </div>
      <div class="callout risk-callout">
        <strong>Downgrade rule</strong>
        SROI downgraded to Exploratory Only until stakeholder legitimacy, harm review, proxy quality, counterfactual credibility, and reporting intent pass review.
      </div>
    </section>
  `;
}

function renderMethodSelectionWorkspace() {
  return `
    <div class="content-grid">
      <section class="section" aria-labelledby="method-title">
        <div class="section-header">
          <div>
            <h2 id="method-title">Method selection before monetization</h2>
            <p>The current decision needs a contribution account first. A decision-grade SROI ratio is premature because core eligibility criteria are incomplete.</p>
          </div>
          ${status("Recommended method: Contribution Account", "verified")}
        </div>
        <div class="method-grid">
          ${[
            ["Contribution Account", "Recommended", "Outcome measurement, stakeholder evidence, assumptions, evidence gaps, and decision implications without a public monetary ratio."],
            ["Decision SROI", "Premature", "Requires approved proxies, counterfactual method, harm review, complete lineage, and internal methodological review."],
            ["Cost-consequence analysis", "Alternative", "Useful if stakeholders need outcomes, costs, equity, and harms side by side without monetizing every material outcome."],
            ["Multi-criteria decision analysis", "Later", "Useful for allocation only after rights, equity, geography, capacity, and irreversibility constraints are defined."]
          ]
            .map(
              ([method, finding, detail]) => `
                <article class="method-card">
                  <span>${finding}</span>
                  <h3>${method}</h3>
                  <p>${detail}</p>
                </article>`
            )
            .join("")}
        </div>
        ${renderSroiEligibilitySnapshot()}
      </section>
      <aside class="panel-stack" aria-label="Methodology controls">
        <section class="panel" aria-labelledby="method-controls-title">
          <div class="section-header">
            <div>
              <h2 id="method-controls-title">Method controls</h2>
              <p>These controls prevent premature monetization from becoming a decision-grade claim.</p>
            </div>
          </div>
          <ul class="task-list">
            <li class="task"><strong>Causal claim ladder</strong><span>Current language: Plausible Contribution. Stronger causal language is blocked.</span>${status("Guarded", "review")}</li>
            <li class="task"><strong>Proxy quality gate</strong><span>Lower-grade or unreviewed proxies must be shown separately from approved local value.</span>${status("Needs review", "review")}</li>
            <li class="task"><strong>Intended use: internal planning</strong><span>Public reporting, benchmark comparison, allocation optimization, and assurance-ready claims are blocked.</span>${status("Blocked", "risk")}</li>
          </ul>
        </section>
        ${renderFeatureFlagPanel()}
      </aside>
    </div>
  `;
}

function renderSroiResults() {
  return `
    <section class="section" aria-labelledby="result-title">
      <div class="result-hero">
        <div>
          <h2 id="result-title">Exploratory SROI method context</h2>
          <p class="result-number">3.9<small>x</small></p>
          <p class="result-summary">$3.90 of estimated social value for every $1 invested, with a plausible range from ${demoProject.range}. This is method context inside the Impact Account, not a publishable SROI claim.</p>
          <div class="status-row" aria-label="Result status">
            ${status("Exploratory result", "estimated")}
            ${status(methodologySafety.sroiEligibility.label, "risk")}
            ${status(methodologySafety.reportingGuard.label, "risk")}
          </div>
          <div class="callout">
            <strong>Recommended next decision</strong>
            Use the Impact Account and contribution narrative for internal planning only after the transport-barrier assumption and six-month employment duration evidence are reviewed.
          </div>
        </div>
        <dl class="metrics" aria-label="SROI metrics">
          <div class="metric"><dt>Investment</dt><dd><strong>${demoProject.investment}</strong></dd></div>
          <div class="metric"><dt>Exploratory social value</dt><dd><strong>${demoProject.socialValue}</strong></dd></div>
          <div class="metric"><dt>Net present value</dt><dd><strong>$3.5M</strong></dd></div>
          <div class="metric"><dt>Eligibility status</dt><dd><strong>${methodologySafety.sroiEligibility.status}</strong></dd></div>
          <div class="metric"><dt>Evidence coverage</dt><dd><strong>${demoProject.coverage}</strong></dd></div>
        </dl>
      </div>
    </section>
    <div class="content-grid">
      <div class="main">
        ${renderValueBridge()}
        ${renderAssumptionsLab(true)}
        ${renderStateGrid("Required product states", "The pilot defines how exploratory SROI context behaves when evidence is not ready.")}
      </div>
      <aside class="panel-stack" aria-label="Review and decision panels">
        ${renderAssumptionPanel()}
        ${renderSdgPanel()}
        ${renderDecisionPanel()}
      </aside>
    </div>
  `;
}

function renderValueBridge() {
  return `
    <section class="section chart-block" aria-labelledby="bridge-title">
      <div class="section-header">
        <div>
          <h2 id="bridge-title">Exploratory value bridge</h2>
          <p>The largest uncertainty is whether transport barriers reduce sustained employment for rural participants. This bridge remains internal method context until eligibility review is complete.</p>
        </div>
        ${status("Exploratory Only", "review")}
      </div>
      <svg class="bridge-chart" viewBox="0 0 820 320" role="img" aria-labelledby="bridge-svg-title bridge-svg-desc">
        <title id="bridge-svg-title">Social value bridge from gross value to net value</title>
        <desc id="bridge-svg-desc">Gross value starts at 5.8 million dollars. Deadweight, attribution, displacement, and drop-off reduce the estimate to 4.7 million dollars.</desc>
        <line x1="70" y1="250" x2="760" y2="250" stroke="#9aa99f" stroke-width="1"></line>
        ${[
          ["90", "70", "180", "$5.8M", "Gross", "#087f8c"],
          ["220", "114", "136", "-$0.55M", "Deadweight", "#a66a00"],
          ["350", "144", "106", "-$0.32M", "Attribution", "#a66a00"],
          ["480", "190", "60", "-$0.14M", "Displace", "#b2403a"],
          ["610", "166", "84", "-$0.29M", "Drop-off", "#6f4bb5"],
          ["720", "104", "146", "$4.7M", "Net", "#2f7d32"]
        ]
          .map(
            ([x, y, height, value, label, color]) => `
              <g>
                <rect x="${x}" y="${y}" width="90" height="${height}" fill="${color}"></rect>
                <text x="${Number(x) + 45}" y="${Number(y) - 14}" text-anchor="middle" fill="#14211d" font-size="18" font-weight="700">${value}</text>
                <text x="${Number(x) + 45}" y="278" text-anchor="middle" fill="#2c3934" font-size="14">${label}</text>
              </g>`
          )
          .join("")}
      </svg>
      <div class="chart-table-wrapper">
        <table>
          <caption>Bridge data table</caption>
          <thead><tr><th scope="col">Item</th><th scope="col">Value</th><th scope="col">Evidence status</th><th scope="col">Decision effect</th></tr></thead>
          <tbody>
            <tr><td>Gross outcome value</td><td>$5.8M</td><td>Derived from approved outcomes</td><td>Sets upper boundary</td></tr>
            <tr><td>Deadweight</td><td>-$0.55M</td><td>Estimated from local labor trend</td><td>Moderate effect</td></tr>
            <tr><td>Attribution</td><td>-$0.32M</td><td>Needs partner validation</td><td>Moderate effect</td></tr>
            <tr><td>Displacement</td><td>-$0.14M</td><td>Low risk reviewed</td><td>Low effect</td></tr>
            <tr><td>Drop-off</td><td>-$0.29M</td><td>Needs six-month follow-up</td><td>High effect</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderEvidenceReview() {
  return `
    <section class="section" aria-labelledby="source-title">
      <div class="section-header">
        <div>
          <h2 id="source-title">Connected evidence sources</h2>
          <p>Each source carries provenance, permission, freshness, quality, and the claims it can support.</p>
        </div>
        ${status("2 need attention", "review")}
      </div>
      <div class="source-grid">
        ${[
          ["Program proposal", "Original intervention design, target population, intended outcomes, and delivery model.", "Human approved", "approved", "Scope, Theory of Change, SDG suggestions"],
          ["FY 2026 budget", "Investment boundary, staff time, participant support, and site operating costs.", "Observed", "verified", "Investment, NPV, payback"],
          ["Monitoring dataset", "Enrollment, completion, employment entry, and six-month follow-up records.", "Partial sample", "estimated", "Reach, outcomes, persistence"],
          ["Stakeholder interviews", "Participant barriers, missing voices, rural transport constraints, and unintended effects.", "Needs review", "review", "Materiality, harms, equity"]
        ]
          .map(
            ([title, text, label, tone, usedFor]) => `
              <article class="source-card">
                <div><h3>${title}</h3><p>${text}</p></div>
                <dl class="source-meta">
                  <div><dt>Status</dt><dd>${status(label, tone)}</dd></div>
                  <div><dt>Used for</dt><dd>${usedFor}</dd></div>
                </dl>
              </article>`
          )
          .join("")}
      </div>
    </section>
    <div class="content-grid">
      <section class="section" aria-labelledby="claim-title">
        <div class="section-header">
          <div>
            <h2 id="claim-title">Extracted claim review</h2>
            <p>Accept, edit, reject, or assign claims before they can shape method context, SDG, benchmark, or report language.</p>
          </div>
        </div>
        <div class="evidence-toolbar" aria-label="Evidence filters">
          <div class="segmented-control" role="group" aria-label="Filter claims by status">
            <button class="segment is-active" type="button" data-filter="all" aria-pressed="true">All</button>
            <button class="segment" type="button" data-filter="needs-review" aria-pressed="false">Needs review</button>
            <button class="segment" type="button" data-filter="approved" aria-pressed="false">Approved</button>
            <button class="segment" type="button" data-filter="conflict" aria-pressed="false">Conflict</button>
          </div>
          <p class="filter-note" aria-live="polite" data-filter-note>Showing all extracted claims.</p>
        </div>
        <div class="table-wrapper">
          <table class="claim-table">
            <caption>Extracted claims and downstream effects</caption>
            <thead><tr><th scope="col">Claim</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Affects</th><th scope="col">Review action</th></tr></thead>
            <tbody>
              ${[
                ["approved", "820 enrolled participants", "Unique records after duplicate check.", "Monitoring dataset", "Approved", "approved", "Reach, cost per participant", "Lineage", "secondary"],
                ["approved", "704 completed training", "Completion counted after attendance and assessment threshold.", "Monitoring dataset", "Approved", "approved", "Outcome rate, SDG 4.4", "Lineage", "secondary"],
                ["needs-review", "351 sustained employment outcomes", "Follow-up coverage is 62%; rural response rate is lower.", "Monitoring dataset", "Needs review", "review", "Method eligibility, confidence, report disclosure", "Assign", "primary"],
                ["conflict", "$1.2M investment boundary", "Finance export excludes donated facilities; proposal includes them.", "Budget and proposal", "Conflict", "risk", "Investment boundary, NPV, benchmark comparability", "Resolve", "primary"],
                ["needs-review", "Transport is a material rural barrier", "Interview evidence indicates lower completion, but sample is small.", "Stakeholder interviews", "Needs review", "review", "Equity, SDG 10.2, next action", "Request", "primary"],
                ["approved", "Wage progression proxy", "Local wage proxy approved for 2025 price year.", "Valuation library", "Verified source", "verified", "Gross value, social value bridge", "Lineage", "secondary"]
              ]
                .map(
                  ([filter, claim, detail, source, label, tone, affects, action, buttonTone]) => `
                    <tr data-filter-target="${filter}">
                      <td><strong>${claim}</strong><span>${detail}</span></td>
                      <td>${source}</td>
                      <td>${status(label, tone)}</td>
                      <td>${affects}</td>
                      <td><button class="button ${buttonTone} compact" type="button" data-open-drawer>${action}</button></td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
      <aside class="panel-stack" aria-label="Evidence priorities">
        ${renderGapPanel()}
        ${renderConflictPanel()}
        ${renderDownstreamPanel()}
      </aside>
    </div>
    ${renderStateGrid("Evidence queue states", "The review queue defines its non-happy paths before the workflow expands.")}
  `;
}

function renderQuickStart() {
  const uploadStatus = getEvidenceUploadStatus();

  return `
    <section class="section" aria-labelledby="upload-title">
      <div class="section-header">
        <div>
          <h2 id="upload-title">Upload existing materials</h2>
          <p>The first useful result should come from documents the organization already has.</p>
        </div>
        ${status("Demo ready", "approved")}
      </div>
      <div class="upload-flow-grid">
        <div class="upload-dropzone">
          <label for="evidence-upload">Proposal, evaluation, budget, or dataset</label>
          <input id="evidence-upload" data-evidence-upload type="file" multiple>
          <p data-upload-status aria-live="polite">${escapeHtml(uploadStatus.detail)}</p>
          <ul class="upload-file-list" data-upload-file-list>
            <li>No files selected.</li>
          </ul>
        </div>
        <div class="upload-control-panel">
          <div class="section-header compact-header">
            <div>
              <h3>Supabase evidence intake</h3>
              <p data-upload-readiness>${escapeHtml(uploadStatus.detail)}</p>
            </div>
            <span data-upload-badge>${status(uploadStatus.label, uploadStatus.tone)}</span>
          </div>
          <div class="auth-form">
            <label for="auth-email">Reviewer email</label>
            <div class="inline-form">
              <input id="auth-email" data-auth-email type="email" autocomplete="email" placeholder="name@example.org">
              <button class="button secondary compact" type="button" data-request-magic-link>Send link</button>
            </div>
            <p class="filter-note" data-auth-status aria-live="polite">${uploadStatus.configured ? "Magic links use your Supabase Auth settings." : "Add Supabase env values to enable live sign-in."}</p>
          </div>
          <ol class="journey-rail" aria-label="Upload to insight steps">
            <li><strong>1. Connect</strong><span>Upload or select sample workspace.</span></li>
            <li><strong>2. Store</strong><span>Create private evidence object and source metadata.</span></li>
            <li><strong>3. Review</strong><span>Accept, edit, reject, or assign evidence tasks.</span></li>
            <li><strong>4. Decide</strong><span>Move into Impact Account, sensitivity, and report workflows.</span></li>
          </ol>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="first-insight-title">
      <div class="section-header">
        <div>
          <h2 id="first-insight-title">First insight generated</h2>
          <p>A reviewable starting model, not an approved analysis.</p>
        </div>
        ${status("Requires human review", "review")}
      </div>
      <div class="insight-grid">
        ${[
          ["People affected", "820 enrolled, 704 completed, 468 entered employment, 351 sustained employment for six months."],
          ["Candidate outcomes", "Employment entry, sustained earnings, improved confidence, reduced benefit dependence, and rural access barriers."],
          ["Evidence gaps", "Six-month follow-up coverage, transport barrier validation, donated facilities investment boundary."],
          ["Comparable evidence", "Six internal and public workforce projects can inform priors, but SROI comparison stays blocked until comparability review is complete."],
          ["SDG suggestions", "Target 8.5 measured contribution, Target 4.4 contributes to, Target 10.2 needs review."],
          ["Next action", "Send the evidence review queue to M&E and finance before publishing any result."]
        ]
          .map((item) => `<article class="insight-card"><h3>${item[0]}</h3><p>${item[1]}</p></article>`)
          .join("")}
      </div>
    </section>
    ${renderAppMap()}
  `;
}

function renderOutcomeRows(outcomes = demoOutcomes, indicators = demoIndicators, stakeholders = demoStakeholders) {
  const stakeholderById = new Map(stakeholders.map((stakeholder) => [stakeholder.id, stakeholder]));
  const indicatorsByOutcome = indicators.reduce((map, indicator) => {
    const list = map.get(indicator.outcome_id) || [];
    list.push(indicator);
    map.set(indicator.outcome_id, list);
    return map;
  }, new Map());

  return outcomes
    .slice()
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((outcome) => {
      const stakeholder = stakeholderById.get(outcome.stakeholder_id);
      const primaryIndicator = indicatorsByOutcome.get(outcome.id)?.[0];
      const changeLabel = outcome.change_type === "negative" ? "Negative effect" : "Positive change";

      return `
        <tr>
          <td>
            <strong>${escapeHtml(outcome.name)}</strong>
            <span>${escapeHtml(outcome.description || "No description recorded.")}</span>
          </td>
          <td>${escapeHtml(stakeholder?.name || "Stakeholder not linked")}<span>${escapeHtml(stakeholder?.segment || "Segment not set")}</span></td>
          <td>${escapeHtml(primaryIndicator?.name || "Indicator needed")}<span>${escapeHtml(formatMetric(primaryIndicator?.observed_value, primaryIndicator?.unit))}</span></td>
          <td>${status(formatLabel(outcome.evidence_status), evidenceTone(outcome.evidence_status))}</td>
          <td>${status(formatLabel(outcome.valuation_readiness), reviewTone(outcome.valuation_readiness))}</td>
          <td><strong>${escapeHtml(changeLabel)}</strong><span>${escapeHtml(outcome.decision_note || "Decision note needed.")}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderOutcomeTaskItems(tasks = demoOutcomeTasks) {
  return tasks
    .slice()
    .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0))
    .map(
      (task) => `
        <li>
          <span class="priority-rank">${escapeHtml(task.priority || "-")}</span>
          <div>
            <strong>${escapeHtml(task.title)}</strong>
            <p>${escapeHtml(formatLabel(task.task_type))} for ${escapeHtml(task.affected_area || "project model")}. Due ${escapeHtml(task.due_on || "not set")}.</p>
          </div>
        </li>
      `
    )
    .join("");
}

function renderOutcomesWorkspace() {
  const backend = getBackendStatus();

  return `
    <section class="section" aria-labelledby="model-title">
      <div class="section-header">
        <div>
          <h2 id="model-title">Outcome model canvas</h2>
          <p>Each outcome must connect a stakeholder, material change, indicator, evidence status, valuation readiness, and decision effect.</p>
        </div>
        ${status("Materiality review", "review")}
      </div>
      <div class="outcome-map" aria-label="Theory of change chain">
        ${[
          ["Inputs and activities", "Training, coaching, employer matching, participant support, and transport mitigation."],
          ["People affected", "Adult job seekers, rural participants, employers, families, and public support systems."],
          ["Material outcomes", "Employment, wage progression, confidence, reduced emergency support reliance, and possible transport burden."],
          ["Evidence and value", "Every outcome needs a source, indicator, validation path, proxy decision, and confidence treatment."]
        ]
          .map((item) => `<article class="outcome-step"><span>${item[0]}</span><p>${item[1]}</p></article>`)
          .join("")}
      </div>
    </section>

    <div class="outcomes-workspace-grid">
      <section class="section" aria-labelledby="register-title">
        <div class="section-header">
          <div>
            <h2 id="register-title">Outcome register</h2>
            <p data-outcomes-source>${backend.configured ? "Loading Supabase outcomes for the demo project." : "Showing demo outcomes until Supabase is configured."}</p>
          </div>
          <span data-backend-badge>${status(backend.configured ? "Supabase loading" : "Demo fallback", backend.configured ? "review" : "estimated")}</span>
        </div>
        <div class="table-wrapper">
          <table class="outcome-table">
            <caption>Outcome register with stakeholders, indicators, evidence, valuation readiness, and decision effect</caption>
            <thead>
              <tr>
                <th scope="col">Outcome</th>
                <th scope="col">Stakeholder</th>
                <th scope="col">Indicator</th>
                <th scope="col">Evidence</th>
                <th scope="col">Valuation</th>
                <th scope="col">Decision effect</th>
              </tr>
            </thead>
            <tbody data-outcomes-table-body>
              ${renderOutcomeRows()}
            </tbody>
          </table>
        </div>
      </section>

      <aside class="panel-stack" aria-label="Outcome governance">
        <section class="panel" aria-labelledby="backend-title">
          <div class="section-header">
            <div>
              <h2 id="backend-title">Backend readiness</h2>
              <p data-backend-detail>${escapeHtml(backend.detail)}</p>
            </div>
            <span data-backend-status>${status(backend.label, backend.configured ? "verified" : "estimated")}</span>
          </div>
          <dl class="backend-list">
            <div><dt>Project ID</dt><dd data-backend-project>${escapeHtml(backend.projectId)}</dd></div>
            <div><dt>Read path</dt><dd>outcomes, indicators, stakeholders, review_tasks</dd></div>
            <div><dt>Write rule</dt><dd>Blocked in prototype until auth and reviewer roles are wired.</dd></div>
          </dl>
        </section>

        <section class="panel" aria-labelledby="outcome-tasks-title">
          <div class="section-header">
            <div>
              <h2 id="outcome-tasks-title">Outcome review queue</h2>
              <p>Tasks are ranked by materiality, method effect, confidence effect, and participant burden.</p>
            </div>
          </div>
          <ol class="priority-list" data-outcome-task-list>
            ${renderOutcomeTaskItems()}
          </ol>
        </section>
      </aside>
    </div>

    <section class="section" aria-labelledby="validation-title">
      <div class="section-header">
        <div>
          <h2 id="validation-title">Stakeholder validation and boundaries</h2>
          <p>ImpactPulse should show whose voice is represented, whose may be missing, and which outcomes are not yet safe to value.</p>
        </div>
        ${status("Publication blocked", "risk")}
      </div>
      <div class="validation-grid">
        <article class="validation-item">
          <span>Represented</span>
          <strong>Participants completing training</strong>
          <p>Monitoring records and placement data support reach, completion, and wage progression.</p>
        </article>
        <article class="validation-item">
          <span>Underrepresented</span>
          <strong>Rural participants</strong>
          <p>Interview sample is too small to approve the transport-burden or SDG 10.2 claim.</p>
        </article>
        <article class="validation-item">
          <span>Excluded for now</span>
          <strong>Employer productivity gain</strong>
          <p>Useful context, but not counted until stakeholder materiality and attribution are reviewed.</p>
        </article>
      </div>
    </section>

    ${renderStateGrid("Outcome workspace states", "The outcomes page must support empty models, partial indicators, Supabase errors, and incomplete valuation readiness.")}
  `;
}

function renderAssumptionsLab(embedded = false) {
  return `
    <section class="section" id="sensitivity" aria-labelledby="sensitivity-title">
      <div class="section-header">
        <div>
          <h2 id="sensitivity-title">Sensitivity workshop</h2>
          <p>Adjust the most influential assumptions to see whether the decision changes.</p>
        </div>
        ${status(embedded ? "Draft scenario" : "Live recalculation", "review")}
      </div>
      <div class="assumption-controls">
        <div class="assumption-control">
          <label for="deadweight">Deadweight estimate</label>
          <input id="deadweight" data-assumption-input type="range" min="12" max="36" value="24">
          <div class="control-meta"><span>Lower external trend</span><span>Higher external trend</span></div>
        </div>
        <div class="assumption-control">
          <label for="attribution">Partner attribution share</label>
          <input id="attribution" data-assumption-input type="range" min="8" max="34" value="18">
          <div class="control-meta"><span>ImpactPulse share higher</span><span>Partner share higher</span></div>
        </div>
        <div class="assumption-control">
          <label for="duration">Employment duration in months</label>
          <input id="duration" data-assumption-input type="range" min="3" max="12" value="6">
          <div class="control-meta"><span>Shorter persistence</span><span>Longer persistence</span></div>
        </div>
      </div>
      <div class="mini-result" aria-live="polite">
        <span>Scenario result</span>
        <strong data-sroi-output>3.9x</strong>
        <span>Confidence <b data-confidence-output>74%</b></span>
      </div>
    </section>
  `;
}

function renderDecisionRoom() {
  return `
    <div class="content-grid">
      <section class="section" aria-labelledby="decision-options-title">
        <div class="section-header">
          <div>
            <h2 id="decision-options-title">Decision options</h2>
            <p>Each option carries evidence, method eligibility, risk, equity, dissent, and next owner.</p>
          </div>
          ${status("Decision draft", "review")}
        </div>
        <div class="option-grid">
          ${[
            ["Approve internal planning case", "Use the Impact Account contribution narrative, keep exploratory SROI internal, and fund the transport evidence task.", "Recommended"],
            ["Delay decision", "Wait for six-month follow-up and finance boundary resolution before any action.", "Lower risk"],
            ["Scale with condition", "Expand to one additional site only if rural transport mitigation is funded.", "Conditional"]
          ]
            .map((item) => `<article class="option-card"><span>${item[2]}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`)
            .join("")}
        </div>
      </section>
      <aside class="panel-stack" aria-label="Decision support">
        ${renderDownstreamPanel()}
        ${renderAssumptionPanel()}
      </aside>
    </div>
  `;
}

function renderReports() {
  return `
    <section class="section" aria-labelledby="report-title">
      <div class="section-header">
        <div>
          <h2 id="report-title">Report editions</h2>
          <p>Reports are generated from approved evidence and disclose methodology versions, limitations, and readiness status.</p>
        </div>
        ${status("Not publishable", "review")}
      </div>
      <div class="insight-grid">
        ${[
          ["Executive brief", "Decision, Impact Account status, confidence, major assumptions, and required action."],
          ["Technical SROI appendix", "Exploratory value map, eligibility gaps, evidence lineage, adjustments, sensitivity, and calculation version."],
          ["Assurance package", "Frozen data, source registry, proxy approvals, methodology checklist, and gaps."],
          ["Community summary", "Plain-language outcomes, stakeholder validation, limitations, harms, and next steps."]
        ]
          .map((item) => `<article class="insight-card"><h3>${item[0]}</h3><p>${item[1]}</p></article>`)
          .join("")}
      </div>
    </section>
    ${renderStateGrid("Report states", "Audience-specific output must never change approved findings.")}
  `;
}

function renderDataQuality() {
  return `
    <section class="section" aria-labelledby="quality-title">
      <div class="section-header">
        <div>
          <h2 id="quality-title">Evidence quality profile</h2>
          <p>Quality is evaluated before evidence can change method eligibility, confidence, SDG language, benchmark eligibility, or report readiness.</p>
        </div>
        ${status("Developing", "review")}
      </div>
      <div class="quality-summary-grid">
        ${[
          ["Evidence coverage", "74%", "Reviewed claims with approved or traceable sources.", "approved"],
          ["Sufficiency", "68%", "Enough for internal planning, not public reporting.", "review"],
          ["Conflict exposure", "2", "Material conflicts affect investment boundary and follow-up.", "risk"],
          ["Assurance gaps", "4", "Open gaps touch SVI principles 1, 4, 5, and 6.", "estimated"]
        ]
          .map(
            ([label, value, text, tone]) => `
              <article class="quality-score">
                <span class="quality-label">${label}</span>
                <strong>${value}</strong>
                <p>${text}</p>
                ${status(tone === "risk" ? "Blocks publication" : tone === "approved" ? "Usable" : "Needs treatment", tone)}
              </article>`
          )
          .join("")}
      </div>
    </section>

    <div class="content-grid">
      <section class="section" aria-labelledby="matrix-title">
        <div class="section-header">
          <div>
            <h2 id="matrix-title">Quality dimensions and treatments</h2>
            <p>Each dimension shows current condition, downstream effect, and the treatment required before approval.</p>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="quality-table">
            <caption>Data quality matrix</caption>
            <thead>
              <tr>
                <th scope="col">Dimension</th>
                <th scope="col">Current finding</th>
                <th scope="col">Affects</th>
                <th scope="col">Treatment</th>
                <th scope="col">Owner</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Completeness</strong>${status("Needs review", "review")}</td>
                <td>Six-month follow-up covers 62% of sustained employment claim.</td>
                <td>Method eligibility, confidence, report disclosure.</td>
                <td>Collect missing follow-up or apply conservative case.</td>
                <td>M&E</td>
              </tr>
              <tr>
                <td><strong>Representativeness</strong>${status("Material gap", "estimated")}</td>
                <td>Rural participants are underrepresented in stakeholder interviews.</td>
                <td>Equity, harms, SDG 10.2, decision conditions.</td>
                <td>Add rural interview sample before equity claim approval.</td>
                <td>Program</td>
              </tr>
              <tr>
                <td><strong>Validity</strong>${status("Conflict", "risk")}</td>
                <td>Budget export and proposal disagree on donated facilities.</td>
                <td>Investment boundary, NPV, benchmark comparability.</td>
                <td>Finance and methodology reviewer must record boundary decision.</td>
                <td>Finance</td>
              </tr>
              <tr>
                <td><strong>Provenance</strong>${status("Traceable", "verified")}</td>
                <td>Monitoring records preserve source, transformation, and reviewer path.</td>
                <td>Evidence lineage, assurance package, report appendix.</td>
                <td>No treatment required; keep version locked.</td>
                <td>Analyst</td>
              </tr>
              <tr>
                <td><strong>Permission</strong>${status("Approved", "approved")}</td>
                <td>Internal use is permitted; public reporting needs final disclosure review.</td>
                <td>Report publication, benchmark sharing, public summary.</td>
                <td>Confirm report-purpose permission before export.</td>
                <td>Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="panel-stack" aria-label="Data quality priorities">
        <section class="panel" aria-labelledby="collection-title">
          <div class="section-header">
            <div>
              <h2 id="collection-title">Collection plan</h2>
              <p>Prioritized by materiality, method effect, confidence effect, effort, and participant burden.</p>
            </div>
          </div>
          <ol class="priority-list">
            <li><span class="priority-rank">1</span><div><strong>Complete six-month follow-up</strong><p>Highest confidence effect. Use phone and text follow-up before changing outcome value.</p></div></li>
            <li><span class="priority-rank">2</span><div><strong>Validate rural transport barrier</strong><p>Required for equity treatment and SDG 10.2 claim language.</p></div></li>
            <li><span class="priority-rank">3</span><div><strong>Resolve investment boundary</strong><p>Finance decision needed before external comparison or assurance package.</p></div></li>
          </ol>
        </section>

        <section class="panel" aria-labelledby="gating-title">
          <div class="section-header">
            <div>
              <h2 id="gating-title">Approval gates</h2>
              <p>Data quality controls what the product is allowed to say.</p>
            </div>
          </div>
          <ul class="task-list">
            <li class="task"><strong>Internal planning</strong><span>Allowed with visible caveats and draft confidence.</span>${status("Allowed", "approved")}</li>
            <li class="task"><strong>Public SROI claim</strong><span>Blocked until follow-up and boundary conflicts are treated.</span>${status("Blocked", "risk")}</li>
            <li class="task"><strong>Assurance package</strong><span>Can be prepared, but readiness remains Developing.</span>${status("Needs treatment", "review")}</li>
          </ul>
        </section>
      </aside>
    </div>

    <section class="section" aria-labelledby="treatment-title">
      <div class="section-header">
        <div>
          <h2 id="treatment-title">Treatment log</h2>
          <p>Treatments must be visible, versioned, and linked to every affected result.</p>
        </div>
      </div>
      <div class="treatment-timeline">
        ${[
          ["Conservative case applied", "Sustained employment uses central case but report displays low case until follow-up improves."],
          ["Conflict frozen", "Investment boundary cannot update the value bridge until finance review records the treatment."],
          ["Equity claim held", "Rural transport finding can guide action but cannot become a measured equity claim yet."],
          ["Lineage preserved", "Monitoring transformations remain traceable in the evidence graph and report appendix."]
        ]
          .map((item) => `<article class="treatment-item"><h3>${item[0]}</h3><p>${item[1]}</p></article>`)
          .join("")}
      </div>
    </section>

    ${renderStateGrid("Data quality states", "The quality page must remain useful when sources are missing, partial, conflicting, or still being profiled.")}
  `;
}

function renderWorkspaceRoute(route) {
  return `
    <div class="content-grid">
      <section class="section" aria-labelledby="workspace-title">
        <div class="section-header">
          <div>
            <h2 id="workspace-title">Build-ready route</h2>
            <p>This route is part of the full product spine and is ready for the next detailed screen pass.</p>
          </div>
          ${status("Mapped", "approved")}
        </div>
        <div class="insight-grid">
          ${(route.capabilities || [])
            .map((capability) => `<article class="insight-card"><h3>${capability}</h3><p>${route.nextBuild}</p></article>`)
            .join("")}
        </div>
      </section>
      <aside class="panel-stack" aria-label="Route governance">
        <section class="panel" aria-labelledby="route-next-title">
          <div class="section-header">
            <div>
              <h2 id="route-next-title">Next build decision</h2>
              <p>${route.nextBuild}</p>
            </div>
          </div>
          <ul class="task-list">
            <li class="task"><strong>Reuse system shell</strong><span>Use shared route, header, rail, status, table, and panel patterns.</span></li>
            <li class="task"><strong>Connect demo data</strong><span>Use the same workforce project so every result stays traceable.</span></li>
            <li class="task"><strong>Add route audit</strong><span>Keep desktop, tablet, and mobile screenshots in the quality workflow.</span></li>
          </ul>
        </section>
      </aside>
    </div>
    ${renderAppMap()}
  `;
}

function renderAppMap() {
  return `
    <section class="section" aria-labelledby="map-title">
      <div class="section-header">
        <div>
          <h2 id="map-title">Full product spine</h2>
          <p>Every route keeps the same project, evidence, assumptions, decisions, and report readiness connected.</p>
        </div>
      </div>
      <div class="app-map-grid">
        ${routeDefinitions
          .map(
            (route) => `
              <a class="route-card" href="${routeHref(route.path)}">
                <span>${route.kicker}</span>
                <strong>${route.title}</strong>
                <small>${route.lead}</small>
              </a>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderBenchmarksWorkspace() {
  return `
    ${renderSafetyBanner()}
    <div class="content-grid">
      <section class="section" aria-labelledby="benchmark-title">
        <div class="section-header">
          <div>
            <h2 id="benchmark-title">Benchmark comparability gate</h2>
            <p>Benchmarking can support learning, but SROI comparison is blocked until the cohort is comparable across boundaries, stakeholders, outcomes, evidence maturity, periods, methods, and proxy quality.</p>
          </div>
          ${status(methodologySafety.benchmarkEligibility.label, "risk")}
        </div>
        <div class="method-grid">
          ${[
            ["Same population", "Partial", "Adult workforce participants match broadly; rural access mix differs."],
            ["Same outcome set", "Needs review", "Employment and wage progression align, but transport burden is missing in two peer records."],
            ["Same cost boundary", "Blocked", "Donated facilities treatment is unresolved for the current project."],
            ["Same evidence maturity", "Blocked", "Follow-up coverage and stakeholder validation are weaker than the proposed peers."],
            ["Same valuation basis", "Needs review", "Proxy source, price year, transferability, and lower-grade proxy treatment must be normalized."],
            ["Same reporting intent", "Blocked", "Public ratio comparison is not allowed while SROI remains Exploratory Only."]
          ]
            .map(
              ([criterion, finding, detail]) => `
                <article class="method-card">
                  <span>${finding}</span>
                  <h3>${criterion}</h3>
                  <p>${detail}</p>
                </article>`
            )
            .join("")}
        </div>
        <div class="callout risk-callout">
          <strong>Benchmark rule</strong>
          Do not rank, average, or compare SROI ratios across projects until the comparability gate is complete. Show peer evidence as context only.
        </div>
      </section>
      <aside class="panel-stack" aria-label="Benchmark governance">
        ${renderFeatureFlagPanel()}
        ${renderDownstreamPanel()}
      </aside>
    </div>
  `;
}

function renderAssuranceMatrix() {
  return `
    <div class="content-grid">
      <section class="section" aria-labelledby="assurance-title">
        <div class="section-header">
          <div>
            <h2 id="assurance-title">Assurance readiness matrix</h2>
            <p>Assurance is not a single badge. Each dimension keeps its own evidence, reviewer, treatment, and blocked claim.</p>
          </div>
          ${status("Assurance matrix required", "review")}
        </div>
        <div class="eligibility-grid">
          ${[
            ["Principles alignment", "Needs review", "SVI principles are mapped, but materiality and valuation exclusions need reviewer sign-off."],
            ["Stakeholder engagement", "Blocked", methodologySafety.stakeholderLegitimacy.detail],
            ["Data verification", "Partial", "Monitoring lineage is traceable; follow-up coverage and rural interviews remain incomplete."],
            ["Calculation reproduction", "Exploratory", "The value bridge is visible, but SROI cannot be treated as decision-grade yet."],
            ["Proxy review", "Needs review", "Approved wage proxy is separated from lower-grade proxies pending transferability review."],
            ["Report assurance", "Blocked", methodologySafety.reportingGuard.detail]
          ]
            .map(
              ([dimension, statusLabel, detail]) => `
                <article class="eligibility-item">
                  <span>${dimension}</span>
                  <strong>${statusLabel}</strong>
                  <p>${detail}</p>
                </article>`
            )
            .join("")}
        </div>
      </section>
      <aside class="panel-stack" aria-label="Assurance treatments">
        ${renderSroiEligibilitySnapshot()}
        ${renderDecisionPanel()}
      </aside>
    </div>
  `;
}

function renderGapPanel() {
  return `
    <section class="panel" aria-labelledby="gap-title">
      <div class="section-header">
        <div>
          <h2 id="gap-title">Highest-value gaps</h2>
          <p>Ranked by materiality, method effect, confidence effect, and decision value.</p>
        </div>
      </div>
      <ol class="priority-list">
        <li><span class="priority-rank">1</span><div><strong>Six-month employment follow-up</strong><p>Could lower exploratory value, change method eligibility, and reduce confidence by 12 points.</p></div></li>
        <li><span class="priority-rank">2</span><div><strong>Transport-barrier validation</strong><p>Required before equity claim and SDG 10.2 language can be approved.</p></div></li>
        <li><span class="priority-rank">3</span><div><strong>Investment boundary decision</strong><p>Resolve donated facilities treatment before external comparison.</p></div></li>
      </ol>
    </section>
  `;
}

function renderConflictPanel() {
  return `
    <section class="panel" aria-labelledby="conflict-title">
      <div class="section-header">
        <div>
          <h2 id="conflict-title">Conflict requiring decision</h2>
          <p>Two sources disagree on whether in-kind facilities belong in the investment boundary.</p>
        </div>
      </div>
      <div class="conflict-card">
        <dl>
          <div><dt>Budget export</dt><dd>$1.2M cash investment</dd></div>
          <div><dt>Proposal appendix</dt><dd>$1.36M including facilities</dd></div>
          <div><dt>Required reviewer</dt><dd>Finance user and methodology reviewer</dd></div>
        </dl>
        <button class="button primary" type="button">Open resolution</button>
      </div>
    </section>
  `;
}

function renderDownstreamPanel() {
  return `
    <section class="panel" aria-labelledby="impact-title">
      <div class="section-header">
        <div>
          <h2 id="impact-title">Downstream impact</h2>
          <p>Current unresolved items affect these outputs.</p>
        </div>
      </div>
      <ul class="task-list">
        <li class="task"><strong>SROI eligibility</strong><span>Exploratory Only until stakeholder legitimacy, proxy quality, and harm review pass.</span>${status("Not for public reporting", "risk")}</li>
        <li class="task"><strong>Impact Account</strong><span>Decision narrative can proceed with visible caveats and unmonetized outcomes.</span>${status("Internal planning", "approved")}</li>
        <li class="task"><strong>SDG claims</strong><span>Target 10.2 cannot move past Needs Review.</span></li>
        <li class="task"><strong>Assurance readiness</strong><span>Principles 1, 4, 5, and 6 have open gaps.</span></li>
      </ul>
    </section>
  `;
}

function renderAssumptionPanel() {
  return `
    <section class="panel" aria-labelledby="assumptions-title">
      <div class="section-header">
        <div>
          <h2 id="assumptions-title">Assumptions needing review</h2>
          <p>Every material assumption must show source, confidence, and effect.</p>
        </div>
      </div>
      <ul class="task-list">
        <li class="task"><strong>Transport barrier adjustment</strong><span>High method effect. Rural completion gap remains unresolved.</span>${status("Needs evidence", "review")}</li>
        <li class="task"><strong>Six-month employment persistence</strong><span>Follow-up sample covers 62% of sustained employment claim.</span>${status("Estimated", "estimated")}</li>
        <li class="task"><strong>Wage progression proxy</strong><span>Approved local proxy, price year 2025.</span>${status("Approved", "approved")}</li>
      </ul>
    </section>
  `;
}

function renderSdgPanel() {
  return `
    <section class="panel" aria-labelledby="sdg-title">
      <div class="section-header">
        <div>
          <h2 id="sdg-title">SDG target claims</h2>
          <p>Claims are limited by evidence level and human approval.</p>
        </div>
      </div>
      <ul class="sdg-list">
        <li class="sdg-item"><h3>Target 8.5 <span class="claim-level">Measured contribution</span></h3><p>Employment outcome has approved indicator, geography, and participant evidence.</p></li>
        <li class="sdg-item"><h3>Target 4.4 <span class="claim-level">Contributes to</span></h3><p>Training completion supports skills pathway; outcome evidence is partial.</p></li>
        <li class="sdg-item"><h3>Target 10.2 <span class="claim-level">Needs review</span></h3><p>Equity claim requires review of rural access and transport barriers.</p></li>
      </ul>
    </section>
  `;
}

function renderDecisionPanel() {
  return `
    <section class="panel" id="decision" aria-labelledby="decision-title">
      <div class="section-header">
        <div>
          <h2 id="decision-title">Decision package</h2>
          <p>Internal planning decision, not public reporting.</p>
        </div>
      </div>
      <ul class="task-list">
        <li class="task"><strong>Approve internal scenario</strong><span>Owner: impact advisor. Due: 12 July 2026.</span></li>
        <li class="task"><strong>Assign evidence task</strong><span>Owner: program manager. Confirm rural transport barrier.</span></li>
        <li class="task"><strong>Hold publication</strong><span>External claims disabled until assurance readiness improves.</span></li>
      </ul>
    </section>
  `;
}

function renderStateGrid(title, text) {
  return `
    <section class="section" aria-labelledby="states-title">
      <div class="section-header">
        <div>
          <h2 id="states-title">${title}</h2>
          <p>${text}</p>
        </div>
      </div>
      <div class="state-grid">
        <div class="state-card"><strong>Loading</strong><p>Reserve space without shifting layout.</p></div>
        <div class="state-card"><strong>Empty</strong><p>Explain what is missing and where to start.</p></div>
        <div class="state-card"><strong>Error</strong><p>Preserve user work and show a retry path.</p></div>
        <div class="state-card"><strong>Incomplete</strong><p>Allow review while blocking publication.</p></div>
      </div>
    </section>
  `;
}

function renderDrawer(route) {
  return `
    <section class="drawer" data-drawer aria-hidden="true" aria-labelledby="drawer-title" role="dialog" aria-modal="true">
      <div class="drawer-panel">
        <div class="drawer-header">
          <div>
            <p class="project-kicker">${route.kicker}</p>
            <h2 id="drawer-title">Trace and challenge</h2>
          </div>
          <button class="icon-button" type="button" data-close-drawer aria-label="Close panel">x</button>
        </div>
        <p>Use this panel to inspect source lineage, challenge assumptions, and create review tasks before any result is approved or published.</p>
        <ol class="drawer-list">
          <li>Which evidence supports this claim?</li>
          <li>Which assumption most changes the decision?</li>
          <li>Which affected group could be missing?</li>
          <li>Does any SDG or benchmark language exceed the evidence?</li>
          <li>What review task should happen next?</li>
        </ol>
        <button class="button primary" type="button">Create review task</button>
      </div>
    </section>
  `;
}

function renderRouteView(route) {
  if (route.view === "impactAccount") return renderImpactAccountOverview();
  if (route.view === "methodGate") return renderMethodSelectionWorkspace();
  if (route.view === "benchmarks") return renderBenchmarksWorkspace();
  if (route.view === "assurance") return renderAssuranceMatrix();
  if (route.view === "sroi") return renderSroiResults();
  if (route.view === "quickStart") return renderQuickStart();
  if (route.view === "evidence") return renderEvidenceReview();
  if (route.view === "dataQuality") return renderDataQuality();
  if (route.view === "outcomes") return renderOutcomesWorkspace();
  if (route.view === "assumptions") return `<div class="content-grid"><div class="main">${renderAssumptionsLab(false)}${renderAppMap()}</div><aside class="panel-stack">${renderAssumptionPanel()}${renderDownstreamPanel()}</aside></div>`;
  if (route.view === "decision") return renderDecisionRoom();
  if (route.view === "reports") return renderReports();
  return renderWorkspaceRoute(route);
}

async function hydrateRoute(route) {
  if (route.view !== "outcomes") {
    return;
  }

  const backend = getBackendStatus();

  if (!backend.configured) {
    return;
  }

  const sourceNote = document.querySelector("[data-outcomes-source]");
  const backendBadge = document.querySelector("[data-backend-badge]");
  const backendStatus = document.querySelector("[data-backend-status]");
  const backendDetail = document.querySelector("[data-backend-detail]");
  const tableBody = document.querySelector("[data-outcomes-table-body]");
  const taskList = document.querySelector("[data-outcome-task-list]");

  try {
    const workspace = await loadOutcomesWorkspace();
    const hasOutcomes = workspace.outcomes.length > 0;

    if (hasOutcomes && tableBody) {
      tableBody.innerHTML = renderOutcomeRows(
        workspace.outcomes,
        workspace.indicators,
        workspace.stakeholders
      );
    }

    if (workspace.tasks.length > 0 && taskList) {
      taskList.innerHTML = renderOutcomeTaskItems(workspace.tasks);
    }

    if (sourceNote) {
      sourceNote.textContent = hasOutcomes
        ? `Loaded ${workspace.outcomes.length} outcome${workspace.outcomes.length === 1 ? "" : "s"} from Supabase.`
        : "Supabase connected, but no outcomes were returned for the demo project. Demo rows remain visible.";
    }

    if (backendBadge) {
      backendBadge.innerHTML = status(hasOutcomes ? "Supabase live" : "Supabase empty", hasOutcomes ? "verified" : "review");
    }

    if (backendStatus) {
      backendStatus.innerHTML = status("RLS read attempted", "verified");
    }

    if (backendDetail) {
      backendDetail.textContent = hasOutcomes
        ? "Rows were read through the anon key. RLS controls whether the signed-in user can see organization data."
        : "Configuration is present. Check seed data, project ID, and membership policies if rows should appear.";
    }
  } catch (error) {
    if (sourceNote) {
      sourceNote.textContent = "Supabase could not load outcomes. Demo rows remain visible.";
    }

    if (backendBadge) {
      backendBadge.innerHTML = status("Supabase error", "risk");
    }

    if (backendStatus) {
      backendStatus.innerHTML = status("Read failed", "risk");
    }

    if (backendDetail) {
      backendDetail.textContent = error instanceof Error ? error.message : "Unknown Supabase error.";
    }
  }
}

function renderApp() {
  const route = currentRoute();
  document.title = `ImpactPulse ${route.title}`;
  app.innerHTML = `
    ${renderHeader(route)}
    <div class="layout">
      ${renderStepRail(route)}
      <main class="main" id="main">
        ${renderProjectHeader(route)}
        ${renderRouteView(route)}
        <p class="footer-note">ImpactPulse prototype spine: evidence, assumptions, decisions, reports, portfolio, benchmarks, SDG claims, and assurance stay connected.</p>
      </main>
    </div>
    ${renderDrawer(route)}
  `;
  bindInteractions();
  void hydrateRoute(route);
}

function bindInteractions() {
  captureAuthSessionFromUrl();

  const drawer = document.querySelector("[data-drawer]");
  const openDrawerButtons = document.querySelectorAll("[data-open-drawer]");
  const closeDrawerButton = document.querySelector("[data-close-drawer]");
  const sroiOutput = document.querySelector("[data-sroi-output]");
  const confidenceOutput = document.querySelector("[data-confidence-output]");
  const assumptionInputs = document.querySelectorAll("[data-assumption-input]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const filterTargets = document.querySelectorAll("[data-filter-target]");
  const filterNote = document.querySelector("[data-filter-note]");
  const uploadInput = document.querySelector("[data-evidence-upload]");
  const uploadStatus = document.querySelector("[data-upload-status]");
  const uploadReadiness = document.querySelector("[data-upload-readiness]");
  const uploadBadge = document.querySelector("[data-upload-badge]");
  const uploadFileList = document.querySelector("[data-upload-file-list]");
  const authEmail = document.querySelector("[data-auth-email]");
  const authButton = document.querySelector("[data-request-magic-link]");
  const authStatus = document.querySelector("[data-auth-status]");
  let lastFocusedElement = null;

  function updateUploadReadiness() {
    const readiness = getEvidenceUploadStatus();
    if (uploadStatus) uploadStatus.textContent = readiness.detail;
    if (uploadReadiness) uploadReadiness.textContent = readiness.detail;
    if (uploadBadge) uploadBadge.innerHTML = status(readiness.label, readiness.tone);
  }

  function openDrawer() {
    lastFocusedElement = document.activeElement;
    drawer?.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-open");
    closeDrawerButton?.focus();
  }

  function closeDrawer() {
    drawer?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
    lastFocusedElement?.focus();
  }

  openDrawerButtons.forEach((button) => button.addEventListener("click", openDrawer));
  closeDrawerButton?.addEventListener("click", closeDrawer);
  drawer?.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer?.getAttribute("aria-hidden") === "false") closeDrawer();
  });

  function updateScenario() {
    const values = Array.from(assumptionInputs).map((input) => Number(input.value));
    const deadweight = values[0] ?? 24;
    const attribution = values[1] ?? 18;
    const duration = values[2] ?? 6;
    const sroi = Math.max(1.6, 4.7 - deadweight * 0.025 - attribution * 0.018 + duration * 0.12);
    const confidence = Math.max(48, Math.min(82, 74 - Math.abs(duration - 6) * 2 - Math.max(0, attribution - 18) * 0.6));
    if (sroiOutput) sroiOutput.textContent = `${sroi.toFixed(1)}x`;
    if (confidenceOutput) confidenceOutput.textContent = `${Math.round(confidence)}%`;
  }

  assumptionInputs.forEach((input) => input.addEventListener("input", updateScenario));
  updateScenario();

  function updateClaimFilter(filter) {
    let visibleCount = 0;
    filterTargets.forEach((row) => {
      const isVisible = filter === "all" || row.dataset.filterTarget === filter;
      row.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (filterNote) {
      const label =
        filter === "all"
          ? "all extracted claims"
          : `${visibleCount} ${filter.replace("-", " ")} claim${visibleCount === 1 ? "" : "s"}`;
      filterNote.textContent = `Showing ${label}.`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => updateClaimFilter(button.dataset.filter || "all"));
  });

  updateUploadReadiness();

  authButton?.addEventListener("click", async () => {
    const email = authEmail?.value.trim();

    if (!email) {
      if (authStatus) authStatus.textContent = "Enter a reviewer email before requesting a magic link.";
      authEmail?.focus();
      return;
    }

    authButton.disabled = true;
    if (authStatus) authStatus.textContent = "Requesting magic link...";

    try {
      await requestMagicLink(email);
      if (authStatus) authStatus.textContent = "Magic link sent. Return here after opening it.";
    } catch (error) {
      if (authStatus) {
        authStatus.textContent = error instanceof Error ? error.message : "Magic link request failed.";
      }
    } finally {
      authButton.disabled = false;
      updateUploadReadiness();
    }
  });

  uploadInput?.addEventListener("change", async () => {
    const files = Array.from(uploadInput.files || []);

    if (!files.length) {
      if (uploadFileList) uploadFileList.innerHTML = "<li>No files selected.</li>";
      updateUploadReadiness();
      return;
    }

    const readiness = getEvidenceUploadStatus();
    if (uploadFileList) {
      uploadFileList.innerHTML = files
        .map((file) => `<li><strong>${escapeHtml(file.name)}</strong><span>Ready to process.</span></li>`)
        .join("");
    }

    if (!readiness.configured || !readiness.signedIn) {
      if (uploadStatus) {
        uploadStatus.textContent = readiness.configured
          ? "Files are selected. Sign in before uploading to Supabase."
          : "Files are selected in demo mode. Add Supabase config for live upload.";
      }
      return;
    }

    if (uploadStatus) uploadStatus.textContent = `Uploading ${files.length} file${files.length === 1 ? "" : "s"} to Supabase...`;

    const results = [];
    for (const file of files) {
      try {
        results.push(await uploadEvidenceFile(file, {
          organizationId: demoProject.organizationId,
          projectId: demoProject.id
        }));
      } catch (error) {
        results.push({
          uploaded: false,
          title: file.name,
          detail: error instanceof Error ? error.message : "Upload failed."
        });
      }
    }

    if (uploadFileList) {
      uploadFileList.innerHTML = results
        .map(
          (result) => `
            <li>
              <strong>${escapeHtml(result.title)}</strong>
              <span>${escapeHtml(result.uploaded ? "Uploaded to Supabase." : result.detail)}</span>
            </li>
          `
        )
        .join("");
    }

    if (uploadStatus) {
      const uploadedCount = results.filter((result) => result.uploaded).length;
      uploadStatus.textContent = `${uploadedCount} of ${results.length} file${results.length === 1 ? "" : "s"} uploaded.`;
    }
  });
}

if (app) {
  renderApp();
}
