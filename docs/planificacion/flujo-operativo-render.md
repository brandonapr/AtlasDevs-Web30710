# Flujo operativo Git, Supabase y Render

## Estado base

- Rama principal publicada: `main`.
- Rama integrada en principal: `codex/supabase-menu-render`.
- Deploy esperado en Render: servicio estatico `edvalledigital-menu`.
- Build de Render: `npm run build:static`.
- Carpeta publicada: `dist/web`.
- Fuente actual del prototipo: `Diseño WEB`.

## Reglas de ramas

1. `main` queda como version estable y demostrable.
2. `develop` se usa para integracion del sprint si el equipo trabaja en paralelo.
3. Cada tarea sale desde `main` o `develop`, segun lo acordado para el sprint.
4. No se hacen commits directos a `main` para cambios funcionales.
5. Todo cambio debe llegar por pull request.

## Nombres recomendados

- `feature/EDV-xx-nombre-corto` para nuevas funciones.
- `fix/EDV-xx-nombre-corto` para correcciones.
- `docs/EDV-xx-nombre-corto` para documentacion.
- `chore/EDV-xx-nombre-corto` para configuracion, CI o despliegue.

## Flujo diario

1. Actualizar base local.

```bash
git switch main
git pull --ff-only origin main
```

2. Crear rama de trabajo.

```bash
git switch -c feature/EDV-xx-nombre-corto
```

3. Hacer cambios pequenos y verificables.

4. Ejecutar validaciones antes de subir.

```bash
npm run build:static
npm run check:supabase
```

5. Subir la rama.

```bash
git push -u origin feature/EDV-xx-nombre-corto
```

6. Abrir pull request hacia `main` o `develop`.

7. Revisar CI, probar en local y aprobar merge.

## Checklist antes de merge

- `git status` limpio.
- `npm run build:static` pasa.
- `npm run check:supabase` pasa.
- Rutas principales revisadas: `/menu/`, `/login/`, `/admin/`, `/caja/`, `/cocina/`, `/mesera/`.
- Si el cambio toca pedidos, se prueba registro y cambio de estado.
- Si el cambio toca Supabase, se actualizan `schema.sql`, `seed.sql` o `roles-y-usuarios.sql`.

## Render

Render debe estar conectado al repositorio `brandonapr/AtlasDevs-Web30710` y desplegar desde `main`.

Configuracion esperada:

- Runtime: `static`.
- Build command: `npm run build:static`.
- Publish directory: `dist/web`.
- Branch: `main`.
- Auto deploy: enabled.

Despues de cada merge a `main`, revisar en Render:

1. El ultimo deploy debe apuntar al commit recien mergeado.
2. El build debe terminar en estado `Live`.
3. La URL publica debe responder 200 en `/`, `/menu/` y `/login/`.
4. Si responde 404 con `x-render-routing: no-server`, la URL no esta vinculada a un servicio activo o el servicio usa otro hostname.

## Supabase

Estado esperado:

- `public.productos` debe tener 25 productos.
- El producto `02` debe existir como `Bolon mixto`.
- Los usuarios internos deben existir en Supabase Auth.
- La tabla `public.perfiles` debe vincular email, nombre y rol.

Orden de carga:

1. Ejecutar `Diseño WEB/supabase/schema.sql`.
2. Ejecutar `Diseño WEB/supabase/seed.sql`.
3. Crear usuarios en Supabase Authentication.
4. Ejecutar `Diseño WEB/supabase/roles-y-usuarios.sql`.
5. Verificar con `npm run check:supabase`.
6. Verificar login con `npm run check:supabase -- --auth`.

## Recuperacion rapida

Si Render no despliega:

1. Confirmar que `main` tenga el commit esperado.
2. Confirmar que Render este configurado para la rama `main`.
3. Confirmar que el servicio use `render.yaml` o los mismos valores manuales.
4. Ejecutar localmente `npm run build:static`.
5. Revisar logs del deploy en Render.
6. Verificar la URL publica real desde el dashboard de Render.
