let pedido = [];
let contadorPedidos = 1;

let productosPorCategoria = {
    bebidas: [
        "Extracto de naranja - $1.75",
        "Extracto de sandía - $1.75",
        "Jugos naturales - $1.50",
        "Chocolate con pan y queso - $4.00"
    ],
    desayunos: [
        "Humita lojana + café - $2.25",
        "Desayuno andino - $4.25",
        "Desayuno continental - $3.50",
        "Desayuno con seco - $5.00",
        "Desayuno del Valle - $4.25",
        "Desayuno para dos - $9.75",
        "Desayuno tigrillo - $5.00"
    ],
    snacks: [
        "Humita lojana - $1.25",
        "Tortilla junior - $2.75",
        "Tortilla completa - $5.00",
        "Patacones clásicos - $4.00",
        "Patacón completo - $6.00",
        "Bolón de queso - $1.50",
        "Bolón mixto - $2.50",
        "Bolón junior - $2.75",
        "Bolón chorreado - $3.50",
        "Empanadas de morocho - $1.50",
        "Pan gratinado - $1.00",
        "Sánduche mixto - $4.25"
    ],
    postres: [
        "Media frutillas con crema - $2.75",
        "Media ensalada de frutas con dulce y crema o yogurt y granola - $2.75",
        "Torta de frutas - $13.00",
        "Durazno con crema - $4.00",
        "Helado con queso - $3.75",
        "Ensalada de frutas con crema y dulce o yogurt y granola - $3.75",
        "Frutillas con crema - $3.75",
        "Tigrillo tradicional - $4.50",
        "Tigrillo completo - $6.00"
    ]
};

function cargarProductos() {
    let categoria = document.getElementById("categoria").value;
    let producto = document.getElementById("producto");

    producto.innerHTML = "<option value=''>Seleccione un producto</option>";

    if (categoria === "") {
        producto.innerHTML = "<option value=''>Primero seleccione una categoría</option>";
        return;
    }

    for (let i = 0; i < productosPorCategoria[categoria].length; i++) {
        producto.innerHTML += "<option value='" + productosPorCategoria[categoria][i] + "'>" 
                            + productosPorCategoria[categoria][i] + 
                            "</option>";
    }
}

function agregarProducto() {
    let mesa = document.getElementById("mesa").value;
    let categoria = document.getElementById("categoria").value;
    let producto = document.getElementById("producto").value;
    let cantidad = document.getElementById("cantidad").value;

    if (mesa === "") {
        alert("Seleccione una mesa.");
        return;
    }

    if (categoria === "") {
        alert("Seleccione una categoría.");
        return;
    }

    if (producto === "") {
        alert("Seleccione un producto.");
        return;
    }

    if (cantidad <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
    }

    let item = {
        producto: producto,
        cantidad: cantidad
    };

    pedido.push(item);
    mostrarPedido();

    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = 1;
}

function mostrarPedido() {
    let lista = document.getElementById("listaPedido");
    lista.innerHTML = "";

    for (let i = 0; i < pedido.length; i++) {
        lista.innerHTML += "<li class='item-pedido'><span>" + pedido[i].producto + "</span><strong>Cantidad: " + pedido[i].cantidad + "</strong></li>";
    }
}

function registrarPedido() {
    let mesa = document.getElementById("mesa").value;

    if (mesa === "") {
        alert("Debe seleccionar una mesa.");
        return;
    }

    if (pedido.length === 0) {
        alert("Debe agregar al menos un producto al pedido.");
        return;
    }

    let idPedido = "PED-" + contadorPedidos;
    let hora = new Date().toLocaleTimeString();

    let datosPedido = {
        id: idPedido,
        mesa: mesa,
        hora: hora,
        productos: pedido
    };

    localStorage.setItem("pedidoRegistrado", JSON.stringify(datosPedido));

    contadorPedidos++;
    pedido = [];

    window.location.href = "resumen.html";
}
