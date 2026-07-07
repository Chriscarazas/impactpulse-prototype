const defaultConfig = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseSchema: "public",
  supabaseDemoProjectId: "00000000-0000-4000-8000-000000000101",
  hasSupabaseConfig: false
};

function runtimeConfig() {
  return {
    ...defaultConfig,
    ...(window.ImpactPulseConfig || {})
  };
}

function normalizeSupabaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function hasClientConfig(config = runtimeConfig()) {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function getHeaders(config) {
  return {
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${config.supabaseAnonKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "Accept-Profile": config.supabaseSchema || "public"
  };
}

async function selectRows(table, { select = "*", filters = {}, order } = {}) {
  const config = runtimeConfig();

  if (!hasClientConfig(config)) {
    return { configured: false, rows: [] };
  }

  const params = new URLSearchParams({ select });

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, `eq.${value}`);
    }
  }

  if (order) {
    params.set("order", order);
  }

  const response = await fetch(`${normalizeSupabaseUrl(config.supabaseUrl)}/rest/v1/${table}?${params}`, {
    headers: getHeaders(config)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase ${table} request failed: ${response.status} ${message}`);
  }

  return {
    configured: true,
    rows: await response.json()
  };
}

export function getBackendStatus() {
  const config = runtimeConfig();

  if (!hasClientConfig(config)) {
    return {
      configured: false,
      label: "Demo mode",
      detail: "Supabase is not configured for this local session.",
      projectId: config.supabaseDemoProjectId
    };
  }

  return {
    configured: true,
    label: "Supabase ready",
    detail: "The browser can read public-schema rows through the anon key and RLS.",
    projectId: config.supabaseDemoProjectId
  };
}

export async function loadOutcomesWorkspace() {
  const status = getBackendStatus();
  const projectId = status.projectId;

  if (!status.configured) {
    return {
      ...status,
      source: "demo",
      outcomes: [],
      indicators: [],
      tasks: []
    };
  }

  const [outcomesResult, indicatorsResult, stakeholdersResult, tasksResult] = await Promise.all([
    selectRows("outcomes", {
      filters: { project_id: projectId },
      order: "sort_order.asc"
    }),
    selectRows("indicators", {
      filters: { project_id: projectId },
      order: "created_at.asc"
    }),
    selectRows("stakeholders", {
      filters: { project_id: projectId },
      order: "created_at.asc"
    }),
    selectRows("review_tasks", {
      filters: { project_id: projectId },
      order: "priority.asc"
    })
  ]);

  return {
    ...status,
    source: "supabase",
    outcomes: outcomesResult.rows,
    indicators: indicatorsResult.rows,
    stakeholders: stakeholdersResult.rows,
    tasks: tasksResult.rows
  };
}
