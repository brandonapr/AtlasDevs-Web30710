import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const configText = await readFile(join(root, "Diseño WEB", "js", "supabase-config.js"), "utf8");
const users = JSON.parse(await readFile(join(root, "Diseño WEB", "data", "usuarios-prueba.json"), "utf8")).usuarios;

const url = configText.match(/https:\/\/[^"]+\.supabase\.co/)?.[0];
const key = configText.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];

if (!url || !key) {
  throw new Error("No se pudo leer la URL o publishable key de Supabase.");
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`
};

async function request(path, options = {}) {
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return data;
}

const products = await request("/rest/v1/productos?select=id,nombre,precio,imagen&order=id.asc");
console.log(`Productos en Supabase: ${products.length}`);

const product02 = products.find((product) => product.id === "02");
console.log(`Producto 02: ${product02 ? `${product02.nombre} (${product02.imagen})` : "no encontrado"}`);

if (process.argv.includes("--auth")) {
  for (const user of users) {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: user.email,
        password: user.clave_sugerida
      })
    });

    const authData = await response.json();
    if (!response.ok) {
      console.log(`${user.usuario}: no autentica (${authData.error_description || authData.msg || authData.error})`);
      continue;
    }

    const perfiles = await request("/rest/v1/perfiles?select=email,nombre,rol", {
      headers: {
        Authorization: `Bearer ${authData.access_token}`
      }
    });
    const perfil = perfiles[0];
    console.log(`${user.usuario}: login ok -> ${perfil?.rol || "sin perfil"}`);
  }
}
