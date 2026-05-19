# Estructura actual del proyecto

## Objetivo

Organizar EDValleDigital como un prototipo web funcional, desplegable y documentado para el primer corte del proyecto.

## Estructura activa

- `Diseño WEB/menu`: menu publico para el comensal.
- `Diseño WEB/orden`: vista de confirmacion y ultimos pedidos.
- `Diseño WEB/login`: ingreso del equipo interno.
- `Diseño WEB/admin`: vista inicial de administracion del menu.
- `Diseño WEB/caja`: vista de pedidos entrantes.
- `Diseño WEB/cocina`: cola de produccion.
- `Diseño WEB/mesera`: pedidos listos.
- `Diseño WEB/css`: estilos del prototipo.
- `Diseño WEB/js`: logica de menu, pedidos, login y servicios Supabase.
- `Diseño WEB/data`: JSON de productos, roles y usuarios de prueba.
- `Diseño WEB/img`: imagenes del menu y marca.
- `Diseño WEB/supabase`: SQL de schema, seed, roles y verificacion.
- `docs/planificacion`: plan Scrum, backlog, sprint y acuerdos.
- `docs/jira`: archivos CSV para carga o referencia en Jira.

## Tecnologia usada en el primer corte

- Frontend: HTML, CSS y JavaScript puro.
- Datos base: JSON local con fallback.
- Persistencia preparada: Supabase.
- Despliegue: Render Static Site.
- Gestion: Jira.
- Control de versiones: GitHub.

## Nota de alcance

La planificacion inicial mencionaba React, Node.js y API dedicada. Para el primer corte se decidio reducir complejidad y entregar un prototipo estatico funcional con Supabase como backend administrado. Esta decision permite validar RF01 y RF02 antes de invertir en una arquitectura mas pesada.
