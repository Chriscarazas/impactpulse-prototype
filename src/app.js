const demoProject = {
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
    nav: "Projects",
    title: "SROI Results",
    kicker: "SROI Results",
    activeStep: 7,
    lead: "Estimated social value, evidence strength, and next decision for a multi-site workforce-development program.",
    action: "Request approval",
    view: "sroi"
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
    lead: "Review the sources and extracted claims that feed outcomes, assumptions, SDG mappings, and the 3.9x SROI result.",
    action: "Assign evidence tasks",
    view: "evidence"
  },
  {
    path: "/data-quality/",
    nav: "Data Quality",
    title: "Data Quality Overview",
    kicker: "Measurement trust",
    activeStep: 4,
    lead: "Profile sufficiency, conflicts, coverage, gaps, and treatments before evidence can drive SROI or assurance claims.",
    action: "Create collection plan",
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
    capabilities: ["Theory of Change", "Outcome register", "Indicator mapping", "Materiality review"],
    nextBuild: "Connect every outcome to evidence, stakeholder validation, and valuation readiness."
  },
  {
    path: "/valuation/",
    nav: "Valuation",
    title: "Financial Proxy Workspace",
    kicker: "Value method",
    activeStep: 5,
    lead: "Select, localize, justify, and approve financial proxies before social value can be calculated.",
    action: "Approve proxy set",
    capabilities: ["Proxy search", "Price year", "Localization", "Approval trail"],
    nextBuild: "Add proxy comparison and Value Map reconciliation."
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
    title: "Organization Impact Overview",
    kicker: "Portfolio intelligence",
    activeStep: null,
    lead: "Aggregate projects by country, theme, funder, or portfolio without double counting reach, outcomes, investment, or value.",
    action: "Review portfolio",
    capabilities: ["Coverage disclosure", "Aggregate SROI", "Evidence-adjusted result", "Theme and country drill-down"],
    nextBuild: "Use approved project data to create trustworthy organization-level impact views."
  },
  {
    path: "/benchmarks/",
    nav: "Benchmarks",
    title: "Benchmark Cohort Builder",
    kicker: "Comparable evidence",
    activeStep: null,
    lead: "Construct defensible peer cohorts and block comparisons when methods, populations, outcomes, or evidence maturity are misaligned.",
    action: "Build cohort",
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
    title: "Assurance Readiness",
    kicker: "Verification",
    activeStep: 10,
    lead: "Separate methodology readiness, technical reproducibility, evidence sufficiency, report disclosure, and external assurance status.",
    action: "Create remediation plan",
    capabilities: ["SVI principles", "Technical checks", "Frozen snapshot", "Assurance package"],
    nextBuild: "Turn readiness gaps into assigned remediation tasks."
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

function status(label, tone = "approved") {
  return `<span class="status ${tone}">${label}</span>`;
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
    <aside class="side-rail" aria-label="Guided SROI process">
      <p class="rail-title">Guided SROI</p>
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
        <a href="${routeHref("/portfolio/")}">Portfolio</a>
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
          route.path === "/" ? "Start upload flow" : "Return to SROI results"
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

function renderSroiResults() {
  return `
    <section class="section" aria-labelledby="result-title">
      <div class="result-hero">
        <div>
          <h2 id="result-title">Estimated social value result</h2>
          <p class="result-number">3.9<small>x</small></p>
          <p class="result-summary">$3.90 of estimated social value for every $1 invested, with a plausible range from ${demoProject.range}.</p>
          <div class="status-row" aria-label="Result status">
            ${status("Estimated result", "estimated")}
            ${status("Moderate confidence", "review")}
            ${status("Human-reviewed model", "approved")}
          </div>
          <div class="callout">
            <strong>Recommended next decision</strong>
            Approve the analysis for internal planning only after the transport-barrier assumption and six-month employment duration evidence are reviewed.
          </div>
        </div>
        <dl class="metrics" aria-label="SROI metrics">
          <div class="metric"><dt>Investment</dt><dd><strong>${demoProject.investment}</strong></dd></div>
          <div class="metric"><dt>Estimated social value</dt><dd><strong>${demoProject.socialValue}</strong></dd></div>
          <div class="metric"><dt>Net present value</dt><dd><strong>$3.5M</strong></dd></div>
          <div class="metric"><dt>Probability above 1.0x</dt><dd><strong>91%</strong></dd></div>
          <div class="metric"><dt>Evidence coverage</dt><dd><strong>${demoProject.coverage}</strong></dd></div>
        </dl>
      </div>
    </section>
    <div class="content-grid">
      <div class="main">
        ${renderValueBridge()}
        ${renderAssumptionsLab(true)}
        ${renderStateGrid("Required product states", "The pilot defines how SROI Results behaves when evidence is not ready.")}
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
          <h2 id="bridge-title">Gross-to-net value bridge</h2>
          <p>The largest uncertainty is whether transport barriers reduce sustained employment for rural participants.</p>
        </div>
        ${status("Traceable", "verified")}
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
            <p>Accept, edit, reject, or assign claims before they can shape SROI, SDG, benchmark, or report language.</p>
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
                ["needs-review", "351 sustained employment outcomes", "Follow-up coverage is 62%; rural response rate is lower.", "Monitoring dataset", "Needs review", "review", "SROI range, confidence, report disclosure", "Assign", "primary"],
                ["conflict", "$1.2M investment boundary", "Finance export excludes donated facilities; proposal includes them.", "Budget and proposal", "Conflict", "risk", "Central SROI, NPV, benchmark comparability", "Resolve", "primary"],
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
          <input id="evidence-upload" type="file" multiple>
          <p>Prototype mode uses prepared demo data for the workforce-development project.</p>
        </div>
        <ol class="journey-rail" aria-label="Upload to insight steps">
          <li><strong>1. Connect</strong><span>Upload or select sample workspace.</span></li>
          <li><strong>2. Extract</strong><span>Find sources, claims, costs, outcomes, and assumptions.</span></li>
          <li><strong>3. Review</strong><span>Accept, edit, reject, or assign evidence tasks.</span></li>
          <li><strong>4. Decide</strong><span>Move into SROI, sensitivity, and report workflows.</span></li>
        </ol>
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
          ["Comparable evidence", "Six internal and public workforce projects can inform priors, but only three are SROI-comparable."],
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
            <p>Each option carries evidence, SROI effect, risk, equity, dissent, and next owner.</p>
          </div>
          ${status("Decision draft", "review")}
        </div>
        <div class="option-grid">
          ${[
            ["Approve internal planning case", "Use 3.9x central case, hold public claims, fund transport evidence task.", "Recommended"],
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
          ["Executive brief", "Decision, central result, range, confidence, major assumptions, and required action."],
          ["Technical SROI report", "Value map, evidence lineage, adjustments, sensitivity, and calculation version."],
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

function renderGapPanel() {
  return `
    <section class="panel" aria-labelledby="gap-title">
      <div class="section-header">
        <div>
          <h2 id="gap-title">Highest-value gaps</h2>
          <p>Ranked by materiality, SROI effect, confidence effect, and decision value.</p>
        </div>
      </div>
      <ol class="priority-list">
        <li><span class="priority-rank">1</span><div><strong>Six-month employment follow-up</strong><p>Could move SROI from 3.9x to 3.2x and lower confidence by 12 points.</p></div></li>
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
          <div><dt>Required reviewer</dt><dd>Finance user and SROI practitioner</dd></div>
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
        <li class="task"><strong>SROI Results</strong><span>Range, confidence, and recommendation remain draft.</span></li>
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
        <li class="task"><strong>Transport barrier adjustment</strong><span>High SROI effect. Rural completion gap remains unresolved.</span>${status("Needs evidence", "review")}</li>
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
  if (route.view === "sroi") return renderSroiResults();
  if (route.view === "quickStart") return renderQuickStart();
  if (route.view === "evidence") return renderEvidenceReview();
  if (route.view === "assumptions") return `<div class="content-grid"><div class="main">${renderAssumptionsLab(false)}${renderAppMap()}</div><aside class="panel-stack">${renderAssumptionPanel()}${renderDownstreamPanel()}</aside></div>`;
  if (route.view === "decision") return renderDecisionRoom();
  if (route.view === "reports") return renderReports();
  return renderWorkspaceRoute(route);
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
}

function bindInteractions() {
  const drawer = document.querySelector("[data-drawer]");
  const openDrawerButtons = document.querySelectorAll("[data-open-drawer]");
  const closeDrawerButton = document.querySelector("[data-close-drawer]");
  const sroiOutput = document.querySelector("[data-sroi-output]");
  const confidenceOutput = document.querySelector("[data-confidence-output]");
  const assumptionInputs = document.querySelectorAll("[data-assumption-input]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const filterTargets = document.querySelectorAll("[data-filter-target]");
  const filterNote = document.querySelector("[data-filter-note]");
  let lastFocusedElement = null;

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
}

if (app) {
  renderApp();
}
