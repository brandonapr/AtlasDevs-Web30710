import {
  actualizarEstadoPedido,
  cargarPedidos,
  cargarPedidosCaja,
  cargarPedidosCocina,
  cargarPedidosMesera,
  cargarProductos,
  iniciarSesion
} from "/js/supabase-service.js";

const SESSION_KEY = "edv_private_session";
const privatePage = document.body.dataset.privatePage;
const ROLE_ROUTES = {
  administradora: "admin",
  caja: "caja",
  cocinero: "cocina",
  mesera: "mesera"
};

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

function requireSession() {
  if (privatePage === "login") return null;
  const session = getSession();
  if (!session) {
    window.location.href = `/login/?next=/${privatePage}/`;
    return null;
  }

  const allowedPage = ROLE_ROUTES[session.role];
  if (allowedPage && allowedPage !== privatePage) {
    window.location.href = `/${allowedPage}/`;
    return null;
  }

  return session;
}

function money(value) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));
}

function getNextAction(order) {
  const actions = {
    caja: {
      pendiente: { estado: "recibido", label: "Enviar a cocina" },
      listo: { estado: "cerrado", label: "Cerrar ticket" }
    },
    cocina: {
      recibido: { estado: "en_preparacion", label: "Preparar" },
      en_preparacion: { estado: "listo", label: "Marcar listo" }
    },
    mesera: {
      listo: { estado: "cerrado", label: "Entregado" }
    }
  };

  return actions[privatePage]?.[order.estado] || null;
}

async function loadRoles() {
  const response = await fetch("/data/roles.json");
  const data = await response.json();
  return data.rolesPrivados;
}

async function loadTestUsers() {
  const response = await fetch("/data/usuarios-prueba.json");
  const data = await response.json();
  return data.usuarios;
}

function normalizeLogin(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function loadOrdersForPage() {
  if (privatePage === "caja") return cargarPedidosCaja();
  if (privatePage === "cocina") return cargarPedidosCocina();
  if (privatePage === "mesera") return cargarPedidosMesera();
  return cargarPedidos();
}

async function renderOrders() {
  const panel = document.querySelector("#ordersPanel");
  if (!panel) return;

  const orders = await loadOrdersForPage();
  if (orders.length === 0) {
    panel.innerHTML = `<p class="status-message">No hay pedidos para esta vista todavia.</p>`;
    return;
  }

  panel.innerHTML = orders.map((order) => {
    const action = getNextAction(order);

    return `
      <article class="order-summary">
        <h3>${order.codigo}</h3>
        <p><strong>Estado:</strong> ${order.estado.replaceAll("_", " ")}</p>
        <p><strong>Mesa:</strong> ${order.mesa || "Sin mesa"} - <strong>Cliente:</strong> ${order.nombre_cliente || "Sin referencia"}</p>
        <p><strong>Fecha:</strong> ${new Date(order.fecha_hora).toLocaleString("es-EC")}</p>
        ${order.observacion ? `<p><strong>Observacion:</strong> ${order.observacion}</p>` : ""}
        <ul>
          ${(order.items || []).map((item) => `<li>${item.cantidad} x ${item.nombre}</li>`).join("")}
        </ul>
        <p><strong>Total:</strong> ${money(order.total)}</p>
        ${action ? `
          <button class="secondary-action" type="button" data-order-action="${action.estado}" data-codigo="${order.codigo}">
            ${action.label}
          </button>
        ` : ""}
      </article>
    `;
  }).join("");
}

async function renderAdminProducts() {
  const container = document.querySelector("#adminProducts");
  if (!container) return;

  const products = await cargarProductos();

  container.innerHTML = `
    <table class="private-table">
      <thead>
        <tr>
          <th>Codigo</th>
          <th>Producto</th>
          <th>Categoria</th>
          <th>Precio</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((product) => `
          <tr>
            <td>${product.id}</td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>${money(product.precio)}</td>
            <td>${product.disponible ? "Activo" : "Inactivo"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function setupLogin() {
  const [roles, testUsers] = await Promise.all([loadRoles(), loadTestUsers()]);
  const form = document.querySelector("#loginForm");
  const status = document.querySelector("#loginStatus");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.querySelector("#usuarioInput").value.trim();
    const password = document.querySelector("#passwordInput").value;
    const loginUser = testUsers.find((user) => normalizeLogin(user.usuario) === normalizeLogin(usuario));

    if (!usuario || !password) {
      status.textContent = "Completa usuario y contrasena.";
      status.className = "status-message error";
      return;
    }

    if (!loginUser) {
      status.textContent = "Usuario no registrado para este prototipo.";
      status.className = "status-message error";
      return;
    }

    try {
      const result = await iniciarSesion(loginUser.email, password);
      const perfil = result.perfil || null;
      const roleId = perfil?.rol || loginUser.rol;
      const assignedRole = roles.find((role) => role.id === roleId);

      if (perfil && perfil.rol !== loginUser.rol) {
        status.textContent = `El usuario ${loginUser.usuario} pertenece a ${assignedRole?.nombre || perfil.rol}, no al rol esperado.`;
        status.className = "status-message error";
        return;
      }

      setSession({
        usuario: loginUser.usuario,
        email: loginUser.email,
        name: perfil?.nombre || loginUser.nombre,
        role: roleId,
        mode: result.modo,
        loginAt: new Date().toISOString()
      });
      const next = new URLSearchParams(window.location.search).get("next");
      const target = result.modo === "supabase" ? assignedRole?.ruta : loginUser.ruta;
      const safeNext = next && next.includes(`/${ROLE_ROUTES[roleId] || ""}/`) ? next : target;
      if (!safeNext) {
        throw new Error("El rol autenticado no tiene ruta interna configurada.");
      }
      window.location.href = safeNext;
    } catch (error) {
      status.textContent = `No se pudo iniciar sesion: ${error.message}`;
      status.className = "status-message error";
    }
  });
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-order-action]");
  if (!button) return;

  button.disabled = true;
  button.textContent = "Actualizando...";

  try {
    await actualizarEstadoPedido(button.dataset.codigo, button.dataset.orderAction);
    await renderOrders();
  } catch (error) {
    button.disabled = false;
    button.textContent = `Error: ${error.message}`;
  }
});

async function init() {
  if (privatePage === "login") {
    await setupLogin();
    return;
  }

  const session = requireSession();
  if (!session) return;

  await renderOrders();
  await renderAdminProducts();
}

init();
