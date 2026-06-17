import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        if (separator < 1) return [line, ""];
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      })
  );
}

async function loadLocalEnv() {
  try {
    return parseEnv(await readFile(join(root, ".env"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Falta .env. Crea el archivo local con SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SUPABASE_SECRET_KEY."
      );
    }
    throw error;
  }
}

async function findDesignDirectory() {
  const entries = await readdir(root, { withFileTypes: true });
  const directory = entries.find(
    (entry) => entry.isDirectory() && entry.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "Diseno WEB"
  );

  if (!directory) {
    throw new Error("No se encontro la carpeta Diseño WEB.");
  }

  return directory.name;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof data === "object"
        ? data?.msg || data?.message || data?.error_description || data?.error
        : data;
    throw new Error(`${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`);
  }

  return data;
}

const env = await loadLocalEnv();
const supabaseUrl = env.SUPABASE_URL;
const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;
const adminKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl?.startsWith("https://") || !supabaseUrl.endsWith(".supabase.co")) {
  throw new Error("SUPABASE_URL no tiene un formato valido.");
}

if (!publishableKey) {
  throw new Error("Falta SUPABASE_PUBLISHABLE_KEY en .env.");
}

if (!adminKey || adminKey.includes("COLOCAR_AQUI") || adminKey.includes("REEMPLAZAR_")) {
  throw new Error(
    "Falta SUPABASE_SECRET_KEY (recomendada) o SUPABASE_SERVICE_ROLE_KEY (legacy) en .env."
  );
}

const designDirectory = await findDesignDirectory();
const usersPath = join(root, designDirectory, "data", "usuarios-prueba.json");
const users = JSON.parse(await readFile(usersPath, "utf8")).usuarios;

const adminHeaders = {
  apikey: adminKey,
  Authorization: `Bearer ${adminKey}`,
  "Content-Type": "application/json"
};

async function adminRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      ...adminHeaders,
      ...(options.headers || {})
    }
  });
  return parseResponse(response);
}

async function auditTable(table) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
    headers: adminHeaders
  });
  await parseResponse(response);
  console.log(`Tabla ${table}: OK`);
}

async function loadAuthUsers() {
  const usersByEmail = new Map();
  let page = 1;

  while (true) {
    const result = await adminRequest(`/auth/v1/admin/users?page=${page}&per_page=100`);
    const pageUsers = result?.users || [];

    for (const user of pageUsers) {
      if (user.email) usersByEmail.set(user.email.toLowerCase(), user);
    }

    if (pageUsers.length < 100) break;
    page += 1;
  }

  return usersByEmail;
}

async function createOrResetUser(user, existing) {
  const payload = {
    email: user.email,
    password: user.clave_sugerida,
    email_confirm: true,
    user_metadata: {
      nombre: user.nombre,
      rol: user.rol
    }
  };

  if (existing) {
    const updated = await adminRequest(`/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    console.log(`${user.usuario}: usuario actualizado`);
    return updated;
  }

  const created = await adminRequest("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  console.log(`${user.usuario}: usuario creado`);
  return created;
}

async function upsertProfile(user, authUser) {
  const encodedEmail = encodeURIComponent(user.email);
  const existingProfilesResponse = await fetch(
    `${supabaseUrl}/rest/v1/perfiles?select=id,email,rol&email=eq.${encodedEmail}`,
    { headers: adminHeaders }
  );
  const existingProfiles = await parseResponse(existingProfilesResponse);
  const staleProfiles = (existingProfiles || []).filter((profile) => profile.id !== authUser.id);

  for (const staleProfile of staleProfiles) {
    const deleteResponse = await fetch(
      `${supabaseUrl}/rest/v1/perfiles?id=eq.${encodeURIComponent(staleProfile.id)}`,
      {
        method: "DELETE",
        headers: adminHeaders
      }
    );
    await parseResponse(deleteResponse);
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/perfiles?on_conflict=id`, {
    method: "POST",
    headers: {
      ...adminHeaders,
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: authUser.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    })
  });
  const profiles = await parseResponse(response);
  const profile = profiles?.[0];

  if (!profile || profile.rol !== user.rol) {
    throw new Error(`No se pudo verificar el perfil de ${user.usuario}.`);
  }

  console.log(`${user.usuario}: perfil ${profile.rol} vinculado`);
}

console.log("Auditando esquema Supabase...");
for (const table of ["productos", "pedidos", "pedido_items", "perfiles"]) {
  await auditTable(table);
}

console.log("Sincronizando usuarios internos...");
const existingUsers = await loadAuthUsers();

for (const user of users) {
  const existing = existingUsers.get(user.email.toLowerCase());
  const authUser = await createOrResetUser(user, existing);
  await upsertProfile(user, authUser);
}

console.log("Configuracion de usuarios y perfiles completada.");
