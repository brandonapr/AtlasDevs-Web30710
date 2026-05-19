# Sprint 01 - Menu y pedidos

## Periodo actualizado

Del 28 de abril al 12 de mayo de 2026.

Este Sprint consolida el trabajo de implementacion del primer corte. Las actividades de descubrimiento, levantamiento y modelado se documentan como Sprint 0 y Sprint de analisis en el archivo `plan-scrum-retrospectivo-rf01-rf02.md`.

## Objetivo

Entregar un incremento funcional que permita al comensal visualizar el menu digital y registrar una orden inicial desde una interfaz responsive.

## Items comprometidos

| ID | Item | Responsable | Estado |
| --- | --- | --- | --- |
| RF01 | Visualizacion del menu digital con productos, precios e imagenes. | Brithany / Dani | Hecho |
| RF01-T1 | Organizacion de imagenes y referencias de platos. | Brithany | Hecho |
| RF01-T2 | Carga de productos desde JSON con busqueda y filtros. | Dani | Hecho |
| RF02 | Registro de pedido digital desde el menu publico. | Dani | Hecho |
| RF02-T1 | Carrito Mi pedido con cantidades, subtotales y total. | Dani | Hecho |
| RF02-T2 | Formulario de nombre, mesa y observacion. | Brithany / Dani | Hecho |
| DEVOPS-01 | Publicacion del prototipo en Render. | Brandon / Dani | Hecho |
| DOC-01 | Evidencias del avance y planificacion Scrum. | Brandon / Daniel | En progreso |

## Criterio de cierre

- El menu publico esta disponible sin login.
- El usuario puede buscar y filtrar platos.
- El usuario puede agregar productos al pedido.
- El pedido solicita nombre o referencia, mesa y observacion.
- El sistema calcula total y subtotales.
- El proyecto esta publicado en Render.
- Supabase queda preparado para persistencia, aunque la carga de seed y usuarios Auth se mantiene como pendiente operativo.

## Pendientes para el siguiente Sprint

- Crear usuarios reales en Supabase Auth.
- Ejecutar `roles-y-usuarios.sql`.
- Validar login de Admin, Jhoana, Cocina y Mesera.
- Probar persistencia completa de pedidos en Supabase.
- Formalizar validacion de cobro fisico y cierre de ticket.
