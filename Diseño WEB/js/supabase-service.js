import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./supabase-config.js";

const PRODUCTOS_JSON = "/data/productos.json";
const LOCAL_ORDERS_KEY = "edv_pedidos_demo";
const VALID_ORDER_STATES = new Set([
  "pendiente",
  "recibido",
  "en_preparacion",
  "listo",
  "entregado",
  "cerrado",
  "cancelado"
]);

let supabaseClient = null;

async function getClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}`);
  }
  return response.json();
}

function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalOrders(orders) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

function normalizeEstado(estado) {
  if (estado === "pendiente_caja") return "pendiente";
  return VALID_ORDER_STATES.has(estado) ? estado : "pendiente";
}

function normalizeProducto(producto) {
  return {
    id: String(producto.id).padStart(2, "0"),
    nombre: producto.nombre || producto.plato || "",
    categoria: producto.categoria || "Otros",
    subcategoria: producto.subcategoria || "",
    descripcion: producto.descripcion || "",
    precio: Number(producto.precio || 0),
    imagen: producto.imagen || "/img/platos/placeholder-plato.svg",
    disponible: producto.disponible !== false,
    destacado: producto.destacado === true,
    etiquetas: Array.isArray(producto.etiquetas) ? producto.etiquetas : []
  };
}

function normalizePedido(pedido) {
  const items = pedido.items || pedido.pedido_items || [];

  return {
    codigo: pedido.codigo,
    estado: normalizeEstado(pedido.estado),
    fecha_hora: pedido.fecha_hora || pedido.created_at || new Date().toISOString(),
    mesa: pedido.mesa || "",
    nombre_cliente: pedido.nombre_cliente || "",
    observacion: pedido.observacion || "",
    total: Number(pedido.total || 0),
    estado_pago: pedido.estado_pago || "pendiente",
    pago_confirmado: pedido.pago_confirmado === true,
    metodo_pago: pedido.metodo_pago || "",
    monto_pagado: Number(pedido.monto_pagado || 0),
    fecha_confirmacion_pago: pedido.fecha_confirmacion_pago || null,
    items: items.map((item) => ({
      id: item.producto_id || item.id || item.plato_id,
      nombre: item.nombre || item.plato || "",
      cantidad: Number(item.cantidad || 0),
      precio_unitario: Number(item.precio_unitario || item.precio || 0),
      subtotal: Number(item.subtotal || 0),
      observacion_item: item.observacion_item === "-" ? "" : (item.observacion_item || "")
    }))
  };
}

async function fallbackProductos() {
  const productos = await loadJson(PRODUCTOS_JSON);
  return productos.map(normalizeProducto);
}

function fallbackCrearPedido(pedido) {
  const orders = readLocalOrders();
  const normalized = normalizePedido(pedido);
  const existingIndex = orders.findIndex((order) => order.codigo === normalized.codigo);

  if (existingIndex >= 0) {
    orders[existingIndex] = normalized;
  } else {
    orders.push(normalized);
  }

  writeLocalOrders(orders);
  return { modo: "local", data: normalized };
}

function filterOrdersByEstados(orders, estados = []) {
  if (!estados.length) return orders;
  return orders.filter((order) => estados.includes(order.estado));
}

export async function cargarProductos(options = {}) {
  const { soloDisponibles = false } = options;
  const client = await getClient();

  if (!client) {
    const productos = await fallbackProductos();
    return soloDisponibles ? productos.filter((producto) => producto.disponible) : productos;
  }

  try {
    let query = client
      .from("productos")
      .select("id,nombre,categoria,subcategoria,descripcion,precio,imagen,disponible,destacado,etiquetas")
      .order("id", { ascending: true });

    if (soloDisponibles) {
      query = query.eq("disponible", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Supabase no tiene productos cargados todavia.");

    return data.map(normalizeProducto);
  } catch (error) {
    console.warn("Usando productos JSON como fallback:", error.message);
    const productos = await fallbackProductos();
    return soloDisponibles ? productos.filter((producto) => producto.disponible) : productos;
  }
}

export function cargarCategorias(productos = []) {
  const base = ["Todos", "Desayunos", "Bebidas", "Bolones", "Ensaladas", "Otros"];
  const existing = new Set(productos.map((producto) => producto.categoria).filter(Boolean));
  const ordered = base.filter((categoria) => categoria === "Todos" || existing.has(categoria));
  const extras = [...existing].filter((categoria) => !base.includes(categoria)).sort();
  return [...ordered, ...extras];
}

export async function registrarPedido(pedido) {
  const normalized = normalizePedido(pedido);
  const client = await getClient();

  if (!client) {
    return fallbackCrearPedido(normalized);
  }

  try {
    const { data, error } = await client.rpc("registrar_pedido_publico", {
      p_codigo: normalized.codigo,
      p_mesa: normalized.mesa,
      p_nombre_cliente: normalized.nombre_cliente,
      p_observacion: normalized.observacion,
      p_items: normalized.items.map((item) => ({
        producto_id: String(item.id).padStart(2, "0"),
        cantidad: item.cantidad,
        observacion_item: item.observacion_item || "-"
      }))
    });

    if (error) throw error;
    return { modo: "supabase", data: normalizePedido(data) };
  } catch (error) {
    console.warn("No se pudo guardar en Supabase, usando localStorage:", error.message);
    return {
      ...fallbackCrearPedido(normalized),
      error
    };
  }
}

export const crearPedido = registrarPedido;

export async function consultarPedido(codigo) {
  const client = await getClient();
  if (!client) {
    const order = readLocalOrders().find((item) => item.codigo === codigo);
    return order ? normalizePedido(order) : null;
  }

  const { data, error } = await client.rpc("consultar_pedido_publico", { p_codigo: codigo });
  if (error) throw error;
  if (data) return normalizePedido(data);
  const localOrder = readLocalOrders().find((item) => item.codigo === codigo);
  return localOrder ? normalizePedido(localOrder) : null;
}

export async function modificarPedido(pedido) {
  const normalized = normalizePedido(pedido);
  const client = await getClient();
  if (!client) return fallbackCrearPedido(normalized);

  const { data, error } = await client.rpc("modificar_pedido_pendiente", {
    p_codigo: normalized.codigo,
    p_mesa: normalized.mesa,
    p_nombre_cliente: normalized.nombre_cliente,
    p_observacion: normalized.observacion,
    p_items: normalized.items.map((item) => ({
      producto_id: String(item.id).padStart(2, "0"),
      cantidad: item.cantidad,
      observacion_item: item.observacion_item || "-"
    }))
  });

  if (error) throw error;
  return { modo: "supabase", data: normalizePedido(data) };
}

export async function cargarPedidos(options = {}) {
  const { estados = [] } = options;
  const client = await getClient();

  if (!client) {
    return filterOrdersByEstados(readLocalOrders().map(normalizePedido).reverse(), estados);
  }

  try {
    let query = client
      .from("pedidos")
      .select(`
        codigo,
        estado,
        fecha_hora,
        mesa,
        nombre_cliente,
        observacion,
        total,
        estado_pago,
        pago_confirmado,
        metodo_pago,
        monto_pagado,
        fecha_confirmacion_pago,
        created_at,
        pedido_items (
          id,
          producto_id,
          nombre,
          cantidad,
          precio_unitario,
          subtotal,
          observacion_item
        )
      `)
      .order("fecha_hora", { ascending: false });

    if (estados.length === 1) {
      query = query.eq("estado", estados[0]);
    } else if (estados.length > 1) {
      query = query.in("estado", estados);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(normalizePedido);
  } catch (error) {
    console.warn("Usando pedidos locales como fallback:", error.message);
    return filterOrdersByEstados(readLocalOrders().map(normalizePedido).reverse(), estados);
  }
}

export const cargarPedidosCaja = () =>
  cargarPedidos({ estados: ["pendiente", "recibido", "en_preparacion", "listo", "entregado"] });

export const cargarPedidosCocina = () =>
  cargarPedidos({ estados: ["recibido", "en_preparacion"] });

export const cargarPedidosMesera = () =>
  cargarPedidos({ estados: ["listo"] });

export async function actualizarEstadoPedido(codigo, estado) {
  const nextEstado = normalizeEstado(estado);
  const client = await getClient();

  if (!client) {
    const orders = readLocalOrders().map((order) =>
      order.codigo === codigo ? { ...order, estado: nextEstado } : order
    );
    writeLocalOrders(orders);
    return { modo: "local", data: { codigo, estado: nextEstado } };
  }

  const { data, error } = await client.rpc("cambiar_estado_pedido", {
    p_codigo: codigo,
    p_nuevo_estado: nextEstado
  });

  if (error) throw error;
  return { modo: "supabase", data: normalizePedido(data) };
}

export async function registrarPago(codigo, metodoPago) {
  const client = await getClient();
  if (!client) throw new Error("El pago requiere conexion con Supabase.");

  const { data, error } = await client.rpc("registrar_pago_pedido", {
    p_codigo: codigo,
    p_metodo_pago: metodoPago
  });
  if (error) throw error;
  return { modo: "supabase", data: normalizePedido(data) };
}

export async function actualizarProducto(id, cambios) {
  const client = await getClient();
  const payload = { ...cambios };
  delete payload.id;

  if (!client) {
    return {
      modo: "local",
      mensaje: "Sin Supabase no se puede modificar el JSON desde el navegador.",
      data: { id, ...payload }
    };
  }

  const { data, error } = await client
    .from("productos")
    .update(payload)
    .eq("id", String(id).padStart(2, "0"))
    .select()
    .single();

  if (error) throw error;
  return { modo: "supabase", data: normalizeProducto(data) };
}

export async function guardarProducto(producto) {
  const client = await getClient();
  if (!client) throw new Error("La gestion del menu requiere conexion con Supabase.");

  const payload = normalizeProducto(producto);
  const { data, error } = await client
    .from("productos")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return { modo: "supabase", data: normalizeProducto(data) };
}

export async function eliminarProducto(id) {
  const client = await getClient();
  if (!client) throw new Error("La gestion del menu requiere conexion con Supabase.");

  const { error } = await client.from("productos").delete().eq("id", String(id).padStart(2, "0"));
  if (error) throw error;
  return { modo: "supabase", data: { id: String(id).padStart(2, "0") } };
}

export const activarProducto = (id, disponible) =>
  actualizarProducto(id, { disponible });

export const actualizarPrecioProducto = (id, precio) =>
  actualizarProducto(id, { precio: Number(precio) });

export async function cargarPerfilActual() {
  const client = await getClient();

  if (!client) {
    return null;
  }

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData?.user) return null;

  const { data, error } = await client
    .from("perfiles")
    .select("id,email,nombre,rol")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    throw new Error("El usuario existe en Auth, pero no tiene rol interno en public.perfiles.");
  }

  return data;
}

export async function iniciarSesion(email, password) {
  const client = await getClient();

  if (!client) {
    return {
      modo: "pendiente",
      mensaje: "Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY."
    };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  const perfil = await cargarPerfilActual();
  return { modo: "supabase", data, perfil };
}

export async function cerrarSesion() {
  const client = await getClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
