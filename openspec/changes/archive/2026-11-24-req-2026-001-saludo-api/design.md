# Design

## Context

`beta-proveedor` es un repositorio sintético, hoy sin código de aplicación (solo
`README.md` y la configuración de Qubipods). El DERCAS DEF-2026-001 v1.0.0 pide un
único endpoint (`GET /saludo`) consumido por otro sistema (ROLE-01), sin interfaz
gráfica. El entorno declarado para correr las pruebas es Node 22; no hace falta
PostgreSQL ni Docker para esta línea base porque el servidor no persiste nada.

## Goals / Non-Goals

**Goals:**
- Responder `GET /saludo?nombre=<texto>` con el saludo y la fecha de generación en
  ISO 8601 (AC-01.01.1).
- Validar el nombre (obligatorio, máximo 50 caracteres, recortado antes de validar
  por BR-01) y devolver errores con un formato único (AC-01.01.2, AC-01.01.3).
- Responder `405` con `Allow: GET` a otros métodos y `404` con el mismo formato de
  error a otras rutas (AC-01.01.4, AC-01.01.5).
- Publicar el contrato `saludo-api` 1.0.0 en el catálogo.
- No usar dependencias de npm (NFR-01).

**Non-Goals:**
- Ninguna interfaz gráfica: el DERCAS no la pide para esta solicitud.
- Persistencia, autenticación o autorización.
- Frameworks HTTP o librerías de validación de terceros.

## Decisions

- **ADR-01 · Servidor con `node:http`** — Node 22 sin frameworks ni dependencias de
  npm: es un solo endpoint y NFR-01 lo exige. Alternativas consideradas y
  descartadas: Express, Fastify (añadirían una dependencia de npm que NFR-01
  prohíbe para este alcance).
- **ADR-02 · Formato único de error** — Todos los errores (`400`, `404`, `405`,
  `422`) responden `{ "codigo": "<CODIGO>", "mensaje": "<texto>" }`, así el
  consumidor los maneja igual sin ramificar por endpoint.
- **Casing de `saludo-api`: camelCase, API nueva, decisión de este repositorio.**
  La operación no existe todavía en `beta-proveedor` (no hay respuesta real que
  observar), así que no hay evidencia de un serializador previo que citar. El
  servidor construye el JSON a mano con `JSON.stringify` sobre objetos literales:
  se fija `camelCase` como convención del repositorio para los campos de la
  respuesta (`mensaje`, `generadoEn`, `codigo`) y así se escribirá el código que
  arma esos objetos.
- **Puerto efímero para las pruebas** — las pruebas de `node:test` levantan el
  servidor con `listen(0)` y leen el puerto asignado por el sistema operativo
  antes de llamar a `fetch`, como pide la estrategia de validación del DERCAS. Esto
  corre sin problemas en el entorno declarado (Node 22, sin Docker ni base de
  datos involucrados).

## Risks / Trade-offs

- Construir JSON y enrutamiento a mano con `node:http` (en vez de un framework)
  significa más código repetido si el servicio crece; aceptable para un único
  endpoint y obligatorio por NFR-01. Si una incorporación futura agrega más rutas,
  conviene revisar si NFR-01 sigue aplicando antes de seguir sin framework.
- El contrato fija `codigo` como un enum con `x-extensible: true`: un futuro
  código de error nuevo es un cambio compatible; quitar o renombrar uno existente
  seguiría siendo un cambio que rompe a los consumidores.

## Contratos

- **`saludo-api` (tipo `http-api`, parte `api`)** — contrato nuevo que esta
  solicitud crea y versiona por primera vez (1.0.0, sin consumidores todavía).
  Publica `GET /saludo`: éxito `200` con `SaludoResponse` (`mensaje`,
  `generadoEn`), `400` si falta el nombre (`NOMBRE_OBLIGATORIO`) y `422` si supera
  50 caracteres (`NOMBRE_DEMASIADO_LARGO`), ambos con `ErrorResponse`
  (`codigo`, `mensaje`).
  - Casing: `camelCase`, decisión registrada arriba (API nueva, sin
    serializador previo que observar).
  - `404` (ruta desconocida) y `405` (método no soportado) no son ejemplos del
    contrato: son comportamiento del servidor fuera de la operación declarada, y
    se prueban directamente en `beta-proveedor` con `node:test` (AC-01.01.4,
    AC-01.01.5).
  - Ejemplos: uno positivo (`nombre-valido`, 200) y dos negativos
    (`nombre-faltante` → 400, `nombre-muy-largo` → 422), cada uno pidiendo algo
    distinto, con datos sintéticos.
  - Validado con `node .claude/skills/generate-spec/check-contracts.mjs
    openspec/changes/req-2026-001-saludo-api/contracts/saludo-api.contract.json`
    (`contracts: OK`).
