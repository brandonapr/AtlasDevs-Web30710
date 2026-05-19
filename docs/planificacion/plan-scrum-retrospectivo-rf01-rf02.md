# Plan Scrum retrospectivo - RF01 y RF02

## Contexto del proyecto

Proyecto: EDValleDigital para Ensaladas del Valle.

Documento base analizado: `Diseño WEB/Por Editar.docx`.

Fecha de corte documental: 12 de mayo de 2026.

Para mantener coherencia con la idea de cuatro semanas de trabajo, esta planificacion simula el inicio del proceso el 14 de abril de 2026 y el cierre parcial el 12 de mayo de 2026. El documento original tambien menciona un Sprint 1 del 11 al 25 de mayo de 2026; se recomienda tratar esa fecha como una planificacion futura o ajustar el texto si se desea presentar el avance ya construido.

## Resumen funcional del avance

Hasta el corte del 12 de mayo de 2026, el avance funcional cubre principalmente:

- RF01 - Ver menu: carta digital responsive, productos visuales, busqueda, categorias, precios, imagenes y disponibilidad.
- RF02 - Registrar pedido: carrito, cantidades, datos del cliente, mesa, observacion, total y registro del pedido.

Adicionalmente, se preparo una base tecnica para:

- Supabase como persistencia de productos, pedidos, detalle de pedidos y perfiles.
- Render como despliegue publico del menu.
- Rutas privadas para caja, cocina, mesera y administracion.

## Roles Scrum

| Persona | Rol Scrum | Responsabilidad principal |
| --- | --- | --- |
| Brandon Pazmino | Scrum Master | Facilitar ceremonias, remover impedimentos, controlar evidencias, versionamiento y cumplimiento del proceso. |
| Daniel Palacios | Product Owner | Priorizar requisitos, validar con la cliente, aceptar incrementos y asegurar valor de negocio. |
| Brithany Lopez | Developer Junior | Interfaz visual, menu responsive, estilos, tarjetas de productos y experiencia del comensal. |
| Daniela Freire (Dani) | Developer Junior | Logica JavaScript, carrito, estructura de datos, pedidos, Supabase y despliegue. |

## Product Goal del primer corte

Entregar un MVP navegable que permita al comensal visualizar el menu digital y generar una orden inicial, dejando preparada la base para que caja, cocina y mesera operen el flujo de estados en iteraciones posteriores.

## Roadmap de 4 semanas

### Sprint 0 - Descubrimiento y organizacion

Periodo: 14 al 20 de abril de 2026.

Objetivo: entender el problema operativo, definir roles, levantar requisitos iniciales y preparar la base de trabajo.

Entregables:

- Vision del producto.
- Roles Scrum definidos.
- Primer backlog funcional.
- Flujo actual del restaurante identificado.
- Repositorio base y tablero de trabajo propuesto.

Responsables:

- Brandon: estructura de trabajo, Git, evidencias y reglas de colaboracion.
- Daniel: validacion con cliente, priorizacion inicial y criterios de aceptacion.
- Brithany: referencias visuales y primeras ideas de interfaz.
- Dani: analisis de estructura tecnica y opciones de persistencia.

### Sprint 1 - Modelado funcional y casos de uso

Periodo: 21 al 27 de abril de 2026.

Objetivo: transformar el levantamiento en requisitos, casos de uso y plan de implementacion.

Entregables:

- Requerimientos RF01 a RF08.
- Requerimientos no funcionales RNF01 a RNF05.
- Diagrama de casos de uso.
- Backlog refinado.
- Criterios de aceptacion para RF01 y RF02.

Responsables:

- Brandon: seguimiento Scrum, minutas, control de impedimentos.
- Daniel: ordenamiento de requisitos, aprobacion del alcance MVP.
- Brithany: modelado de interfaz para menu y flujo del comensal.
- Dani: modelo de datos preliminar para productos y pedidos.

### Sprint 2 - Implementacion RF01 Ver Menu

Periodo: 28 de abril al 4 de mayo de 2026.

Objetivo: construir el menu publico visual y responsive.

Entregables:

- Ruta publica `/menu/`.
- Tarjetas visuales de productos.
- Buscador.
- Filtros por categoria.
- Imagenes organizadas en `img/platos`.
- JSON de productos.
- Vista responsive para movil y escritorio.

Responsables:

- Brithany: diseno visual, CSS, tarjetas, responsive y experiencia del comensal.
- Dani: carga automatica desde JSON, normalizacion de datos, busqueda y filtros.
- Daniel: validacion de productos, precios, categorias y experiencia con cliente.
- Brandon: revision de cumplimiento, control de cambios y evidencias.

### Sprint 3 - Implementacion RF02 Registrar Pedido y despliegue

Periodo: 5 al 12 de mayo de 2026.

Objetivo: permitir que el comensal arme y registre una orden digital.

Entregables:

- Carrito "Mi pedido".
- Controles para agregar, sumar, restar y eliminar productos.
- Formulario con nombre/referencia, mesa y observacion.
- Total general y subtotales.
- Registro del pedido con estado inicial `pendiente`.
- Fallback con localStorage.
- Preparacion de Supabase.
- Despliegue en Render.

Responsables:

- Dani: logica de carrito, registro de pedido, servicios Supabase y fallback.
- Brithany: ajustes visuales del carrito, panel responsive y mensajes de estado.
- Daniel: prueba funcional, validacion del flujo de pedido y aceptacion del incremento.
- Brandon: integracion, revision de rama, despliegue y evidencias de avance.

## Ceremonias sugeridas

| Ceremonia | Frecuencia | Duracion | Participantes | Resultado esperado |
| --- | --- | --- | --- | --- |
| Sprint Planning | Inicio de cada sprint | 45 min | Todo el equipo | Sprint Goal, tareas comprometidas y responsables. |
| Daily Scrum | 3 veces por semana | 15 min | Scrum Master y Developers | Avance, bloqueos y plan del dia. |
| Refinamiento de backlog | 1 vez por semana | 30 min | Product Owner, Scrum Master y Developers | Historias con criterios de aceptacion claros. |
| Sprint Review | Fin de cada sprint | 30 min | Todo el equipo y cliente si es posible | Demostracion del incremento. |
| Retrospective | Fin de cada sprint | 20 min | Equipo Scrum | Mejoras de proceso para el siguiente sprint. |

## Backlog priorizado

| ID | Tipo | Titulo | Prioridad | SP | Responsable | Sprint |
| --- | --- | --- | --- | --- | --- | --- |
| EDV-EPIC-01 | Epica | Menu digital y pedido inicial | Alta | - | Daniel | Todos |
| EDV-001 | Historia | RF01 Ver menu digital | Alta | 8 | Brithany | Sprint 2 |
| EDV-002 | Tarea | Organizar imagenes de platos | Alta | 3 | Brithany | Sprint 2 |
| EDV-003 | Tarea | Crear JSON de productos | Alta | 5 | Dani | Sprint 2 |
| EDV-004 | Tarea | Implementar busqueda y filtros | Media | 3 | Dani | Sprint 2 |
| EDV-005 | Historia | RF02 Registrar pedido | Alta | 8 | Dani | Sprint 3 |
| EDV-006 | Tarea | Crear carrito y totales | Alta | 5 | Dani | Sprint 3 |
| EDV-007 | Tarea | Disenar panel Mi pedido | Alta | 3 | Brithany | Sprint 3 |
| EDV-008 | Tarea | Preparar Supabase schema y seed | Media | 5 | Dani | Sprint 3 |
| EDV-009 | Tarea | Desplegar menu en Render | Media | 3 | Brandon | Sprint 3 |
| EDV-010 | Tarea | Validar incremento RF01/RF02 | Alta | 3 | Daniel | Sprint 3 |

## Criterios de aceptacion principales

### RF01 - Ver menu

- El comensal puede acceder sin login.
- El menu muestra productos con imagen, nombre, descripcion, categoria y precio.
- La interfaz se adapta a celular y escritorio.
- Existe busqueda por nombre, categoria, codigo o descripcion.
- Existen filtros de categoria.

### RF02 - Registrar pedido

- El comensal puede agregar productos al carrito.
- Puede aumentar, disminuir o eliminar cantidades.
- El sistema calcula subtotal y total.
- Antes de registrar pide nombre/referencia, mesa y observacion.
- El pedido se registra con estado inicial `pendiente`.
- Si Supabase no esta disponible, el sistema usa localStorage como respaldo.

## Riesgos e impedimentos registrados

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Equipo junior con curva de aprendizaje en Git, JS y Supabase | Medio | Tareas pequenas, revisiones frecuentes y apoyo del Scrum Master. |
| Datos de productos incompletos o imagenes faltantes | Medio | JSON con placeholder y tabla de referencias. |
| Despliegue dependiente de permisos de GitHub/Render | Medio | Uso de rama dedicada y Public Git Repository en Render. |
| Supabase sin datos o usuarios Auth no creados | Alto | Scripts `seed.sql`, `roles-y-usuarios.sql` y `check:supabase`. |
| Alcance amplio para un primer corte | Alto | Priorizar RF01 y RF02; dejar admin completo, QR formal y cobro para siguientes sprints. |

## Estado actual frente al diagrama de casos de uso

Completado o parcialmente completado:

- Ver menu.
- Generar orden digital.
- Visualizar pedidos entrantes.
- Ver cola de produccion.
- Actualizar estado del pedido.
- Recibir aviso de plato listo como vista por estado.
- Gestionar menu de forma inicial.

Pendiente:

- Login validado completamente en produccion.
- Validar cobro fisico como accion formal.
- Cerrar ticket con comprobante completo.
- CRUD administrativo real.
- Activar/desactivar platos desde interfaz.
- QR generado y documentado como artefacto, aunque puede resolverse con el link publico del menu.

## Recomendacion Scrum Master

Para presentar el avance del primer corte, se recomienda declarar que se ejecutaron cuatro iteraciones semanales de baja duracion. El alcance entregado debe centrarse en RF01 y RF02, porque son los requisitos que generan valor visible y permiten demostrar un flujo inicial completo: el comensal consulta el menu, arma su pedido y registra una orden.

El siguiente Sprint deberia enfocarse en autenticacion de actores, validacion de roles y consolidacion del flujo de caja-cocina-mesera antes de avanzar con el CRUD administrativo completo.
