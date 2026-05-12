# EDValleDigital - Prototipo Web

Interfaz HTML, CSS y JavaScript puro para el menu digital de Ensaladas del Valle.

## Rutas activas

- `/menu/`: menu publico para comensal, sin login.
- `/menu/:mesa`: menu publico con mesa en la URL.
- `/orden/`: confirmacion local del ultimo pedido.
- `/login/`: ingreso del equipo interno.
- `/admin/`: gestion visual del menu.
- `/caja/`: pedidos entrantes y cierre de ticket.
- `/cocina/`: cola de produccion.
- `/mesera/`: pedidos listos para entregar.

## Datos

- Productos base: `data/productos.json`.
- Usuarios de prueba: `data/usuarios-prueba.json`.
- Configuracion Supabase: `js/supabase-config.js`.
- Servicios de datos: `js/supabase-service.js`.

Supabase se usa primero. Si las tablas no estan listas o estan vacias, el menu cae al JSON local para no romper la experiencia.

## Usuarios de prueba

Estos usuarios se muestran como usuario + contrasena en la interfaz, aunque Supabase Auth guarda correo + contrasena.

| Usuario | Rol | Ruta | Correo Auth | Clave |
| --- | --- | --- | --- | --- |
| Admin | Administradora | `/admin/` | `admin@ensaladasdelvalle.com` | `admin123` |
| Jhoana | Caja / Duena | `/caja/` | `jhoana@ensaladasdelvalle.com` | `johana123` |
| Cocina | Cocinero | `/cocina/` | `cocina@ensaladasdelvalle.com` | `cocina123` |
| Mesera | Mesera | `/mesera/` | `mesera@ensaladasdelvalle.com` | `mesera123` |

Estas claves son solo para pruebas. Antes de publicar un entorno real, deben cambiarse por claves fuertes.

## SQL

1. Ejecutar `supabase/schema.sql`.
2. Ejecutar `supabase/seed.sql`.
3. Crear usuarios en Supabase Authentication.
4. Ejecutar `supabase/roles-y-usuarios.sql`.

## Verificacion local

Desde la raiz del repositorio:

```bash
npm run check:supabase
npm run check:supabase -- --auth
npm run build:static
```

`check:supabase` confirma productos. Con `--auth` confirma los usuarios internos y sus roles.
