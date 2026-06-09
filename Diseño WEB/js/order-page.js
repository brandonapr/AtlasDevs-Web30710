import { cargarProductos } from "/js/supabase-service.js";

const ordersList = document.querySelector("#ordersList");
let productMap = new Map();

function readOrders() {
  const orders = JSON.parse(localStorage.getItem("edv_pedidos_demo") || "[]");
  const lastOrder = JSON.parse(localStorage.getItem("edv_last_order") || "null");

  if (lastOrder && !orders.some((order) => order.codigo === lastOrder.codigo)) {
    orders.push(lastOrder);
  }

  const migrated = orders.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => {
      const product = productMap.get(String(item.id).padStart(2, "0"));
      return product ? { ...item, nombre: product.nombre } : item;
    })
  }));

  localStorage.setItem("edv_pedidos_demo", JSON.stringify(migrated));
  return migrated.reverse();
}

function money(value) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

async function renderOrders() {
  const products = await cargarProductos();
  productMap = new Map(products.map((product) => [product.id, product]));

  const orders = readOrders();

  if (orders.length === 0) {
    ordersList.innerHTML = `<p class="status-message">Aun no hay pedidos registrados en este navegador.</p>`;
    return;
  }

  ordersList.innerHTML = orders.map((order) => {
    const estadoLimpio = order.estado.replaceAll("_", " ");
    const estadoClase = order.estado.toLowerCase();

    return `
      <article class="order-summary">
        <h3>
          <span>Código: ${order.codigo}</span>
          <span class="order-status-pill ${estadoClase}">${estadoLimpio}</span>
        </h3>
        <div class="order-info-grid">
          <div><strong>Mesa:</strong> ${order.mesa || "Sin mesa"}</div>
          <div><strong>Cliente:</strong> ${order.nombre_cliente || "Sin referencia"}</div>
          <div style="grid-column: span 2; display: flex; gap: 10px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
            <span><strong>Fecha:</strong> ${new Date(order.fecha_hora || order.created_at).toLocaleDateString("es-EC")}</span>
            <span><strong>Hora:</strong> <span class="order-time-tag">${new Date(order.fecha_hora || order.created_at).toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
          </div>
        </div>
        ${order.observacion ? `<p style="margin: 8px 0; font-size: 13px;"><strong>Observación:</strong> <em>${order.observacion}</em></p>` : ""}
        <ul aria-label="Detalle de productos">
          ${(order.items || []).map((item) => `
            <li><strong>${item.cantidad}x</strong> ${item.nombre || item.plato} <span style="float: right; color: var(--main-color);">${money(item.subtotal)}</span></li>
          `).join("")}
        </ul>
        <div class="order-total-block">
          <span>Total Consumido:</span>
          <strong style="color: var(--main-color); font-size: 18px;">${money(order.total)}</strong>
        </div>
      </article>
    `;
  }).join("");
}

renderOrders();
