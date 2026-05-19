-- EDValleDigital - consultas rapidas de verificacion.

select count(*) as total_productos from public.productos;

select id, nombre, precio, imagen
from public.productos
where id = '02';

select email, nombre, rol
from public.perfiles
order by rol, email;

select codigo, estado, mesa, nombre_cliente, total, fecha_hora
from public.pedidos
order by fecha_hora desc
limit 20;

select pedido_codigo, producto_id, nombre, cantidad, precio_unitario, subtotal
from public.pedido_items
order by id desc
limit 50;
