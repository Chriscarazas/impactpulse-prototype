const defaultConfig = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseSchema: "public",
  supabaseDemoProjectId: "00000000-0000-4000-8000-000000000101",
  hasSupabaseConfig: false
};
const authSessionKey = "impactpulse.supabase.session";
const evidenceBucket = "impact-evidence";

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

function getHeaders(config, { accessToken, includeProfile = true } = {}) {
  return {
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${accessToken || config.supabaseAnonKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(includeProfile
      ? {
          "Accept-Profile": config.supabaseSchema || "public",
          "Content-Profile": config.supabaseSchema || "public"
        }
      : {})
  };
}

function storedSession() {
  try {
    const rawSession = window.sessionStorage.getItem(authSessionKey);

    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession);
    const expiresAt = Number(session.expiresAt || 0);

    if (!session.accessToken || expiresAt < Date.now() + 60000) {
      window.sessionStorage.removeItem(authSessionKey);
      return null;
    }

    return session;
  } catch {
    window.sessionStorage.removeItem(authSessionKey);
    return null;
  }
}

function storeSession(session) {
  window.sessionStorage.setItem(authSessionKey, JSON.stringify(session));
}

function safeFileName(fileName) {
  return fileName
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    || "evidence-file";
}

function encodeObjectPath(path) {
  return path.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function inferSourceType(file) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) return "document";
  if (type.includes("spreadsheet") || type.includes("excel") || name.endsWith(".csv")) return "dataset";
  if (type.includes("image")) return "image";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "document";
  return "upload";
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

export function captureAuthSessionFromUrl() {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");

  if (!accessToken) {
    return storedSession();
  }

  const expiresIn = Number(params.get("expires_in") || 3600);
  const session = {
    accessToken,
    refreshToken: params.get("refresh_token") || "",
    tokenType: params.get("token_type") || "bearer",
    expiresAt: Date.now() + expiresIn * 1000
  };

  storeSession(session);
  window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
  return session;
}

export function getEvidenceUploadStatus() {
  const backend = getBackendStatus();
  const session = storedSession();

  if (!backend.configured) {
    return {
      configured: false,
      signedIn: false,
      label: "Demo upload",
      tone: "estimated",
      detail: "Files are queued locally until Supabase is configured."
    };
  }

  if (!session) {
    return {
      configured: true,
      signedIn: false,
      label: "Sign-in needed",
      tone: "review",
      detail: "Request a magic link before uploading evidence to Supabase Storage."
    };
  }

  return {
    configured: true,
    signedIn: true,
    label: "Upload ready",
    tone: "verified",
    detail: "Signed-in users with organization roles can upload evidence files."
  };
}

export async function requestMagicLink(email) {
  const config = runtimeConfig();

  if (!hasClientConfig(config)) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local.");
  }

  const response = await fetch(`${normalizeSupabaseUrl(config.supabaseUrl)}/auth/v1/otp`, {
    method: "POST",
    headers: getHeaders(config, { includeProfile: false }),
    body: JSON.stringify({
      email,
      create_user: true,
      options: {
        email_redirect_to: window.location.href.split("#")[0]
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Magic link request failed: ${response.status} ${message}`);
  }

  return true;
}

export async function uploadEvidenceFile(file, { organizationId, projectId }) {
  const config = runtimeConfig();
  const session = storedSession();

  if (!hasClientConfig(config)) {
    return {
      uploaded: false,
      mode: "demo",
      title: file.name,
      detail: "Supabase is not configured, so the file remains in the local demo queue."
    };
  }

  if (!session) {
    throw new Error("Sign in with a magic link before uploading evidence.");
  }

  const sourceId = crypto.randomUUID();
  const filename = safeFileName(file.name);
  const storagePath = `${organizationId}/${projectId}/${sourceId}/${filename}`;
  const storageUrl = `${normalizeSupabaseUrl(config.supabaseUrl)}/storage/v1/object/${evidenceBucket}/${encodeObjectPath(storagePath)}`;
  const storageResponse = await fetch(storageUrl, {
    method: "POST",
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false"
    },
    body: file
  });

  if (!storageResponse.ok) {
    const message = await storageResponse.text();
    throw new Error(`Evidence file upload failed: ${storageResponse.status} ${message}`);
  }

  const metadataResponse = await fetch(`${normalizeSupabaseUrl(config.supabaseUrl)}/rest/v1/evidence_sources`, {
    method: "POST",
    headers: {
      ...getHeaders(config, { accessToken: session.accessToken }),
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      organization_id: organizationId,
      project_id: projectId,
      title: file.name,
      source_type: inferSourceType(file),
      permission_status: "needs_review",
      quality_status: "needs_review",
      storage_path: storagePath
    })
  });

  if (!metadataResponse.ok) {
    const message = await metadataResponse.text();
    throw new Error(`Evidence metadata creation failed: ${metadataResponse.status} ${message}`);
  }

  const [source] = await metadataResponse.json();

  return {
    uploaded: true,
    mode: "supabase",
    title: file.name,
    source,
    storagePath,
    detail: "Evidence file and source metadata were created in Supabase."
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
