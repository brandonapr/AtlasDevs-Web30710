# Datos del prototipo

Esta carpeta contiene archivos JSON usados por el frontend como configuracion y respaldo de datos.

## Archivos

| Archivo | Uso |
| --- | --- |
| `productos.json` | Catalogo base de productos para el menu y respaldo si Supabase no responde. |
| `menu.json` | Informacion de menu usada en prototipos o vistas heredadas. |
| `roles.json` | Matriz de roles privados, rutas y permisos. |
| `usuarios-prueba.json` | Usuarios de prueba vinculados a Supabase Auth y perfiles internos. |
| `actores-login.json` | Referencia de actores para la interfaz de autenticacion. |

## Relacion con Supabase

- `productos.json` debe coincidir con los registros cargados por `supabase/seed.sql`.
- `usuarios-prueba.json` debe coincidir con los perfiles creados por `scripts/setup-supabase-auth.mjs`.
- `roles.json` debe mantenerse alineado con las rutas protegidas en `js/private.js`.

## Reglas de mantenimiento

- No guardar claves secretas en estos archivos.
- Mantener codigos de productos con dos digitos cuando aplique.
- Revisar precios, imagenes y disponibilidad antes de una demo.
- Si se agrega un rol nuevo, actualizar tambien Supabase, login y pruebas.
