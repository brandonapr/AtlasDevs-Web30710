# Logica JavaScript

Esta carpeta contiene la logica principal del prototipo EDValleDigital.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `app.js` | Logica general de la pagina de inicio y navegacion base. |
| `menu.js` | Menu publico, carrito, registro y modificacion de pedidos. |
| `order-page.js` | Vista de confirmacion y consulta de pedidos recientes. |
| `private.js` | Login, proteccion de rutas privadas, render de vistas internas y acciones por rol. |
| `supabase-config.js` | Configuracion publica de Supabase para el cliente web. |
| `supabase-service.js` | Capa de acceso a productos, pedidos, perfiles, estados, pagos y administracion. |

## Flujo publico

1. `menu.js` carga productos con `cargarProductos`.
2. El comensal arma el carrito.
3. El pedido se envia mediante `registrarPedido`.
4. Si Supabase no responde, se usa respaldo local para no romper la demo.

## Flujo privado

1. `private.js` valida sesion.
2. Consulta el perfil interno desde Supabase.
3. Redirige segun rol: administradora, caja, cocinero o mesera.
4. Renderiza pedidos o productos segun la vista activa.

## Reglas de mantenimiento

- Mantener la comunicacion con Supabase centralizada en `supabase-service.js`.
- Evitar duplicar consultas directas a Supabase en las vistas.
- Conservar los estados de pedido sincronizados con `supabase/mvp-final.sql`.
- Probar roles con `npm.cmd run test:roles` despues de modificar rutas privadas.
