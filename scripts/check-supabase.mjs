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
console.log(
  `Producto 02: ${
    product02 ? `${product02.nombre} - $${Number(product02.precio).toFixed(2)} (${product02.imagen})` : "no encontrado"
  }`
);

if (!product02 || Number(product02.precio) !== 1) {
  throw new Error("El Bolon mixto debe tener precio 1.00 en Supabase.");
}

if (process.argv.includes("--auth")) {
  const failures = [];

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
      failures.push(user.usuario);
      continue;
    }

    const perfiles = await request("/rest/v1/perfiles?select=email,nombre,rol", {
      headers: {
        Authorization: `Bearer ${authData.access_token}`
      }
    });
    const perfil = perfiles[0];
    if (perfil?.rol !== user.rol) {
      console.log(`${user.usuario}: perfil incorrecto (${perfil?.rol || "sin perfil"})`);
      failures.push(user.usuario);
      continue;
    }

    console.log(`${user.usuario}: login ok -> ${perfil.rol}`);
  }

  if (failures.length > 0) {
    throw new Error(`Fallaron las credenciales o perfiles de: ${failures.join(", ")}.`);
  }
}
