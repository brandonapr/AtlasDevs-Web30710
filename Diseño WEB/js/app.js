import { cargarProductos, crearPedido, iniciarSesion } from "./supabase-service.js";

const menuGrid = document.querySelector("#menuGrid");
const categoryFilters = document.querySelector("#categoryFilters");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const orderForm = document.querySelector("#orderForm");
const orderMessage = document.querySelector("#orderMessage");
const rolesGrid = document.querySelector("#rolesGrid");
const roleSelect = document.querySelector("#roleSelect");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

let menu = [];
let roles = [];
let activeCategory = "Todos";
let cart = [];

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}`);
  }
  return response.json();
}

function setMessage(element, text, type = "") {
  element.textContent = text;
  element.classList.remove("ok", "error");
  if (type) {
    element.classList.add(type);
  }
}

function renderFilters() {
  const categories = ["Todos", ...new Set(menu.map((item) => item.categoria))];

  categoryFilters.innerHTML = categories
    .map((category) => `
      <button class="filter-btn ${category === activeCategory ? "activo" : ""}" data-category="${category}">
        ${category}
      </button>
    `)
    .join("");
}

function renderMenu() {
  const visibleItems = activeCategory === "Todos"
    ? menu
    : menu.filter((item) => item.categoria === activeCategory);

  menuGrid.innerHTML = visibleItems
    .map((item) => `
      <article class="menu-card">
        <figure>
          <img src="${item.imagen}" alt="${item.nombre || item.plato}">
          <span class="badge">${item.categoria}</span>
        </figure>
        <div class="menu-card-body">
          <h3>${item.nombre || item.plato}</h3>
          <p>${item.descripcion}</p>
          <div class="menu-card-footer">
            <span class="price">${money.format(item.precio)}</span>
            <button class="btn add-btn" data-id="${item.id}" ${item.disponible ? "" : "disabled"}>
              ${item.disponible ? "Agregar" : "Agotado"}
            </button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-cart">Todavía no agregas platos al pedido.</div>`;
    cartTotal.textContent = money.format(0);
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => `
      <div class="cart-row">
        <div>
          <strong>${item.nombre || item.plato}</strong>
          <p>${money.format(item.precio)} c/u</p>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-action="remove" data-id="${item.id}">-</button>
          <span>${item.cantidad}</span>
          <button class="qty-btn" data-action="add" data-id="${item.id}">+</button>
        </div>
        <strong>${money.format(item.precio * item.cantidad)}</strong>
      </div>
    `)
    .join("");

  cartTotal.textContent = money.format(getTotal());
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function normalizeId(id) {
  return String(id).padStart(2, "0");
}

function addToCart(id) {
  const item = menu.find((menuItem) => normalizeId(menuItem.id) === normalizeId(id));
  if (!item || !item.disponible) {
    return;
  }

  const existing = cart.find((cartItem) => normalizeId(cartItem.id) === normalizeId(id));
  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ ...item, cantidad: 1 });
  }

  renderCart();
}

function removeFromCart(id) {
  const existing = cart.find((cartItem) => normalizeId(cartItem.id) === normalizeId(id));
  if (!existing) {
    return;
  }

  existing.cantidad -= 1;
  cart = cart.filter((cartItem) => cartItem.cantidad > 0);
  renderCart();
}

function buildPedido() {
  const timestamp = Date.now();
  const codigo = `EDV-${String(timestamp).slice(-6)}`;

  return {
    codigo,
    nombre_cliente: document.querySelector("#customerName").value.trim(),
    mesa: document.querySelector("#tableRef").value.trim(),
    observacion: document.querySelector("#notes").value.trim(),
    estado: "pendiente",
    total: Number(getTotal().toFixed(2)),
    created_at: new Date().toISOString(),
    items: cart.map((item) => ({
      id: item.id,
      plato: item.nombre || item.plato,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: Number((item.precio * item.cantidad).toFixed(2))
    }))
  };
}

function renderRoles() {
  rolesGrid.innerHTML = roles
    .map((role) => `
      <article class="role-card">
        <h3>${role.nombre}</h3>
        <p>Ruta inicial: <strong>${role.ruta_inicial}</strong></p>
        <ul>
          ${role.permisos.map((permiso) => `<li>${permiso.replaceAll("_", " ")}</li>`).join("")}
        </ul>
      </article>
    `)
    .join("");

  roleSelect.innerHTML = roles
    .map((role) => `<option value="${role.id}">${role.nombre}</option>`)
    .join("");
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  renderFilters();
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) {
    return;
  }

  addToCart(button.dataset.id);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  if (button.dataset.action === "add") {
    addToCart(id);
  } else {
    removeFromCart(id);
  }
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    setMessage(orderMessage, "Agrega al menos un plato antes de registrar el pedido.", "error");
    return;
  }

  try {
    const pedido = buildPedido();
    const result = await crearPedido(pedido);
    cart = [];
    orderForm.reset();
    renderCart();
    setMessage(
      orderMessage,
      `Pedido ${pedido.codigo} registrado en modo ${result.modo}. Caja ya puede usar este dato para la siguiente vista.`,
      "ok"
    );
  } catch (error) {
    setMessage(orderMessage, `No se pudo registrar el pedido: ${error.message}`, "error");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const role = roles.find((item) => item.id === roleSelect.value);
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  if (!email || !password) {
    setMessage(loginMessage, "Completa correo y contraseña para probar el ingreso.", "error");
    return;
  }

  try {
    const result = await iniciarSesion(email, password);
    if (result.modo === "pendiente") {
      setMessage(loginMessage, `${result.mensaje} Rol seleccionado: ${role.nombre}.`, "error");
      return;
    }

    setMessage(loginMessage, `Ingreso correcto. Redirigir a ${role.ruta_inicial}.`, "ok");
  } catch (error) {
    setMessage(loginMessage, `No se pudo iniciar sesión: ${error.message}`, "error");
  }
});

async function init() {
  try {
    const [productosData, rolesData] = await Promise.all([
      cargarProductos(),
      loadJson("data/actores-login.json")
    ]);

    menu = productosData;
    roles = rolesData.roles;

    renderFilters();
    renderMenu();
    renderCart();
    renderRoles();
  } catch (error) {
    menuGrid.innerHTML = `<p class="form-note error">${error.message}</p>`;
  }
}

init();
