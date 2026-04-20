# Distribucion y ejecucion del proyecto

## Objetivo
Definir una distribucion clara del trabajo para que el equipo pueda colaborar en Git y Jira sin bloquearse ni duplicar tareas.

## Principios de ejecucion
1. Todo trabajo nace en Jira como historia, tarea tecnica o bug.
2. Ningun cambio se hace directo sobre `main`.
3. Cada tarea activa usa una rama propia y un pull request.
4. Todo entregable debe tener responsable primario y apoyo secundario.
5. La validacion funcional con la cliente ocurre al cierre de cada bloque importante.

## Estructura de ramas
- `main`: version estable y demostrable.
- `develop`: integracion del sprint en curso.
- `feature/EDV-xx-nombre-corto`: desarrollo de historias o tareas.
- `fix/EDV-xx-nombre-corto`: correcciones puntuales.
- `docs/EDV-xx-nombre-corto`: cambios de documentacion.

## Flujo de trabajo
1. Product Owner prioriza backlog en Jira.
2. SCRUM Master confirma capacidad y bloqueos del sprint.
3. Responsable toma un ticket y crea rama asociada.
4. Desarrollo sube avances pequenos y frecuentes al repositorio.
5. Pull request se revisa antes de mezclar en `develop`.
6. Demo interna valida el flujo y luego se prepara validacion con cliente.
7. Al cierre del sprint, `develop` pasa a `main` si el entregable es estable.

## Distribucion por roles
- Brandon Pazmino, SCRUM Master: gobernanza Git, seguimiento de sprint, integracion tecnica, control de riesgos.
- Daniel Palacios, Product Owner: backlog en Jira, definicion funcional, validacion con cliente, criterio de aceptacion.
- Brithany Lopez, Team Development: frontend base, vistas de usuario, apoyo en componentes compartidos.
- Daniela Freire, Team Development: backend inicial, estados del pedido, integracion de datos y soporte de despliegue.
- Jhoana Encalada, cliente: validacion del flujo de negocio, prioridades del restaurante y retroalimentacion.

## Distribucion inicial de trabajo
- Brandon Pazmino
  Responsable de repositorio, estrategia de ramas, reglas de pull request, estructura del proyecto y CI basica.
- Daniel Palacios
  Responsable de Jira, backlog inicial, historias priorizadas, definicion de RF-01 a RF-04 y reuniones con cliente.
- Brithany Lopez
  Responsable de mockups, menu QR, experiencia del comensal y vista inicial de caja.
- Daniela Freire
  Responsable de modelo de pedidos, estados en tiempo real, base del API y despliegue tecnico en Render.

## Matriz RACI resumida
- Planeacion del sprint: Brandon A, Daniel R, Brithany C, Daniela C, Cliente I
- Backlog y criterios de aceptacion: Daniel A/R, Brandon C, Cliente C, Team I
- Arquitectura inicial: Brandon A/R, Daniela R, Brithany C, Daniel C
- Menu QR y vista comensal: Brithany A/R, Daniel C, Brandon C
- Flujo caja-cocina: Daniela R, Brithany C, Daniel A, Cliente C
- Despliegue en Render: Daniela R, Brandon A, Daniel C
- Validacion con cliente: Daniel A/R, Brandon C, Cliente C

## Sprint 0 recomendado
- Configurar repo, ramas, convenciones y CI.
- Crear tablero Jira y cargar backlog base.
- Definir mockups de flujo principal.
- Ordenar inventario fotografico y catalogo inicial.

## Sprint 1 recomendado
- Implementar menu QR responsive.
- Construir vista basica de caja.
- Crear modelo de pedido con estados `recibido`, `en_preparacion` y `listo`.
- Desplegar ambiente de pruebas.

## Definition of Done minima
- Ticket vinculado en Jira.
- Rama y pull request creados.
- Revision tecnica realizada.
- Cambio integrado en `develop`.
- Evidencia o demo disponible si aplica.
