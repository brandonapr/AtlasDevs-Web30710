# Estructura sugerida del proyecto

## Objetivo
Organizar el desarrollo de EDValleDigital como una web app en JavaScript con espacio para frontend, backend, documentación y automatización.

## Carpetas base
- `apps/web`: interfaz para comensal, caja, cocina y administración.
- `apps/api`: servicios para órdenes, menú, estados y autenticación futura.
- `docs/actas`: actas formales del proyecto.
- `docs/jira`: insumos para carga o seguimiento en Jira.
- `docs/planificacion`: backlog, requests, automatización y acuerdos.
- `.github/workflows`: automatizaciones CI/CD con GitHub Actions.

## Enfoque recomendado
- Frontend: React con Vite.
- Backend: Node.js con Express o Fastify.
- Tiempo real: WebSockets o Socket.IO.
- Despliegue: Render para pruebas.
- Gestión: Jira.
- Control de versiones: Git con ramas `main`, `develop` y `feature/*`.
