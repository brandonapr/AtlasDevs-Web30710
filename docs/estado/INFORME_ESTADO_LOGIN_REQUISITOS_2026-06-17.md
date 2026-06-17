# Informe de estado: login, actores y requisitos

**Proyecto:** EDValleDigital - AtlasDevs-Web30710  
**Fecha de corte:** 17 de junio de 2026  
**Rama revisada:** `main`  
**Repositorio:** `https://github.com/brandonapr/AtlasDevs-Web30710.git`

## 1. Estado Git

La copia local fue actualizada mediante `git pull --ff-only`.

```text
## main...origin/main
```

Resultado después del `pull`:

- Rama local sincronizada con `origin/main`.
- Commit actual: `120b669`.

Estado al finalizar este informe:

```text
## main...origin/main
?? docs/estado/
```

El único archivo sin seguimiento es este informe. No existen cambios pendientes en el código de la aplicación.

## 2. Validaciones ejecutadas

| Validación | Resultado | Observación |
| --- | --- | --- |
| `npm run build:web` | Aprobado | Los archivos JS de registro de pedidos pasan validación de sintaxis. |
| `npm run build:static` | Aprobado | Se genera correctamente `dist/web` para Render. |
| `npm run test:roles` | Aprobado | La matriz contiene cuatro roles privados, usuarios, rutas y controladores esperados. |
| `npm run check:supabase` | Bloqueado | El dominio configurado de Supabase no resuelve por DNS. |
| `npm run check:supabase -- --auth` | Bloqueado | No fue posible autenticar los cuatro actores porque Supabase no es accesible. |

## 3. Árbol de ordenamiento del proyecto

```text
AtlasDevs-Web30710/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── api/
│   └── web/
├── Diseño WEB/
│   ├── menu/                 # Comensal: menú público
│   ├── orden/                # Comensal: seguimiento del pedido
│   ├── login/                # Acceso del personal interno
│   ├── admin/                # Administradora
│   ├── caja/                 # Caja / Jhoana
│   ├── cocina/               # Cocinero
│   ├── mesera/               # Mesera
│   ├── js/
│   │   ├── menu.js
│   │   ├── order-page.js
│   │   ├── private.js
│   │   ├── supabase-config.js
│   │   └── supabase-service.js
│   ├── data/
│   │   ├── productos.json
│   │   ├── roles.json
│   │   └── usuarios-prueba.json
│   ├── supabase/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   └── roles-y-usuarios.sql
│   └── css/
├── docs/
│   ├── actas/
│   ├── diseno/
│   ├── jira/
│   ├── planificacion/
│   └── estado/
├── registro_pedidos/         # Prototipo alterno de RF02
├── scripts/
│   ├── build-static.mjs
│   ├── check-supabase.mjs
│   ├── serve.mjs
│   └── test-roles.mjs
├── render.yaml
└── package.json
```

## 4. Estado del login por actor

| Actor | Acceso | Ruta | Estado |
| --- | --- | --- | --- |
| Comensal | Sin login | `/menu/`, `/orden/` | Implementado |
| Administradora | Supabase Auth + perfil `administradora` | `/admin/` | Implementado, falta prueba real de Auth |
| Caja / Jhoana | Supabase Auth + perfil `caja` | `/caja/` | Implementado, falta prueba real de Auth |
| Cocina | Supabase Auth + perfil `cocinero` | `/cocina/` | Implementado, falta prueba real de Auth |
| Mesera | Supabase Auth + perfil `mesera` | `/mesera/` | Implementado, falta prueba real de Auth |

La prueba automatizada actual verifica estructura, rutas y presencia de controles, pero no inicia sesión realmente. El cierre requiere restaurar o reemplazar el proyecto Supabase configurado y ejecutar los cuatro accesos.

### Riesgos de seguridad pendientes

- Las credenciales demo se muestran públicamente en la pantalla de login.
- Las contraseñas demo son débiles y no deben utilizarse en producción.
- La política RLS `pedidos_internal_update` permite actualizar pedidos a cualquier usuario autenticado; debe restringirse por rol y transición de estado.
- La autorización depende parcialmente de controles JavaScript del cliente.
- Falta evidencia de expiración de sesión, recuperación de contraseña y bloqueo por intentos fallidos.

## 5. Estado de los ocho requisitos funcionales

Los ocho requisitos indicados corresponden a **requisitos funcionales (RF01 a RF08)**. Los requisitos no funcionales documentados por separado son **RNF01 a RNF05**.

| Requisito | Estado | Evidencia / brecha |
| --- | --- | --- |
| RF01 - Ver menú digital | Completado | Menú, búsqueda, categorías, imágenes, precio y disponibilidad. |
| RF02 - Registrar pedido | Completado con reserva | Carrito, mesa, observación, total y fallback local. Falta validar persistencia real en Supabase. |
| RF03 - Modificar pedido | Parcial | El carrito permite cambiar cantidades antes del registro. Falta definir y probar si un pedido ya enviado puede modificarse y bajo qué estado o actor. |
| RF04 - Generar cuenta | Parcial avanzado | Caja visualiza productos, cantidades y total. Falta formalizar la cuenta o comprobante y probar el cálculo integral. |
| RF05 - Actualizar estado del pedido | Parcial avanzado | Existen transiciones pendiente, recibido, en preparación, listo y cerrado. Falta prueba real multiusuario con Supabase. |
| RF06 - Ver pedidos pendientes | Implementado con reserva | Caja y cocina filtran pedidos por estados. Falta validar actualización entre sesiones y orden cronológico en producción. |
| RF07 - Registrar pago | Parcial | Existe selector visual de método de pago, pero el pago y su método no se almacenan en el esquema actual. |
| RF08 - Gestionar menú | Parcial avanzado | Se pueden actualizar precio y disponibilidad. Falta completar y probar el CRUD de productos con seguridad de administradora. |

## 6. Estado de requisitos no funcionales

| Requisito | Estado | Pendiente para cierre |
| --- | --- | --- |
| RNF01 - Responsividad | Parcial avanzado | Ejecutar evidencia en móvil, tableta y escritorio para todas las rutas. |
| RNF02 - Rendimiento | Parcial | Definir métricas: carga inicial, filtrado y respuesta de acciones; medir en Render. |
| RNF03 - Seguridad por roles | Parcial crítico | Recuperar Supabase, probar cuatro actores, endurecer RLS y retirar credenciales públicas. |
| RNF04 - Acceso público del comensal | Completado | Confirmar por caja negra que `/menu/` y `/orden/` no exigen sesión. |
| RNF05 - Mantenibilidad | Parcial / definición pendiente | Formalizar su descripción; reducir estilos inline, duplicidad y corregir inconsistencias documentales. |

## 7. Orden recomendado para finiquitar

```text
1. Normalizar ERS
   └── Documentar los ocho RF con criterios verificables y definir el alcance exacto de modificar pedido y generar cuenta.

2. Recuperar Supabase
   └── Confirmar URL, publishable key, tablas, Auth y perfiles.

3. Completar login de actores
   ├── Administradora
   ├── Caja
   ├── Cocina
   └── Mesera

4. Endurecer seguridad
   └── RLS por rol, sesiones, contraseñas y acceso directo a rutas.

5. Cerrar flujo operativo
   └── Ver menú → registrar/modificar pedido → ver pendientes → actualizar estado → generar cuenta → registrar pago.

6. Completar RF03, RF04, RF07 y RF08
   ├── Definir modificación antes y después del envío.
   ├── Generar cuenta verificable.
   ├── Persistir pago y método.
   └── CRUD real: crear, editar, activar/desactivar y validar productos.

7. Verificar RNF
   ├── Responsividad
   ├── Rendimiento
   ├── Seguridad
   ├── Acceso público
   └── Mantenibilidad

8. Evidencia y entrega
   └── Casos de caja negra, capturas de Render, resultados CI y matriz de trazabilidad.
```

## 8. Criterio de finalización

El proyecto puede declararse finalizado cuando:

1. Los cuatro actores internos autentican realmente y solo acceden a su ruta.
2. El comensal accede sin login.
3. Un pedido completa el flujo de extremo a extremo con dos navegadores o sesiones independientes.
4. La modificación del pedido respeta las reglas definidas.
5. La cuenta se genera con detalle y total correctos.
6. El método de pago queda almacenado.
7. Administración realiza CRUD real con políticas de seguridad.
8. Los cinco RNF tienen métrica, evidencia y resultado.
9. Render, CI, Supabase y documentación muestran el mismo estado de versión.

## 9. Conclusión

El repositorio está ordenado, sincronizado y construye correctamente. La base de interfaces y roles está avanzada, pero el proyecto todavía no debe declararse terminado: la autenticación real está bloqueada por la conexión DNS de Supabase; RF03 requiere completar sus reglas; RF04 necesita una cuenta formal; RF07 no persiste el pago; y RF08 todavía no constituye un CRUD completo probado. La prioridad inmediata es recuperar Supabase y ejecutar pruebas de caja negra reales con los cuatro actores.
