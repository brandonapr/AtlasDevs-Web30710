# Automatización recomendada del proyecto

## Mejor enfoque
La forma más práctica de automatizar este proyecto no es empezar por automatizar requests sueltos, sino conectar Git, Jira y CI/CD desde el inicio.

## Flujo recomendado
1. Cada requerimiento o tarea nace como ticket en Jira.
2. El ticket crea una rama de trabajo con formato `feature/EDV-XX-descripcion`.
3. Cada push ejecuta validaciones automáticas en GitHub Actions.
4. Los pull requests deben referenciar el ticket de Jira correspondiente.
5. Al cerrar el pull request, el ticket pasa a `Done` o `In Review`.

## Automatizaciones útiles desde el sprint 1
- Plantilla de issue para bugs, historias y tareas técnicas.
- Plantilla de pull request con checklist.
- Workflow para lint y pruebas automáticas.
- Convención de commits: `feat:`, `fix:`, `docs:`, `chore:`.
- Regla de ramas protegidas para `main`.

## Qué automatizar primero
- Jira para seguimiento del backlog y fechas.
- GitHub para ramas, pull requests y revisiones.
- GitHub Actions para validación técnica.
- Deploy de pruebas en Render cuando se actualice `develop`.

## Qué no conviene automatizar todavía
- Generación automática de documentos formales en cada cambio.
- Flujos complejos de release antes de tener MVP.
- Integraciones pesadas si el equipo aún está aprendiendo Git y Jira.
