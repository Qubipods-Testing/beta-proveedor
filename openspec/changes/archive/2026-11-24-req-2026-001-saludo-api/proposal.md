# Proposal

## Why

El DERCAS DEF-2026-001 v1.0.0 pide que otro sistema (ROLE-01, el servicio consumidor)
pueda pedir un saludo personalizado por HTTP sin reimplementar la lógica de saludo ni
la validación del nombre. Hoy este repositorio (`beta-proveedor`) no expone ningún
endpoint: hace falta construirlo desde cero, junto con el contrato `saludo-api` que
el catálogo de Qubipods publicará para que otros pods lo consuman.

## What Changes

- Se agrega un servidor HTTP con `node:http` (Node 22, sin dependencias de npm, ADR-01)
  que expone `GET /saludo?nombre=<texto>`.
- El nombre se recorta (BR-01) y se valida: obligatorio y de máximo 50 caracteres.
- Toda respuesta de error usa un único formato `{ codigo, mensaje }` (ADR-02).
- Métodos y rutas no soportados responden `405` (con `Allow: GET`) o `404` con el
  mismo formato de error.
- Se agregan pruebas con `node:test` que levantan el servidor en un puerto efímero
  y usan `fetch` para ejercitar cada criterio de aceptación.
- Se publica el contrato `saludo-api` (tipo `http-api`) con la operación
  `GET /saludo`, su esquema de éxito y de error, y sus ejemplos.

## Capabilities

### New Capabilities
- `saludo-api`: Servidor HTTP que responde `GET /saludo?nombre=<texto>` con un saludo
  personalizado y la fecha de generación, validando el nombre según BR-01 y exponiendo
  errores en un formato único.

### Modified Capabilities
(ninguna: este repositorio no tenía capacidades previas)

## Impact

- Código nuevo: servidor `node:http`, su validación y sus pruebas (`node:test`),
  dentro de este repositorio (`beta-proveedor`).
- `package.json` nuevo, sin `dependencies` (NFR-01).
- Contrato nuevo publicado en el catálogo: `saludo-api` v1.0.0 (sin consumidores
  todavía).
- Sin cambios a otros sistemas ni a datos existentes.
- Plan incremental de una sola serie (INCR-01 / EPIC-01): servidor, pruebas y
  contrato se mergean juntos en `main`.

## Non-goals

- No se construye ninguna interfaz gráfica (el DERCAS no la pide para esta solicitud).
- No se agregan frameworks HTTP (Express, Fastify) ni otras dependencias de npm
  (NFR-01, ADR-01).
- No se definen roles, autenticación ni autorización: el endpoint es público, como
  describe el DERCAS.
