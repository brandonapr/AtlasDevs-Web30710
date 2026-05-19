# Pruebas Supabase y Persistencia

## Estado esperado antes de probar

- `public.productos` tiene 25 productos.
- El producto `02` se llama `Bolon mixto`.
- Existen usuarios en Supabase Auth para Admin, Jhoana, Cocina y Mesera.
- `public.perfiles` vincula cada usuario Auth con su rol interno.

## Comandos de verificacion

Desde `C:\Users\Mauro\Desktop\AtlasDev`:

```bash
npm run check:supabase
npm run check:supabase -- --auth
```

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
```
