'use strict';

const http = require('node:http');

const MAX_NOMBRE_LENGTH = 50;

function errorBody(codigo, mensaje) {
  return { codigo, mensaje };
}

function handleSaludo(req, res, url) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'GET' });
    res.end(JSON.stringify(errorBody('METODO_NO_SOPORTADO', 'El método no está soportado en esta ruta.')));
    return;
  }

  const nombre = (url.searchParams.get('nombre') ?? '').trim();

  if (nombre === '') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorBody('NOMBRE_OBLIGATORIO', 'El nombre es obligatorio.')));
    return;
  }

  if (nombre.length > MAX_NOMBRE_LENGTH) {
    res.writeHead(422, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorBody('NOMBRE_DEMASIADO_LARGO', 'El nombre no puede superar 50 caracteres.')));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ mensaje: `Hola, ${nombre}.`, generadoEn: new Date().toISOString() }));
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname !== '/saludo') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(errorBody('RUTA_NO_ENCONTRADA', 'La ruta solicitada no existe.')));
      return;
    }

    handleSaludo(req, res, url);
  });
}

module.exports = { createServer };
