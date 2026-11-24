'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('../src/server.js');

const OBSERVED_DIR = path.join(__dirname, '..', '.agentos', 'contracts', 'observed', 'saludo-api');

function writeObserved(example, status, body) {
  fs.mkdirSync(OBSERVED_DIR, { recursive: true });
  fs.writeFileSync(path.join(OBSERVED_DIR, `${example}.json`), JSON.stringify({ status, body }));
}

function withServer(fn) {
  return async () => {
    const server = createServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;
    try {
      await fn(baseUrl);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  };
}

test(
  'AC-01.01.1 · GET /saludo?nombre=Ana responde 200 con el saludo y la fecha',
  withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/saludo?nombre=Ana`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.mensaje, 'Hola, Ana.');
    assert.match(body.generadoEn, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    writeObserved('nombre-valido', res.status, body);
  })
);

test(
  'BR-01 · recorta los espacios alrededor del nombre antes de saludar',
  withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/saludo?nombre=${encodeURIComponent('  Ana  ')}`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.mensaje, 'Hola, Ana.');
  })
);

test(
  'AC-01.01.2 · GET /saludo sin nombre responde 400 con NOMBRE_OBLIGATORIO',
  withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/saludo`);
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.deepEqual(body, { codigo: 'NOMBRE_OBLIGATORIO', mensaje: body.mensaje });
    assert.equal(typeof body.mensaje, 'string');

    writeObserved('nombre-faltante', res.status, body);
  })
);

test(
  'BR-01 · nombre de solo espacios responde 400 con NOMBRE_OBLIGATORIO',
  withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/saludo?nombre=${encodeURIComponent('   ')}`);
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.codigo, 'NOMBRE_OBLIGATORIO');
  })
);

test(
  'AC-01.01.3 · nombre de 51 caracteres responde 422 con NOMBRE_DEMASIADO_LARGO',
  withServer(async (baseUrl) => {
    const nombre = 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    assert.equal(nombre.length, 51);

    const res = await fetch(`${baseUrl}/saludo?nombre=${nombre}`);
    const body = await res.json();

    assert.equal(res.status, 422);
    assert.equal(body.codigo, 'NOMBRE_DEMASIADO_LARGO');

    writeObserved('nombre-muy-largo', res.status, body);
  })
);

test(
  'AC-01.01.4 · POST /saludo responde 405 con Allow: GET',
  withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/saludo`, { method: 'POST' });
    const body = await res.json();

    assert.equal(res.status, 405);
    assert.equal(res.headers.get('allow'), 'GET');
    assert.equal(typeof body.codigo, 'string');
    assert.equal(typeof body.mensaje, 'string');
  })
);

test(
  'AC-01.01.5 · GET /otra responde 404 con el formato único de error',
  withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/otra`);
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(typeof body.codigo, 'string');
    assert.equal(typeof body.mensaje, 'string');
  })
);
