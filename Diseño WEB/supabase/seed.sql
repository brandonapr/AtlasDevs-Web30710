-- EDValleDigital - datos iniciales desde data/productos.json.
-- Ejecutar despues de supabase/schema.sql.
-- Este seed no borra datos: inserta productos y actualiza si ya existe el mismo codigo.

insert into public.productos (
  id,
  nombre,
  categoria,
  subcategoria,
  descripcion,
  precio,
  imagen,
  disponible,
  destacado,
  etiquetas
)
values
  ('01', 'Batidos naturales', 'Bebidas', 'Batidos', 'Batidos naturales disponibles segun fruta del dia.', 2.00, '/img/platos/01-batidos.jpg', true, true, array['Mas vendido', 'Fresco del dia']::text[]),
  ('02', 'Bolon mixto', 'Bolones', 'Bolones', 'Bolon tradicional de verde mixto con queso y chicharron.', 1.00, '/img/platos/02-bolon-mixto.jpg', true, true, array['Mas vendido']::text[]),
  ('03', 'Bolon de chicharron', 'Bolones', 'Bolones', 'Bolon relleno de chicharron para desayuno o merienda.', 2.50, '/img/platos/03-bolon-de-chicharron.jpg', true, false, array['Disponible']::text[]),
  ('04', 'Bolon de queso', 'Bolones', 'Bolones', 'Bolon de verde relleno con queso derretido.', 2.25, '/img/platos/04-bolon-de-queso.jpg', true, false, array['Disponible']::text[]),
  ('05', 'Desayuno con patacon', 'Desayunos', 'Desayunos', 'Patacon, huevo y bebida caliente de la casa.', 3.75, '/img/platos/05-desayuno-con-patacon.jpg', true, false, array['Nuevo']::text[]),
  ('06', 'Desayuno bolon con jugo de carne', 'Desayunos', 'Desayunos', 'Bolon acompanado con huevo, carne y bebida.', 4.25, '/img/platos/06-desayuno-bolon-jugo-carne.jpg', true, false, array['Disponible']::text[]),
  ('07', 'Desayuno completo', 'Desayunos', 'Desayunos', 'Plato completo con arroz, guarniciones, jugo y cafe.', 5.00, '/img/platos/07-desayuno-completo.jpg', true, true, array['Mas vendido']::text[]),
  ('08', 'Desayuno con bolon y cafe', 'Desayunos', 'Desayunos', 'Bolon acompanado con huevo frito y cafe caliente.', 3.50, '/img/platos/08-desayuno-bolon-cafe.jpg', true, false, array['Disponible']::text[]),
  ('09', 'Desayuno con nata', 'Desayunos', 'Desayunos', 'Pan, nata, huevo, cafe y bebida fria.', 4.25, '/img/platos/09-desayuno-con-nata.jpg', true, false, array['Disponible']::text[]),
  ('10', 'Desayuno continental completo', 'Desayunos', 'Desayunos', 'Huevos, pan con queso, bebida caliente, jugo y fruta.', 4.50, '/img/platos/10-desayuno-continental-completo.jpg', true, true, array['Fresco del dia']::text[]),
  ('11', 'Chocolate con pan de queso', 'Bebidas', 'Bebidas calientes', 'Chocolate caliente servido con pan tostado y queso.', 2.75, '/img/platos/11-chocolate-pan-queso.jpg', true, false, array['Disponible']::text[]),
  ('12', 'Desayuno ranchero especial', 'Desayunos', 'Desayunos', 'Huevo, salchicha, maduro y guarnicion caliente.', 4.25, '/img/platos/12-desayuno-ranchero-especial.jpg', true, false, array['Disponible']::text[]),
  ('13', 'Desayuno ranchero con ensalada de frutas', 'Desayunos', 'Desayunos', 'Desayuno ranchero acompanado con ensalada de frutas.', 5.25, '/img/platos/13-desayuno-ranchero-ensalada-frutas.jpg', true, false, array['Nuevo']::text[]),
  ('14', 'Desayuno ranchero', 'Desayunos', 'Desayunos', 'Huevo, embutido, maduro y acompanantes de la casa.', 4.00, '/img/platos/14-desayuno-ranchero.jpg', true, false, array['Disponible']::text[]),
  ('15', 'Desayuno tigrillo', 'Desayunos', 'Desayunos', 'Tigrillo de verde con huevo y salsa de la casa.', 4.00, '/img/platos/15-desayuno-tigrillo.jpg', true, false, array['Disponible']::text[]),
  ('16', 'Empanadas de arroz', 'Otros', 'Especiales', 'Empanadas rellenas de arroz y vegetales.', 2.00, '/img/platos/16-empanadas-arroz.jpg', true, false, array['Disponible']::text[]),
  ('17', 'Ensalada con crema', 'Ensaladas', 'Ensaladas dulces', 'Copa de fruta con crema batida y sirope.', 2.50, '/img/platos/17-ensalada-con-crema.jpg', true, false, array['Disponible']::text[]),
  ('18', 'Ensalada de durazno', 'Ensaladas', 'Ensaladas dulces', 'Durazno con crema y salsa dulce.', 2.50, '/img/platos/18-ensalada-durazno.jpg', true, false, array['Disponible']::text[]),
  ('19', 'Ensalada de frutas con granola', 'Ensaladas', 'Ensaladas dulces', 'Frutas frescas con granola y topping cremoso.', 2.75, '/img/platos/19-ensalada-frutas-granola.jpg', true, true, array['Fresco del dia']::text[]),
  ('20', 'Ensalada de frutos rojos', 'Ensaladas', 'Ensaladas dulces', 'Frutos rojos, kiwi, crema y decoracion frutal.', 3.00, '/img/platos/20-ensalada-frutos-rojos.jpg', true, false, array['Disponible']::text[]),
  ('21', 'Fresas con crema', 'Ensaladas', 'Postres', 'Fresas frescas servidas con crema batida.', 2.75, '/img/platos/21-fresas-con-crema.jpg', true, false, array['Disponible']::text[]),
  ('22', 'Jugo de naranja', 'Bebidas', 'Jugos', 'Jugo natural de naranja preparado al momento.', 1.50, '/img/platos/22-jugo-naranja.jpg', true, false, array['Fresco del dia']::text[]),
  ('23', 'Pastel de frutas', 'Otros', 'Postres', 'Pastel frio de frutas con porciones para compartir.', 3.25, '/img/platos/23-pastel-frutas.jpg', true, false, array['Nuevo']::text[]),
  ('24', 'Sanduche con cafe', 'Otros', 'Sanduches', 'Sanduche de la casa acompanado con cafe caliente.', 3.50, '/img/platos/24-sanduche-cafe.jpg', true, false, array['Disponible']::text[]),
  ('25', 'Tostadas con queso', 'Otros', 'Tostadas', 'Tostadas doradas con queso fundido y especias.', 2.50, '/img/platos/25-tostadas-queso.jpg', true, false, array['Disponible']::text[])
on conflict (id) do update set
  nombre = excluded.nombre,
  categoria = excluded.categoria,
  subcategoria = excluded.subcategoria,
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  imagen = excluded.imagen,
  disponible = excluded.disponible,
  destacado = excluded.destacado,
  etiquetas = excluded.etiquetas,
  updated_at = now();

-- Despues de crear usuarios en Supabase Auth, vincula cada usuario interno asi:
-- insert into public.perfiles (id, email, nombre, rol)
-- values ('UUID_DEL_USUARIO_AUTH', 'admin@ensaladasdelvalle.com', 'Administradora', 'administradora');
