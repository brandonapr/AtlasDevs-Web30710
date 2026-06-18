# Supabase

Scripts SQL para preparar la persistencia, autenticacion interna y funciones del MVP.

## Orden de ejecucion recomendado

1. Ejecutar `schema.sql`.
2. Ejecutar `seed.sql`.
3. Crear usuarios en Supabase Auth o ejecutar `npm.cmd run setup:supabase-auth` con `.env` local.
4. Ejecutar `roles-y-usuarios.sql` si los usuarios se crean manualmente.
5. Ejecutar `mvp-final.sql`.
6. Verificar con `verificacion.sql`.

## Archivos

| Archivo | Proposito |
| --- | --- |
| `schema.sql` | Crea tablas base, indices, triggers y politicas iniciales. |
| `seed.sql` | Carga productos iniciales del menu. |
| `roles-y-usuarios.sql` | Vincula usuarios Auth con perfiles internos. |
| `mvp-final.sql` | Agrega estados, pago, historial y funciones RPC del flujo completo. |
| `verificacion.sql` | Consultas para revisar productos, perfiles, pedidos e items. |

## Funciones RPC principales

| Funcion | Uso |
| --- | --- |
| `registrar_pedido_publico` | Crear pedido desde el menu publico. |
| `consultar_pedido_publico` | Consultar detalle de un pedido. |
| `modificar_pedido_pendiente` | Editar pedido mientras sigue pendiente. |
| `cambiar_estado_pedido` | Cambiar estado segun rol autorizado. |
| `registrar_pago_pedido` | Registrar pago y cerrar ticket desde caja. |

## Validaciones

Desde la raiz del repositorio:

```bash
npm.cmd run check:supabase
npm.cmd run check:supabase -- --auth
npm.cmd run test:mvp
```

`test:mvp` requiere `.env` con `SUPABASE_SECRET_KEY`.
