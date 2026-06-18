# GitHub

Configuracion de colaboracion del repositorio.

## Contenido

| Ruta | Uso |
| --- | --- |
| `ISSUE_TEMPLATE/` | Plantillas para bugs, historias, tareas tecnicas y requests de cliente. |
| `workflows/ci.yml` | Pipeline basico de validacion en GitHub Actions. |
| `CODEOWNERS` | Responsables sugeridos de revision. |
| `PULL_REQUEST_TEMPLATE.md` | Checklist para pull requests. |

## Flujo recomendado

1. Crear o vincular ticket de Jira.
2. Crear rama con formato `feature/EDV-XX-descripcion` o `fix/EDV-XX-descripcion`.
3. Hacer commits pequenos y descriptivos.
4. Abrir pull request con evidencia de pruebas.
5. Revisar checklist antes de mezclar.

## Validaciones esperadas

- `npm install`.
- `npm run build:web --if-present`.
- `npm run build:static`.
- `npm run test:roles`.

Los comandos que requieren credenciales de Supabase se ejecutan localmente y no deben exponer secretos.
