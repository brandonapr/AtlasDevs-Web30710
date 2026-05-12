let datosPedido = JSON.parse(localStorage.getItem("pedidoRegistrado"));

function mostrarResumen() {
    let caja = document.getElementById("cajaResumen");

    if (datosPedido === null) {
        caja.innerHTML = "<p>No hay información de pedido registrada.</p>";
        return;
    }

    let contenido = "<div class='tarjeta-resumen'>";
    contenido += "<h2>Pedido registrado correctamente</h2>";

    contenido += "<p class='mensaje-info'>";
    contenido += "El pedido ha sido registrado y asociado a la mesa seleccionada. ";
    contenido += "Por favor, acérquese a caja para realizar el pago correspondiente y dar inicio a la preparación de su pedido.";
    contenido += "</p>";

    contenido += "<p><strong>ID del pedido:</strong> " + datosPedido.id + "</p>";
    contenido += "<p><strong>Mesa:</strong> " + datosPedido.mesa + "</p>";
    contenido += "<p><strong>Hora de creación:</strong> " + datosPedido.hora + "</p>";
    contenido += "<p><strong>Acción del sistema:</strong> Pedido enviado a cocina con estado inicial: Pendiente.</p>";

    contenido += "<p><strong>Productos:</strong></p>";
    contenido += "<ul>";

    for (let i = 0; i < datosPedido.productos.length; i++) {
        contenido += "<li>" + datosPedido.productos[i].producto + " - Cantidad: " + datosPedido.productos[i].cantidad + "</li>";
    }

    contenido += "</ul>";
    contenido += "</div>";

    caja.innerHTML = contenido;
}

function volverRegistro() {
    window.location.href = "index.html";
}

mostrarResumen();