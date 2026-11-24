# Tasks

## Serie A — Servidor y contrato de saludo

- [x] A.1 Crear `package.json` (sin `dependencies`, script `test` con `node --test`) que cumpla NFR-01.
- [x] A.2 Escribir las pruebas en `test/saludo.test.js` con `node:test`: levantan el servidor en un puerto efímero (`listen(0)`) y usan `fetch` para cubrir AC-01.01.1 a AC-01.01.5 (incluyendo el recorte de espacios de BR-01). Deben fallar en rojo porque el servidor todavía no existe.
- [x] A.3 Implementar el servidor `node:http` en `src/server.js`: ruteo de `GET /saludo`, recorte del nombre (BR-01), validación (obligatorio, máximo 50 caracteres) y formato único de error `{ codigo, mensaje }` (ADR-01, ADR-02).
- [x] A.4 Implementar las respuestas `404` (ruta desconocida) y `405` (método no soportado, con `Allow: GET`), ambas con el mismo formato de error.
- [x] A.5 Correr `npm test` hasta que las pruebas de A.2 pasen en verde.
- [x] A.6 Validar el contrato con `node .claude/skills/generate-spec/check-contracts.mjs openspec/changes/req-2026-001-saludo-api/contracts/saludo-api.contract.json` y dejarlo en verde.
- [x] A.7 Correr `npx openspec validate req-2026-001-saludo-api --strict` y dejarlo en verde.
