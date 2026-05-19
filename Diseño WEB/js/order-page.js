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

  ordersList.innerHTML = orders.map((order) => `
    <article class="order-summary">
      <h3>${order.codigo}</h3>
      <p><strong>Estado:</strong> ${order.estado}</p>
      <p><strong>Mesa:</strong> ${order.mesa || "Sin mesa"} · <strong>Cliente:</strong> ${order.nombre_cliente || "Sin referencia"}</p>
      <p><strong>Fecha:</strong> ${new Date(order.fecha_hora || order.created_at).toLocaleString("es-EC")}</p>
      ${order.observacion ? `<p><strong>Observación:</strong> ${order.observacion}</p>` : ""}
      <ul>
        ${(order.items || []).map((item) => `
          <li>${item.cantidad} x ${item.nombre || item.plato} · ${money(item.subtotal)}</li>
        `).join("")}
      </ul>
      <p><strong>Total:</strong> ${money(order.total)}</p>
    </article>
  `).join("");
}

renderOrders();
