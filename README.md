# AtlasDevs-Web30710
Repositorio dedicado a la organizacion, versionamiento y desarrollo del proyecto EDValleDigital para Ensaladas del Valle.
____
## Base actual
- Documentacion formal del acta en `docs/actas`.
- Planificacion inicial y automatizacion de requests en `docs/planificacion`.
- Insumo para carga de tareas en Jira en `docs/jira`.
- Estructura base de web app en `apps/web` y `apps/api`.
- Prototipo funcional HTML/CSS/JS puro en `Diseño WEB`.

## Prototipo EDValleDigital
- Menu publico: `Diseño WEB/menu`.
- Area privada: `Diseño WEB/login`, `admin`, `caja`, `cocina`, `mesera`.
- SQL de Supabase: `Diseño WEB/supabase`.
- Guia de pruebas: `Diseño WEB/docs/PRUEBAS_SUPABASE.md`.
- Build estatico para Render: `npm run build:static`.
- Verificacion Supabase: `npm run check:supabase`.

## Orden recomendado de trabajo
1. Revisar [distribucion y ejecucion](./docs/planificacion/distribucion-y-ejecucion.md).
2. Confirmar [colaboradores y asignaciones](./docs/planificacion/colaboradores-y-asignaciones.md).
3. Cargar el backlog inicial en Jira desde `docs/jira/jira-import-calendario.csv`.
4. Crear ramas por ticket y trabajar sobre `develop`.

## Flujo de colaboracion
- Jira para backlog y seguimiento.
- Git para ramas, revision, merge y trazabilidad del trabajo.
- Plantillas de issues y pull requests para ordenar requests y entregables.
