import { cargarCategorias, cargarProductos, registrarPedido } from "/js/supabase-service.js";

const STORAGE_CART = "edv_cart";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const state = {
  productos: [],
  categorias: ["Todos"],
  categoria: "Todos",
  busqueda: "",
  carrito: readCart(),
  mesa: detectMesa()
};

const productsGrid = document.querySelector("#productsGrid");
const categoryTabs = document.querySelector("#categoryTabs");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const cartPanel = document.querySelector("#cartPanel");
const cartList = document.querySelector("#cartList");
const cartTotal = document.querySelector("#cartTotal");
const floatingTotal = document.querySelector("#floatingTotal");
const floatingCart = document.querySelector("#floatingCart");
const cartClose = document.querySelector("#cartClose");
const checkoutForm = document.querySelector("#checkoutForm");
const orderStatus = document.querySelector("#orderStatus");
const mesaInput = document.querySelector("#mesaInput");
const mesaPill = document.querySelector("#mesaPill");

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CART) || "[]");
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_CART, JSON.stringify(state.carrito));
}

function detectMesa() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("mesa");
  const parts = window.location.pathname.split("/").filter(Boolean);
  const fromPath = parts[0] === "menu" && parts[1] ? parts[1] : "";
  return (fromQuery || fromPath || "").replaceAll("-", " ").trim();
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCartItem(id) {
  return state.carrito.find((item) => item.id === id);
}

function reconcileCartWithProducts() {
  state.carrito = state.carrito
    .map((cartItem) => {
      const product = state.productos.find((item) => item.id === cartItem.id);
      if (!product) return null;

      return {
        ...cartItem,
        nombre: product.nombre,
        categoria: product.categoria,
        precio: product.precio,
        imagen: product.imagen
      };
    })
    .filter(Boolean);
}

function getCartCount() {
  return state.carrito.reduce((sum, item) => sum + item.cantidad, 0);
}

function getCartTotal() {
  return state.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function getFilteredProducts() {
  const query = normalize(state.busqueda);

  return state.productos.filter((producto) => {
    const categoryMatch = state.categoria === "Todos" || producto.categoria === state.categoria;
    const searchText = normalize([
      producto.id,
      producto.nombre,
      producto.categoria,
      producto.subcategoria,
      producto.descripcion,
      ...(producto.etiquetas || [])
    ].join(" "));

    return categoryMatch && (!query || searchText.includes(query));
  });
}

function renderCategories() {
  categoryTabs.innerHTML = state.categorias.map((categoria) => `
    <button class="category-tab ${state.categoria === categoria ? "active" : ""}" data-category="${categoria}">
      ${categoria}
    </button>
  `).join("");
}

function renderProducts() {
  const products = getFilteredProducts();
  resultCount.textContent = `${products.length} producto${products.length === 1 ? "" : "s"} encontrado${products.length === 1 ? "" : "s"}`;

  if (products.length === 0) {
    productsGrid.innerHTML = `
      <article class="product-card">
        <div class="product-body">
          <h2>No encontramos resultados</h2>
          <p>Prueba con otra palabra, categoria o codigo.</p>
        </div>
      </article>
    `;
    return;
  }

  productsGrid.innerHTML = products.map((producto) => {
    const cartItem = getCartItem(producto.id);
    const quantity = cartItem?.cantidad || 0;
    const status = producto.disponible ? "Disponible" : "Agotado";

    return `
      <article class="product-card">
        <figure class="product-media">
          <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='/img/platos/placeholder-plato.svg'">
          <span class="product-code">${producto.id}</span>
          <span class="product-status ${producto.disponible ? "" : "off"}">${status}</span>
        </figure>
        <div class="product-body">
          <div class="product-meta">
            <span class="product-category">${producto.categoria}</span>
            <span>${producto.subcategoria || ""}</span>
          </div>
          <h2>${producto.nombre}</h2>
          <p>${producto.descripcion}</p>
          <div class="tag-row">
            ${(producto.etiquetas || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <div class="product-actions">
            <span class="price">${money.format(producto.precio)}</span>
            ${quantity > 0 ? `
              <div class="quantity-inline" aria-label="Cantidad agregada">
                <button class="qty-button" type="button" data-action="decrease" data-id="${producto.id}">-</button>
                <strong>${quantity}</strong>
                <button class="qty-button" type="button" data-action="increase" data-id="${producto.id}">+</button>
              </div>
            ` : `
              <button class="add-button" type="button" data-action="add" data-id="${producto.id}" ${producto.disponible ? "" : "disabled"}>
                Agregar
              </button>
            `}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const total = getCartTotal();
  cartTotal.textContent = money.format(total);
  floatingTotal.textContent = `${getCartCount()} · ${money.format(total)}`;

  if (state.carrito.length === 0) {
    cartList.innerHTML = `<div class="empty-cart">Tu pedido esta vacio. Agrega platos desde el menu.</div>`;
    return;
  }

  cartList.innerHTML = state.carrito.map((item) => `
    <article class="cart-item">
      <div class="cart-item-top">
        <div>
          <strong>${item.id}. ${item.nombre}</strong>
          <small>${money.format(item.precio)} c/u</small>
        </div>
        <strong>${money.format(item.precio * item.cantidad)}</strong>
      </div>
      <div class="cart-item-actions">
        <div class="cart-qty">
          <button class="qty-button" type="button" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.cantidad}</span>
          <button class="qty-button" type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="remove-button" type="button" data-action="remove" data-id="${item.id}">Eliminar</button>
      </div>
    </article>
  `).join("");
}

function syncMesa() {
  const label = state.mesa ? state.mesa : "sin asignar";
  mesaPill.textContent = `Pedido para mesa: ${label}`;
  if (state.mesa && !mesaInput.value) {
    mesaInput.value = state.mesa;
  }
}

function updateAll() {
  renderProducts();
  renderCart();
  saveCart();
}

function addProduct(id) {
  const producto = state.productos.find((item) => item.id === id);
  if (!producto || !producto.disponible) return;

  const existing = getCartItem(id);
  if (existing) {
    existing.cantidad += 1;
  } else {
    state.carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  updateAll();
}

function decreaseProduct(id) {
  const existing = getCartItem(id);
  if (!existing) return;

  existing.cantidad -= 1;
  state.carrito = state.carrito.filter((item) => item.cantidad > 0);
  updateAll();
}

function removeProduct(id) {
  state.carrito = state.carrito.filter((item) => item.id !== id);
  updateAll();
}

function buildOrder() {
  const nombre = document.querySelector("#clienteNombre").value.trim();
  const mesa = mesaInput.value.trim();
  const observacion = document.querySelector("#observacionInput").value.trim();
  const now = new Date();

  return {
    codigo: `EDV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getTime()).slice(-5)}`,
    estado: "pendiente",
    fecha_hora: now.toISOString(),
    mesa,
    nombre_cliente: nombre,
    observacion,
    total: Number(getCartTotal().toFixed(2)),
    items: state.carrito.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      subtotal: Number((item.precio * item.cantidad).toFixed(2))
    }))
  };
}

function setStatus(message, type = "") {
  orderStatus.textContent = message;
  orderStatus.classList.remove("ok", "error");
  if (type) orderStatus.classList.add(type);
}

categoryTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-category]");
  if (!tab) return;
  state.categoria = tab.dataset.category;
  renderCategories();
  renderProducts();
});

searchInput.addEventListener("input", (event) => {
  state.busqueda = event.target.value;
  renderProducts();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "add" || action === "increase") addProduct(id);
  if (action === "decrease") decreaseProduct(id);
  if (action === "remove") removeProduct(id);
});

floatingCart.addEventListener("click", () => {
  cartPanel.classList.add("open");
});

cartClose.addEventListener("click", () => {
  cartPanel.classList.remove("open");
});

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (state.carrito.length === 0) {
    setStatus("Agrega al menos un producto antes de registrar el pedido.", "error");
    return;
  }

  const order = buildOrder();
  if (!order.nombre_cliente || !order.mesa) {
    setStatus("Completa nombre o referencia y mesa antes de registrar.", "error");
    return;
  }

  try {
    const result = await registrarPedido(order);
    localStorage.setItem("edv_last_order", JSON.stringify(order));
    state.carrito = [];
    saveCart();
    checkoutForm.reset();
    syncMesa();
    updateAll();
    cartPanel.classList.remove("open");
    setStatus(`Pedido ${order.codigo} registrado en modo ${result.modo}. Estado: pendiente.`, "ok");
    window.location.href = "/orden/";
  } catch (error) {
    setStatus(`No se pudo registrar el pedido: ${error.message}`, "error");
  }
});

async function init() {
  state.productos = await cargarProductos();
  state.categorias = cargarCategorias(state.productos);
  reconcileCartWithProducts();
  syncMesa();
  renderCategories();
  updateAll();
}

init().catch((error) => {
  productsGrid.innerHTML = `<article class="product-card"><div class="product-body"><h2>Error al cargar menú</h2><p>${error.message}</p></div></article>`;
});
