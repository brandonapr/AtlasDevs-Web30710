-- EDValleDigital - verificacion y vinculacion de actores internos.
-- Las credenciales se crean en Supabase Dashboard > Authentication > Users.
-- Luego usa los UUID de auth.users para insertarlos en public.perfiles.

-- 1) Ver usuarios creados en Supabase Auth.
select
  id,
  email,
  created_at,
  last_sign_in_at
from auth.users
order by created_at desc;

-- 2) Ver perfiles/roles internos ya vinculados.
select
  id,
  email,
  nombre,
  rol,
  created_at
from public.perfiles
order by rol, email;

-- 3) Resumen por rol. Debe haber 1 por actor cuando termines la configuracion.
select
  rol,
  count(*) as usuarios
from public.perfiles
group by rol
order by rol;

-- 4) Credenciales sugeridas para crear en Authentication > Users.
-- El login publico del equipo pedira Usuario + Contrasena, pero Supabase Auth guarda correo + contrasena.
--
-- Usuario: Admin   | Correo Auth: admin@ensaladasdelvalle.com  | Clave: admin123  | Rol: administradora
-- Usuario: Jhoana  | Correo Auth: jhoana@ensaladasdelvalle.com | Clave: johana123 | Rol: caja
-- Usuario: Cocina  | Correo Auth: cocina@ensaladasdelvalle.com | Clave: cocina123 | Rol: cocinero
-- Usuario: Mesera  | Correo Auth: mesera@ensaladasdelvalle.com | Clave: mesera123 | Rol: mesera
--
-- 5) Vincular usuarios despues de crearlos en Authentication.
-- Esta version busca los UUID automaticamente por correo.
insert into public.perfiles (id, email, nombre, rol)
select id, email, 'Administradora', 'administradora' from auth.users where email = 'admin@ensaladasdelvalle.com'
union all
select id, email, 'Jhoana', 'caja' from auth.users where email = 'jhoana@ensaladasdelvalle.com'
union all
select id, email, 'Cocinero', 'cocinero' from auth.users where email = 'cocina@ensaladasdelvalle.com'
union all
select id, email, 'Mesera', 'mesera' from auth.users where email = 'mesera@ensaladasdelvalle.com'
on conflict (id) do update set
  email = excluded.email,
  nombre = excluded.nombre,
  rol = excluded.rol,
  updated_at = now();
