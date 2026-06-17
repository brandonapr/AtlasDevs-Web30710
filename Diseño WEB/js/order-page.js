import { consultarPedido } from "/js/supabase-service.js";

const STORAGE_ORDER_REFS = "edv_order_refs";
const ordersList = document.querySelector("#ordersList");

function money(value) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readReferences() {
  const references = JSON.parse(localStorage.getItem(STORAGE_ORDER_REFS) || "[]");
  const lastOrder = JSON.parse(localStorage.getItem("edv_last_order") || "null");
  if (lastOrder?.codigo && !references.includes(lastOrder.codigo)) references.unshift(lastOrder.codigo);
  return [...new Set(references)].slice(0, 10);
}

async function loadKnownOrders() {
  const references = readReferences();
  const orders = await Promise.all(
    references.map(async (codigo) => {
      try {
        return await consultarPedido(codigo);
      } catch {
        return null;
      }
    })
  );
  return orders.filter(Boolean);
}

function renderOrder(order) {
  const estadoLimpio = order.estado.replaceAll("_", " ");
  const paidLabel = order.pago_confirmado
    ? `<span class="payment-badge paid">Pagado: ${escapeHtml(order.metodo_pago)}</span>`
    : `<span class="payment-badge">Pago pendiente</span>`;

  return `
    <article class="order-summary">
      <h3>
        <span>Codigo: ${escapeHtml(order.codigo)}</span>
        <span class="order-status-pill ${escapeHtml(order.estado)}">${escapeHtml(estadoLimpio)}</span>
      </h3>
      <div class="order-info-grid">
        <div><strong>Mesa:</strong> ${escapeHtml(order.mesa || "Sin mesa")}</div>
        <div><strong>Cliente:</strong> ${escapeHtml(order.nombre_cliente || "Sin referencia")}</div>
        <div><strong>Fecha:</strong> ${new Date(order.fecha_hora).toLocaleString("es-EC")}</div>
        <div>${paidLabel}</div>
      </div>
      ${order.observacion ? `<p><strong>Observacion:</strong> ${escapeHtml(order.observacion)}</p>` : ""}
      <ul aria-label="Detalle de productos">
        ${order.items.map((item) => `
          <li>
            <strong>${item.cantidad}x</strong> ${escapeHtml(item.nombre)}
            ${item.observacion_item ? `<small>${escapeHtml(item.observacion_item)}</small>` : ""}
            <span>${money(item.subtotal)}</span>
          </li>
        `).join("")}
      </ul>
      <div class="order-total-block">
        <span>Total</span>
        <strong>${money(order.total)}</strong>
      </div>
      ${order.estado === "pendiente" ? `
        <a class="secondary-action order-edit-link" href="/menu/?editar=${encodeURIComponent(order.codigo)}">
          Modificar pedido pendiente
        </a>
      ` : ""}
    </article>
  `;
}

async function renderOrders() {
  const orders = await loadKnownOrders();
  if (orders.length === 0) {
    ordersList.innerHTML = `<p class="status-message">Aun no hay pedidos registrados en este navegador.</p>`;
    return;
  }

  ordersList.innerHTML = orders
    .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
    .map(renderOrder)
    .join("");
}

renderOrders().catch((error) => {
  ordersList.innerHTML = `<p class="status-message error">No se pudo consultar el pedido: ${escapeHtml(error.message)}</p>`;
});

setInterval(() => renderOrders().catch(() => {}), 10000);
