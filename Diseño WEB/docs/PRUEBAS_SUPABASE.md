# Pruebas Supabase y Persistencia

## Estado esperado antes de probar

- `public.productos` tiene 25 productos.
- El producto `02` se llama `Bolon mixto`.
- Existen usuarios en Supabase Auth para Admin, Jhoana, Cocina y Mesera.
- `public.perfiles` vincula cada usuario Auth con su rol interno.
- Existen las funciones RPC del MVP: `registrar_pedido_publico`, `modificar_pedido_pendiente`, `cambiar_estado_pedido` y `registrar_pago_pedido`.

## Preparacion de base de datos

Ejecutar en Supabase SQL Editor, en este orden:

```sql
-- 1. Estructura base
-- Diseño WEB/supabase/schema.sql

-- 2. Productos iniciales
-- Diseño WEB/supabase/seed.sql

-- 3. Cierre funcional RF01-RF08
-- Diseño WEB/supabase/mvp-final.sql
```

Despues crea un archivo local `.env` basado en `.env.example` y coloca `SUPABASE_SECRET_KEY` solo en tu maquina. Ese archivo no se sube al repositorio.

## Comandos de verificacion

Desde la raiz del repositorio:

```bash
npm.cmd run build:static
npm.cmd run test:roles
npm.cmd run setup:supabase-auth
npm.cmd run check:supabase -- --auth
npm.cmd run test:mvp
```

Si usas Git Bash o una terminal donde `npm` no este bloqueado por PowerShell, puedes usar `npm run ...` en lugar de `npm.cmd run ...`.

## Flujo funcional

1. Entrar a `/menu/`.
2. Agregar productos al pedido.
3. Completar nombre, mesa y observacion.
4. Registrar pedido.
5. Revisar en Supabase `pedidos` y `pedido_items`.
6. Entrar a `/login/` con `Jhoana / johana123`.
7. Enviar pedido a cocina.
8. Entrar con `Cocina / cocina123`.
9. Marcar pedido en preparacion y luego listo.
10. Entrar con `Mesera / mesera123`.
11. Marcar pedido entregado.
12. Volver a Caja, generar cuenta y registrar pago.

## Consultas SQL utiles

```sql
select count(*) from public.productos;

select id, nombre, precio, imagen
from public.productos
where id = '02';

select codigo, estado, mesa, nombre_cliente, total, fecha_hora
from public.pedidos
order by fecha_hora desc;

select pedido_codigo, producto_id, nombre, cantidad, precio_unitario, subtotal
from public.pedido_items
order by id desc;

select email, nombre, rol
from public.perfiles
order by rol;

select estado_id, nombre_estado, orden_flujo, es_final
from public.estados_pedido
order by orden_flujo;
```
