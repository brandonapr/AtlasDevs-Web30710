import {
  actualizarEstadoPedido,
  actualizarProducto,
  cargarPedidos,
  cargarPedidosCaja,
  cargarPedidosCocina,
  cargarPedidosMesera,
  cargarPerfilActual,
  cargarProductos,
  cerrarSesion,
  eliminarProducto,
  guardarProducto,
  iniciarSesion,
  registrarPago
} from "/js/supabase-service.js";

const SESSION_KEY = "edv_private_session";
const privatePage = document.body.dataset.privatePage;
const ROLE_ROUTES = {
  administradora: "admin",
  caja: "caja",
  cocinero: "cocina",
  mesera: "mesera"
};

let currentOrders = [];
let currentProducts = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getRequestedPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") ? next : null;
}

async function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = `/login/?next=/${privatePage}/`;
    return null;
  }

  try {
    const perfil = await cargarPerfilActual();
    const allowedPage = ROLE_ROUTES[perfil?.rol];
    if (!allowedPage) throw new Error("Perfil sin rol autorizado.");
    if (allowedPage !== privatePage) {
      window.location.href = `/${allowedPage}/`;
      return null;
    }

    const verified = {
      ...session,
      email: perfil.email,
      name: perfil.nombre,
      role: perfil.rol,
      mode: "supabase"
    };
    setSession(verified);
    return verified;
  } catch {
    clearSession();
    window.location.href = `/login/?next=/${privatePage}/`;
    return null;
  }
}

async function loadRoles() {
  const response = await fetch("/data/roles.json");
  if (!response.ok) throw new Error("No se pudo cargar la matriz de roles.");
  return (await response.json()).rolesPrivados;
}

async function loadTestUsers() {
  const response = await fetch("/data/usuarios-prueba.json");
  if (!response.ok) throw new Error("No se pudo cargar la matriz de usuarios.");
  return (await response.json()).usuarios;
}

function normalizeLogin(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function setupLogin() {
  const form = document.querySelector("#loginForm");
  const status = document.querySelector("#loginStatus");
  const loginData = Promise.all([loadRoles(), loadTestUsers()]);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const usuario = document.querySelector("#usuarioInput").value.trim();
    const password = document.querySelector("#passwordInput").value;

    if (!usuario || !password) {
      status.textContent = "Completa usuario y contraseña.";
      status.className = "status-message error";
      return;
    }

    status.textContent = "Validando acceso con Supabase...";
    status.className = "status-message";

    try {
      const [roles, users] = await loginData;
      const loginUser = users.find((user) =>
        [user.usuario, user.email].some((value) => normalizeLogin(value) === normalizeLogin(usuario))
      );
      if (!loginUser) throw new Error("Usuario no registrado.");

      const auth = await iniciarSesion(loginUser.email, password);
      const assignedRole = roles.find((role) => role.id === auth.perfil?.rol);
      if (!assignedRole) throw new Error("El usuario no tiene un rol interno autorizado.");

      setSession({
        usuario: loginUser.usuario,
        email: auth.perfil.email,
        name: auth.perfil.nombre,
        role: auth.perfil.rol,
        mode: auth.modo,
        loginAt: new Date().toISOString()
      });

      status.textContent = `Bienvenido/a, ${auth.perfil.nombre}. Rol: ${assignedRole.nombre}.`;
      status.className = "status-message ok";

      const requestedPath = getRequestedPath();
      const requestedPage = requestedPath?.replace(/^\/+/, "").split("/")[0];
      const allowedPage = ROLE_ROUTES[auth.perfil.rol];
      const target = requestedPage === allowedPage ? requestedPath : `${assignedRole.ruta}/`;
      setTimeout(() => { window.location.href = target; }, 700);
    } catch (error) {
      clearSession();
      status.textContent = `Acceso denegado: ${error.message}`;
      status.className = "status-message error";
    }
  });

  form.dataset.ready = "true";
}

function renderUserHeader(session) {
  const shell = document.querySelector("#privateShell");
  const header = document.createElement("div");
  header.className = "private-user-header";
  header.innerHTML = `
    <div class="user-info">Bienvenido/a, <strong>${escapeHtml(session.name)}</strong> · Rol: ${escapeHtml(session.role)}</div>
    <button id="logoutBtn" type="button">Cerrar sesión</button>
  `;
  shell.prepend(header);

  document.querySelector("#logoutBtn").addEventListener("click", async () => {
    await cerrarSesion().catch(() => {});
    clearSession();
    window.location.href = "/login/";
  });
}

function getNextAction(order) {
  const actions = {
    caja: { pendiente: { estado: "recibido", label: "Enviar a cocina" } },
    cocina: {
      recibido: { estado: "en_preparacion", label: "Iniciar preparación" },
      en_preparacion: { estado: "listo", label: "Marcar como listo" }
    },
    mesera: { listo: { estado: "entregado", label: "Confirmar entrega" } }
  };
  return actions[privatePage]?.[order.estado] || null;
}

async function loadOrdersForPage() {
  if (privatePage === "caja") return cargarPedidosCaja();
  if (privatePage === "cocina") return cargarPedidosCocina();
  if (privatePage === "mesera") return cargarPedidosMesera();
  return cargarPedidos();
}

function renderOrderCard(order) {
  const action = getNextAction(order);
  const canPay = privatePage === "caja" && order.estado === "entregado" && !order.pago_confirmado;
  const items = order.items.map((item) => `
    <li>
      <span><strong>${item.cantidad}x</strong> ${escapeHtml(item.nombre)}</span>
      ${item.observacion_item ? `<small>${escapeHtml(item.observacion_item)}</small>` : ""}
      <span>${money(item.subtotal)}</span>
    </li>
  `).join("");

  return `
    <article class="order-summary" data-order-card="${escapeHtml(order.codigo)}">
      <h3>
        <span>${escapeHtml(order.codigo)}</span>
        <span class="order-status-pill ${escapeHtml(order.estado)}">${escapeHtml(order.estado.replaceAll("_", " "))}</span>
      </h3>
      <div class="order-info-grid">
        <div><strong>Mesa:</strong> ${escapeHtml(order.mesa || "Sin mesa")}</div>
        <div><strong>Cliente:</strong> ${escapeHtml(order.nombre_cliente || "Sin referencia")}</div>
        <div><strong>Registrado:</strong> ${new Date(order.fecha_hora).toLocaleString("es-EC")}</div>
        <div><strong>Pago:</strong> ${order.pago_confirmado ? `Pagado (${escapeHtml(order.metodo_pago)})` : "Pendiente"}</div>
      </div>
      ${order.observacion ? `<p class="order-observation"><strong>Observación:</strong> ${escapeHtml(order.observacion)}</p>` : ""}
      <ul aria-label="Detalle de platos">${items}</ul>
      <div class="order-total-block"><span>Total</span><strong>${money(order.total)}</strong></div>
      <div class="order-actions">
        ${privatePage === "caja" ? `<button class="secondary-action" type="button" data-account-code="${escapeHtml(order.codigo)}">Generar cuenta</button>` : ""}
        ${action ? `<button class="secondary-action" type="button" data-order-action="${action.estado}" data-codigo="${escapeHtml(order.codigo)}">${action.label}</button>` : ""}
      </div>
      ${canPay ? `
        <div class="payment-controls">
          <label for="pay-method-${escapeHtml(order.codigo)}">Método de pago</label>
          <select id="pay-method-${escapeHtml(order.codigo)}">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <button class="primary-action" type="button" data-pay-code="${escapeHtml(order.codigo)}">Registrar pago</button>
        </div>
      ` : ""}
    </article>
  `;
}

async function renderOrders() {
  const panel = document.querySelector("#ordersPanel");
  if (!panel) return;
  currentOrders = await loadOrdersForPage();
  panel.innerHTML = currentOrders.length
    ? currentOrders.map(renderOrderCard).join("")
    : `<p class="status-message">No hay pedidos pendientes para este rol.</p>`;
}

function openAccount(codigo) {
  const order = currentOrders.find((item) => item.codigo === codigo);
  const dialog = document.querySelector("#accountDialog");
  if (!order || !dialog) return;

  dialog.querySelector("#accountContent").innerHTML = `
    <div class="account-brand"><strong>Ensaladas del Valle</strong><span>Cuenta de consumo</span></div>
    <p><strong>Pedido:</strong> ${escapeHtml(order.codigo)}</p>
    <p><strong>Mesa:</strong> ${escapeHtml(order.mesa)} · <strong>Cliente:</strong> ${escapeHtml(order.nombre_cliente)}</p>
    <table class="account-table">
      <thead><tr><th>Cant.</th><th>Producto</th><th>Subtotal</th></tr></thead>
      <tbody>${order.items.map((item) => `
        <tr><td>${item.cantidad}</td><td>${escapeHtml(item.nombre)}</td><td>${money(item.subtotal)}</td></tr>
      `).join("")}</tbody>
      <tfoot><tr><th colspan="2">Total</th><th>${money(order.total)}</th></tr></tfoot>
    </table>
    <p class="account-note">Precios finales. Impuestos incluidos.</p>
  `;
  dialog.showModal();
}

async function handleOrderAction(button) {
  button.disabled = true;
  try {
    await actualizarEstadoPedido(button.dataset.codigo, button.dataset.orderAction);
    await renderOrders();
  } catch (error) {
    button.disabled = false;
    button.textContent = `Error: ${error.message}`;
  }
}

async function handlePayment(button) {
  const codigo = button.dataset.payCode;
  const method = document.querySelector(`#pay-method-${CSS.escape(codigo)}`).value;
  button.disabled = true;
  button.textContent = "Registrando...";
  try {
    await registrarPago(codigo, method);
    await renderOrders();
  } catch (error) {
    button.disabled = false;
    button.textContent = `Error: ${error.message}`;
  }
}

function productRow(product) {
  return `
    <tr>
      <td><strong>${escapeHtml(product.id)}</strong></td>
      <td>${escapeHtml(product.nombre)}</td>
      <td>${escapeHtml(product.categoria)}</td>
      <td>${money(product.precio)}</td>
      <td><span class="product-status ${product.disponible ? "" : "off"}">${product.disponible ? "Activo" : "Inactivo"}</span></td>
      <td class="admin-actions">
        <button type="button" data-admin-edit="${escapeHtml(product.id)}">Editar</button>
        <button type="button" data-admin-toggle="${escapeHtml(product.id)}">${product.disponible ? "Desactivar" : "Activar"}</button>
        <button type="button" class="danger-action" data-admin-delete="${escapeHtml(product.id)}">Eliminar</button>
      </td>
    </tr>
  `;
}

async function renderAdminProducts() {
  const container = document.querySelector("#adminProducts");
  if (!container) return;
  currentProducts = await cargarProductos();
  container.innerHTML = `
    <table class="private-table">
      <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>${currentProducts.map(productRow).join("")}</tbody>
    </table>
  `;
}

function fillAdminForm(product) {
  document.querySelector("#adminId").value = product.id;
  document.querySelector("#adminNombre").value = product.nombre;
  document.querySelector("#adminCategoria").value = product.categoria;
  document.querySelector("#adminPrecio").value = product.precio;
  document.querySelector("#adminImagen").value = product.imagen;
  document.querySelector("#adminDescripcion").value = product.descripcion;
  document.querySelector("#adminId").readOnly = true;
  document.querySelector("#adminGuardarBtn").textContent = "Actualizar producto";
  document.querySelector("#adminForm").scrollIntoView({ behavior: "smooth" });
}

function resetAdminForm() {
  const form = document.querySelector("#adminForm");
  form.reset();
  document.querySelector("#adminId").readOnly = false;
  document.querySelector("#adminGuardarBtn").textContent = "Guardar producto";
}

function setupAdminForm() {
  const form = document.querySelector("#adminForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("#adminStatus");
    status.textContent = "Guardando producto...";
    status.className = "status-message";

    try {
      const result = await guardarProducto({
        id: document.querySelector("#adminId").value.trim(),
        nombre: document.querySelector("#adminNombre").value.trim(),
        categoria: document.querySelector("#adminCategoria").value,
        precio: Number(document.querySelector("#adminPrecio").value),
        imagen: document.querySelector("#adminImagen").value.trim(),
        descripcion: document.querySelector("#adminDescripcion").value.trim(),
        disponible: true,
        destacado: false,
        etiquetas: []
      });
      status.textContent = `Producto ${result.data.id} guardado correctamente.`;
      status.className = "status-message ok";
      resetAdminForm();
      await renderAdminProducts();
    } catch (error) {
      status.textContent = `No se pudo guardar: ${error.message}`;
      status.className = "status-message error";
    }
  });

  document.querySelector("#adminCancelBtn")?.addEventListener("click", resetAdminForm);
}

async function handleAdminAction(button) {
  const id = button.dataset.adminEdit || button.dataset.adminToggle || button.dataset.adminDelete;
  const product = currentProducts.find((item) => item.id === id);
  if (!product) return;

  if (button.dataset.adminEdit) {
    fillAdminForm(product);
    return;
  }

  if (button.dataset.adminToggle) {
    await actualizarProducto(id, { disponible: !product.disponible });
    await renderAdminProducts();
    return;
  }

  if (button.dataset.adminDelete && window.confirm(`¿Eliminar ${product.nombre} del menú?`)) {
    await eliminarProducto(id);
    await renderAdminProducts();
  }
}

document.addEventListener("click", async (event) => {
  const orderAction = event.target.closest("[data-order-action]");
  if (orderAction) return handleOrderAction(orderAction);

  const accountButton = event.target.closest("[data-account-code]");
  if (accountButton) return openAccount(accountButton.dataset.accountCode);

  const paymentButton = event.target.closest("[data-pay-code]");
  if (paymentButton) return handlePayment(paymentButton);

  const adminButton = event.target.closest("[data-admin-edit], [data-admin-toggle], [data-admin-delete]");
  if (adminButton) return handleAdminAction(adminButton);
});

async function init() {
  if (privatePage === "login") {
    setupLogin();
    return;
  }

  const session = await requireSession();
  if (!session) return;
  renderUserHeader(session);
  await Promise.all([renderOrders(), renderAdminProducts()]);
  setupAdminForm();

  if (["caja", "cocina", "mesera"].includes(privatePage)) {
    setInterval(() => renderOrders().catch(() => {}), 12000);
  }
}

init().catch((error) => {
  const shell = document.querySelector("#privateShell") || document.querySelector("main");
  shell.insertAdjacentHTML("afterbegin", `<p class="status-message error">${escapeHtml(error.message)}</p>`);
});
