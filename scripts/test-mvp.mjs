import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

function parseEnv(text) {
  return Object.fromEntries(
    text.split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "")];
      })
  );
}

let envText = "";
try {
  envText = await readFile(join(root, ".env"), "utf8");
} catch (error) {
  if (error.code === "ENOENT") {
    throw new Error(
      "Falta .env. Crea el archivo local desde .env.example y completa SUPABASE_SECRET_KEY antes de ejecutar test:mvp."
    );
  }
  throw error;
}

const env = parseEnv(envText);
const users = JSON.parse(
  await readFile(join(root, "Diseño WEB", "data", "usuarios-prueba.json"), "utf8")
).usuarios;
const url = env.SUPABASE_URL;
const publicKey = env.SUPABASE_PUBLISHABLE_KEY;
const adminKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publicKey || !adminKey) throw new Error("Faltan variables Supabase en .env.");

const runId = Date.now().toString().slice(-8);
const orderCode = `QA-MVP-${runId}`;
const productId = `QA-${runId}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, { method = "GET", body, token = publicKey, key = publicKey, prefer } = {}) {
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(data?.message || data?.msg || data?.error_description || text || response.statusText);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function rpc(name, params, token = publicKey) {
  return request(`/rest/v1/rpc/${name}`, { method: "POST", body: params, token });
}

async function login(role) {
  const user = users.find((item) => item.rol === role);
  const response = await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: user.email, password: user.clave_sugerida }
  });
  return response.access_token;
}

async function cleanup() {
  const admin = { token: adminKey, key: adminKey };
  await request(`/rest/v1/pedidos?codigo=eq.${encodeURIComponent(orderCode)}`, { method: "DELETE", ...admin });
  await request(`/rest/v1/productos?id=eq.${encodeURIComponent(productId)}`, { method: "DELETE", ...admin });
}

try {
  const created = await rpc("registrar_pedido_publico", {
    p_codigo: orderCode,
    p_mesa: "Mesa QA",
    p_nombre_cliente: "Prueba MVP",
    p_observacion: "Pedido temporal automatizado",
    p_items: [{ producto_id: "02", cantidad: 1, observacion_item: "-" }]
  });
  assert(created.estado === "pendiente", "RF02: el pedido debe iniciar pendiente.");
  assert(Number(created.total) === 1, "RF02: el total debe usar el precio real de Supabase.");
  console.log("RF01-RF02: menu y registro transaccional OK");

  const modified = await rpc("modificar_pedido_pendiente", {
    p_codigo: orderCode,
    p_mesa: "Mesa QA 2",
    p_nombre_cliente: "Prueba MVP editada",
    p_observacion: "Modificado antes de cocina",
    p_items: [{ producto_id: "02", cantidad: 2, observacion_item: "Bien dorado" }]
  });
  assert(Number(modified.total) === 2 && modified.mesa === "Mesa QA 2", "RF03: no se aplico la modificacion.");
  console.log("RF03: modificacion de pedido pendiente OK");

  const cajaToken = await login("caja");
  const cocinaToken = await login("cocinero");
  const meseraToken = await login("mesera");
  const adminToken = await login("administradora");

  await rpc("cambiar_estado_pedido", { p_codigo: orderCode, p_nuevo_estado: "recibido" }, cajaToken);
  await rpc("cambiar_estado_pedido", { p_codigo: orderCode, p_nuevo_estado: "en_preparacion" }, cocinaToken);
  await rpc("cambiar_estado_pedido", { p_codigo: orderCode, p_nuevo_estado: "listo" }, cocinaToken);
  const delivered = await rpc("cambiar_estado_pedido", { p_codigo: orderCode, p_nuevo_estado: "entregado" }, meseraToken);
  assert(delivered.estado === "entregado", "RF05-RF06: el pedido no llego a entregado.");
  console.log("RF05-RF06: estados y pedidos pendientes por rol OK");

  let modificationBlocked = false;
  try {
    await rpc("modificar_pedido_pendiente", {
      p_codigo: orderCode,
      p_mesa: "Mesa alterada",
      p_nombre_cliente: "No permitido",
      p_observacion: "",
      p_items: [{ producto_id: "02", cantidad: 1 }]
    });
  } catch {
    modificationBlocked = true;
  }
  assert(modificationBlocked, "RF03: se permitio modificar un pedido fuera de pendiente.");

  const paid = await rpc("registrar_pago_pedido", {
    p_codigo: orderCode,
    p_metodo_pago: "efectivo"
  }, cajaToken);
  assert(paid.estado === "cerrado" && paid.pago_confirmado === true, "RF04-RF07: pago o cierre incorrecto.");
  assert(Number(paid.monto_pagado) === 2, "RF04-RF07: monto pagado incorrecto.");
  console.log("RF04-RF07: cuenta, pago y cierre OK");

  const product = {
    id: productId,
    nombre: "Producto temporal QA",
    categoria: "Otros",
    descripcion: "Creado por prueba automatizada",
    precio: 3.5,
    imagen: "/img/platos/placeholder-plato.svg",
    disponible: true,
    destacado: false,
    etiquetas: []
  };
  await request("/rest/v1/productos?on_conflict=id", {
    method: "POST",
    body: product,
    token: adminToken,
    prefer: "resolution=merge-duplicates,return=representation"
  });
  await request(`/rest/v1/productos?id=eq.${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: { precio: 4, disponible: false },
    token: adminToken,
    prefer: "return=representation"
  });
  await request(`/rest/v1/productos?id=eq.${encodeURIComponent(productId)}`, {
    method: "DELETE",
    token: adminToken
  });
  const deleted = await request(`/rest/v1/productos?id=eq.${encodeURIComponent(productId)}&select=id`, {
    token: adminToken
  });
  assert(deleted.length === 0, "RF08: el producto temporal no fue eliminado.");
  console.log("RF08: alta, edicion, disponibilidad y baja de menu OK");
  console.log("MVP RF01-RF08: PRUEBA INTEGRAL APROBADA");
} finally {
  await cleanup();
}
