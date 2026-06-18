# Scripts del proyecto

Scripts usados para construir, servir y verificar el prototipo EDValleDigital.

## Comandos desde la raiz del repositorio

| Comando | Proposito |
| --- | --- |
| `npm.cmd run build:static` | Genera `dist/web` para despliegue estatico en Render. |
| `node scripts/serve.mjs` | Sirve localmente `dist/web` en `http://localhost:3000`. |
| `npm.cmd run test:roles` | Verifica rutas privadas, usuarios de prueba y matriz de roles. |
| `npm.cmd run check:supabase` | Comprueba conexion publica a Supabase y productos. |
| `npm.cmd run check:supabase -- --auth` | Valida login de usuarios de prueba y roles. |
| `npm.cmd run setup:supabase-auth` | Crea o actualiza usuarios Auth y perfiles usando `.env`. |
| `npm.cmd run test:mvp` | Ejecuta prueba integral del flujo MVP con Supabase. |

## Variables locales

Los comandos que administran usuarios o ejecutan el MVP completo requieren un archivo `.env` local basado en `.env.example`.

Ese archivo no debe subirse al repositorio.

## Notas de Windows

Si PowerShell bloquea `npm` por politica de ejecucion, usar `npm.cmd run ...`.
