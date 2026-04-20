# Automatizacion de planificacion en Git

## Objetivo real del proyecto
La automatizacion recomendada para esta etapa no es la del desarrollo tecnico de la aplicacion, sino la de la planificacion, los requests y el orden del trabajo en Git.

## Enfoque recomendado
1. Cada request nace como issue o ticket con responsable y fecha.
2. Cada issue se refleja en una rama con formato `tipo/EDV-XX-descripcion`.
3. Cada cambio llega por pull request usando una plantilla comun.
4. Cada pull request referencia el request, historia o tarea que resuelve.
5. El avance del sprint se revisa en backlog, tablero y ramas activas.

## Que automatizar ahora
- Plantillas de issue para historia, tarea tecnica, bug y request de cliente.
- Plantilla de pull request con checklist.
- Convencion de ramas y commits.
- Backlog y sprint documentados en el repositorio.
- CODEOWNERS para guiar revisiones.

## Que no automatizar todavia
- Despliegue automatico del producto.
- Pipelines complejos de calidad.
- Automatizacion de pruebas o builds si aun no existe una app funcional.
- Flujo de releases antes de tener el MVP validado.

## Resultado esperado
Git debe servir como sistema de trazabilidad del trabajo: quien pidio algo, quien lo ejecuta, en que rama se trabaja y en que estado se encuentra.
