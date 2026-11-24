# saludo-api Specification

## Purpose
Servidor HTTP `node:http` que responde `GET /saludo?nombre=<texto>` con un saludo
personalizado y la fecha de generación, validando el nombre y usando un formato
único de error, para que un servicio consumidor (ROLE-01) lo use sin reimplementarlo.

## Requirements

### Requirement: Saludo exitoso
El sistema SHALL responder `GET /saludo?nombre=<texto>` con estado 200 y un cuerpo
JSON con el mensaje de saludo y la fecha de generación en ISO 8601, recortando el
nombre antes de usarlo (BR-01).

#### Scenario: Nombre válido
- **WHEN** se pide `GET /saludo?nombre=Ana` con el servidor levantado
- **THEN** responde 200 con `{ "mensaje": "Hola, Ana.", "generadoEn": "<fecha ISO 8601>" }`

#### Scenario: Nombre con espacios alrededor
- **WHEN** se pide `GET /saludo?nombre=%20Ana%20` con el servidor levantado
- **THEN** responde 200 con `{ "mensaje": "Hola, Ana.", "generadoEn": "<fecha ISO 8601>" }`, recortando los espacios antes de validar y de saludar

### Requirement: Nombre obligatorio
El sistema SHALL responder 400 con el error `NOMBRE_OBLIGATORIO` cuando el
parámetro `nombre` falta o queda vacío después de recortarlo.

#### Scenario: Nombre ausente
- **WHEN** se pide `GET /saludo` (sin el parámetro `nombre`) con el servidor levantado
- **THEN** responde 400 con `{ "codigo": "NOMBRE_OBLIGATORIO", "mensaje": "<texto>" }`

#### Scenario: Nombre vacío tras recortar
- **WHEN** se pide `GET /saludo?nombre=%20%20` (solo espacios) con el servidor levantado
- **THEN** responde 400 con `{ "codigo": "NOMBRE_OBLIGATORIO", "mensaje": "<texto>" }`

### Requirement: Nombre demasiado largo
El sistema SHALL responder 422 con el error `NOMBRE_DEMASIADO_LARGO` cuando el
nombre, ya recortado, supera 50 caracteres.

#### Scenario: Nombre de 51 caracteres
- **WHEN** se pide `GET /saludo` con un `nombre` de 51 caracteres con el servidor levantado
- **THEN** responde 422 con `{ "codigo": "NOMBRE_DEMASIADO_LARGO", "mensaje": "<texto>" }`

### Requirement: Método no soportado
El sistema SHALL responder 405 con el encabezado `Allow: GET` a cualquier método
distinto de GET sobre `/saludo`.

#### Scenario: POST a /saludo
- **WHEN** se pide `POST /saludo` con el servidor levantado
- **THEN** responde 405 con el encabezado `Allow: GET`

### Requirement: Ruta desconocida
El sistema SHALL responder 404 con el formato único de error a cualquier ruta
distinta de `/saludo`.

#### Scenario: Ruta inexistente
- **WHEN** se pide `GET /otra` con el servidor levantado
- **THEN** responde 404 con `{ "codigo": "<código>", "mensaje": "<texto>" }`
