import {
  actualizarEstadoPedido,
  cargarPedidos,
  cargarPedidosCaja,
  cargarPedidosCocina,
  cargarPedidosMesera,
  cargarProductos,
  cargarPerfilActual,
  iniciarSesion,
  actualizarProducto
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

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function requireSession() {
  if (privatePage === "login") return null;
  const session = getSession();
  if (!session) {
    window.location.href = `/login/?next=/${privatePage}/`;
    return null;
  }

  let perfil = null;
  try {
    perfil = await cargarPerfilActual();
  } catch {
    clearSession();
    window.location.href = `/login/?next=/${privatePage}/`;
    return null;
  }

  const effectiveSession = {
    ...session,
    email: perfil.email,
    name: perfil.nombre,
    role: perfil.rol,
    mode: "supabase"
  };
  const allowedPage = ROLE_ROUTES[effectiveSession.role];

  if (allowedPage && allowedPage !== privatePage) {
    window.location.href = `/${allowedPage}/`;
    return null;
  }

  if (!allowedPage) {
    clearSession();
    window.location.href = `/login/?next=/${privatePage}/`;
    return null;
  }

  setSession(effectiveSession);
  return effectiveSession;
}

function getRequestedPath() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  return next && next.startsWith("/") ? next : null;
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

/* RENDERIZADO DE TICKETS DE COMANDA COHERENTES */
async function renderOrders() {
  const panel = document.querySelector("#ordersPanel");
  if (!panel) return;

  const orders = await loadOrdersForPage();
  if (orders.length === 0) {
    panel.innerHTML = `<p class="status-message">No hay pedidos pendientes en este momento.</p>`;
    return;
  }

  panel.innerHTML = orders.map((order) => {
    const action = getNextAction(order);
    const estadoLimpio = order.estado.replaceAll("_", " ");
    const estadoClase = order.estado.toLowerCase();

    // Custom layout options for Cashier/Caja
    let paymentOptionMarkup = "";
    if (privatePage === "caja" && order.estado === "listo") {
      paymentOptionMarkup = `
        <div style="margin: 12px 0; background: var(--cream-light); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <label style="display:block; font-size:12px; margin-bottom:4px; font-weight:700;">Método de Pago Físico (RF07):</label>
          <select id="pay-method-${order.codigo}" style="width: 100%; padding: 6px; font-size:13px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
            <option value="Transferencia">Transferencia Bancaria</option>
          </select>
        </div>
      `;
    }

    return `
      <article class="order-summary">
        <h3>
          <span>Código: ${order.codigo}</span>
          <span class="order-status-pill ${estadoClase}">${estadoLimpio}</span>
        </h3>
        <div class="order-info-grid">
          <div><strong>Mesa:</strong> ${order.mesa || "Sin mesa"}</div>
          <div><strong>Cliente:</strong> ${order.nombre_cliente || "Sin referencia"}</div>
          <div style="grid-column: span 2; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <span><strong>Fecha:</strong> ${new Date(order.fecha_hora).toLocaleDateString("es-EC")}</span>
            <span><strong>Hora:</strong> <span class="order-time-tag">${new Date(order.fecha_hora).toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
          </div>
        </div>
        ${(() => {
          if (!order.observacion) return "";
          const isAllergies = order.observacion.includes("ALERGIAS:");
          const style = isAllergies ? 'color: var(--soft-red); font-weight: 800; font-size: 13px;' : 'font-size: 13px; color: var(--main-color);';
          const displayObs = order.observacion.replaceAll("ALERGIAS:", "⚠️ ALERGIAS:");
          return `<p style="margin: 8px 0; ${style}"><strong>Obs:</strong> <em>${displayObs}</em></p>`;
        })()}
        <ul aria-label="Detalle de platos">
          ${(order.items || []).map((item) => `
            <li><strong>${item.cantidad}x</strong> ${item.nombre || item.plato} <span style="float:right; color:var(--gray-muted);">${money(item.subtotal)}</span></li>
          `).join("")}
        </ul>
        
        <div class="order-total-block">
          <span>Total a cobrar:</span>
          <strong>${money(order.total)}</strong>
        </div>

        ${paymentOptionMarkup}

        ${action ? `
          <button class="${action.estado === 'cerrado' ? 'primary-action' : 'secondary-action'}" 
                  type="button" 
                  data-order-action="${action.estado}" 
                  data-codigo="${order.codigo}">
            ${action.label}
          </button>
        ` : ""}
      </article>
    `;
  }).join("");
}

/* RENDERIZADO DE LA TABLA DE ADMINISTRACIÓN CON INTERACTIVIDAD */
async function renderAdminProducts() {
  const container = document.querySelector("#adminProducts");
  if (!container) return;

  const products = await cargarProductos();

  container.innerHTML = `
    <table class="private-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre del Producto</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((product) => `
          <tr>
            <td><strong>${product.id}</strong></td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>
              <input type="number" step="0.01" value="${product.precio}" 
                     class="table-price-input" 
                     data-id="${product.id}" 
                     style="width: 75px; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px; margin: 0;">
            </td>
            <td>
              <span class="product-status ${product.disponible ? '' : 'off'}" style="position:relative; top:0; right:0; display:inline-block;">
                ${product.disponible ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              <button class="secondary-action qty-button" 
                      type="button" 
                      data-admin-toggle-id="${product.id}" 
                      data-disponible="${product.disponible}" 
                      style="width:auto; height:auto; padding: 6px 12px; border-radius: 20px; font-size:12px;">
                Alternar
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // Añadir Listeners de cambios de precio en la tabla
  document.querySelectorAll(".table-price-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const nuevoPrecio = parseFloat(e.target.value);
      if (isNaN(nuevoPrecio) || nuevoPrecio < 0) return;

      try {
        const res = await actualizarProducto(id, { precio: nuevoPrecio });
        console.log(`Precio cambiado a ${nuevoPrecio} para producto ${id} en modo ${res.modo}`);
      } catch (err) {
        alert(`Error al actualizar precio: ${err.message}`);
      }
    });
  });

  // Añadir Listeners de toggles de disponibilidad
  document.querySelectorAll("[data-admin-toggle-id]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = btn.dataset.adminToggleId;
      const disponibleActual = btn.dataset.disponible === "true";
      
      try {
        await actualizarProducto(id, { disponible: !disponibleActual });
        await renderAdminProducts();
      } catch (err) {
        alert(`Error al actualizar disponibilidad: ${err.message}`);
      }
    });
  });
}

/* REGISTRO DE FORMULARIO DE EDICIÓN ADMIN */
function setupAdminForm() {
  const form = document.querySelector("#adminForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.querySelector("#adminId").value.trim();
    const nombre = document.querySelector("#adminNombre").value.trim();
    const categoria = document.querySelector("#adminCategoria").value;
    const precio = parseFloat(document.querySelector("#adminPrecio").value);
    const imagen = document.querySelector("#adminImagen").value.trim() || "/img/platos/placeholder-plato.svg";
    const descripcion = document.querySelector("#adminDescripcion").value.trim();

    const status = document.querySelector("#adminStatus");
    status.textContent = "Guardando cambios...";
    status.className = "status-message";

    try {
      const result = await actualizarProducto(id, {
        nombre,
        categoria,
        precio,
        imagen,
        descripcion,
        disponible: true
      });
      
      status.textContent = `¡Producto ${id} guardado con éxito en modo ${result.modo}!`;
      status.className = "status-message ok";
      form.reset();
      await renderAdminProducts();
    } catch (err) {
      status.textContent = `Error al guardar: ${err.message}`;
      status.className = "status-message error";
    }
  });
}

/* SESIÓN DE LOGIN */
async function setupLogin() {
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

    status.textContent = "Preparando acceso seguro...";
    status.className = "status-message";

    try {
      const [roles, testUsers] = await loginData;
      const loginUser = testUsers.find(
        (user) =>
          normalizeLogin(user.usuario) === normalizeLogin(usuario) ||
          normalizeLogin(user.email) === normalizeLogin(usuario)
      );

      if (!loginUser) {
        status.textContent = "Usuario no registrado para este prototipo.";
        status.className = "status-message error";
        return;
      }

      status.textContent = "Validando acceso con Supabase...";
      const auth = await iniciarSesion(loginUser.email, password);
      const assignedRole = roles.find((role) => role.id === auth.perfil?.rol);

      if (!assignedRole) {
        clearSession();
        status.textContent = "El usuario no tiene un rol interno autorizado.";
        status.className = "status-message error";
        return;
      }

      setSession({
        usuario: loginUser.usuario,
        email: auth.perfil.email,
        name: auth.perfil.nombre,
        role: auth.perfil.rol,
        mode: auth.modo,
        loginAt: new Date().toISOString()
      });

      status.textContent = `¡Bienvenido/a, ${auth.perfil.nombre}! Redirigiendo...`;
      status.className = "status-message ok";

      const requestedPath = getRequestedPath();
      const requestedPage = requestedPath?.replace(/^\/+/, "").split("/")[0];
      const allowedPage = ROLE_ROUTES[auth.perfil.rol];
      const targetPath = requestedPage === allowedPage ? requestedPath : `${assignedRole.ruta}/`;
      
      setTimeout(() => {
        window.location.href = targetPath;
      }, 800);
    } catch (error) {
      clearSession();
      status.textContent = `Acceso denegado: ${error.message}`;
      status.className = "status-message error";
    }
  });
}

/* RENDERIZADO DINÁMICO DEL ENCABEZADO DE USUARIO */
function renderUserHeader(session) {
  const shell = document.querySelector("#privateShell");
  if (!shell) return;

  const headerDiv = document.createElement("div");
  headerDiv.className = "private-user-header";
  headerDiv.innerHTML = `
    <div class="user-info">
      Sesión: <strong>${session.name}</strong> | Rol: <span>${session.role.toUpperCase()}</span>
    </div>
    <button id="logoutBtn" type="button">Cerrar Sesión</button>
  `;

  shell.insertBefore(headerDiv, shell.firstChild);

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearSession();
    window.location.href = "/login/";
  });
}

/* MANEJADOR DE CLICS EN BOTONES DE COMANDA */
document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-order-action]");
  if (!button) return;

  const codigo = button.dataset.codigo;
  const nextEstado = button.dataset.orderAction;

  // Si es caja cobrando un ticket listo, mostramos detalle de pago físico
  if (privatePage === "caja" && nextEstado === "cerrado") {
    const payMethodSelect = document.getElementById(`pay-method-${codigo}`);
    const payMethod = payMethodSelect ? payMethodSelect.value : "Efectivo";
    if (!confirm(`¿Confirmar cobro y cierre de ticket para el pedido ${codigo} con método: ${payMethod}?`)) {
      return;
    }
  }

  button.disabled = true;
  button.textContent = "Actualizando...";

  try {
    await actualizarEstadoPedido(codigo, nextEstado);
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

  const session = await requireSession();
  if (!session) return;

  // Renderizar cabecera de usuario
  renderUserHeader(session);

  // Cargar elementos de la vista activa
  await renderOrders();
  await renderAdminProducts();
  setupAdminForm();
}

init();
