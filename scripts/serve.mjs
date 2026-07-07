import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.cwd());
const defaultPort = Number(process.env.PORT || 4173);
const demoProjectId = "00000000-0000-4000-8000-000000000101";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function isInsideRoot(filePath) {
  const normalizedRoot = root.endsWith(sep) ? root : `${root}${sep}`;
  return filePath === root || filePath.startsWith(normalizedRoot);
}

function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const normalizedPath = normalize(cleanPath).replace(/^([/\\])+/, "");
  let filePath = resolve(root, normalizedPath || "index.html");

  if (!isInsideRoot(filePath)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath)) {
    filePath = resolve(root, "index.html");
  }

  return isInsideRoot(filePath) ? filePath : null;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return env;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return env;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
}

function loadRuntimeEnv() {
  return {
    ...parseEnvFile(resolve(root, ".env")),
    ...parseEnvFile(resolve(root, ".env.local")),
    ...process.env
  };
}

function createPublicConfig() {
  const env = loadRuntimeEnv();
  const forceDemoMode = env.IMPACTPULSE_FORCE_DEMO_MODE === "1";
  const supabaseUrl =
    forceDemoMode
      ? ""
      : env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    forceDemoMode
      ? ""
      : env.SUPABASE_ANON_KEY ||
        env.SUPABASE_PUBLISHABLE_KEY ||
        env.VITE_SUPABASE_ANON_KEY ||
        env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        "";

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseSchema: env.SUPABASE_SCHEMA || "public",
    supabaseDemoProjectId: env.SUPABASE_DEMO_PROJECT_ID || demoProjectId,
    hasSupabaseConfig: Boolean(supabaseUrl && supabaseAnonKey)
  };
}

export function createStaticServer({ port = defaultPort, host = "127.0.0.1" } = {}) {
  const server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);

    if (requestPath === "/config.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(`window.ImpactPulseConfig = ${JSON.stringify(createPublicConfig())};\n`);
      return;
    }

    const filePath = resolveRequestPath(request.url || "/");

    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });

    createReadStream(filePath).pipe(response);
  });

  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolveServer({
        server,
        origin: `http://${host}:${address.port}`
      });
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { origin } = await createStaticServer({ port: defaultPort });
  console.log(`ImpactPulse prototype running at ${origin}`);
}
