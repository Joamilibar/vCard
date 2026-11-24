# vCard QR — contexto del proyecto

Webapp que genera códigos QR de vCard 3.0 (iPhone/Android), con foto/logo
incrustado, descarga PNG y perfiles guardados por usuario.

## Stack
- **Frontend** (`public/`): HTML/CSS/JS sin build. QR con `qr-code-styling` (CDN).
  Login con `@auth0/auth0-spa-js` (CDN).
- **i18n**: `public/i18n.js` con los textos ES/EN y `t(clave, vars)`. En el HTML se usan
  `data-i18n`, `data-i18n-html` y `data-i18n-placeholder`. El idioma se guarda en
  `localStorage` (`vcard_lang`) y se pasa a Auth0 con `ui_locales`.
  Toda clave nueva debe existir en `es` y en `en`.
- **Backend** (`server/`): Node + Express + Mongoose (MongoDB).
  - Auth: Auth0 (Google). `express-oauth2-jwt-bearer` valida el access token (RS256).
    `attachUser` hace upsert del usuario por `auth0Sub` y fija `req.userId`.
  - `GET /api/config` devuelve la config pública de Auth0. `/api/vcards` es CRUD protegido.
  - Al arrancar, `User.syncIndexes()` elimina los índices heredados (p. ej. `email_1`).
- **Docker**: `docker-compose.yml` levanta la app y Mongo (volumen `mongo-data`).
  Variables: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_AUDIENCE` (ver `.env.example`).

## Estado (2026-11-23)
Todo commiteado y subido a `origin/main` (último commit: `ecdaaea`).
1. Migración de login propio (bcrypt/JWT) → Auth0.
2. Arreglo de índices de la colección users heredados de la versión anterior
   (índice parcial único en `auth0Sub`, retry ante E11000). Sin borrar datos.
3. Interfaz ES/EN con selector en la cabecera, y arreglo de `[hidden]` en el CSS.
4. `package-lock.json` añadido.

Verificado: arranque del servidor, endpoints, migración de índices con una BD
simulada antigua, y en Chrome el cambio ES↔EN, la persistencia del idioma y la
generación del QR.

## Pendiente / próximos pasos
- [ ] Configurar Auth0 (pasos en el README), crear `.env` y probar el **login real
      con Google** en ES y EN (no se ha probado nunca).
- [ ] Arrancar Docker Desktop y probar `docker compose up --build`.
- [ ] (Opcional) Script para asociar los perfiles de los usuarios antiguos
      (email/contraseña, sin `auth0Sub`) a su nueva cuenta de Google por email.
      Hoy se conservan en la BD, pero nadie puede acceder a ellos.
- [ ] (Menor) Los mensajes de error del servidor solo están en español.
- [ ] (Menor) Fijar la versión exacta de `@auth0/auth0-spa-js` en `index.html`
      (ahora `@2`).
- [ ] (Menor) La clave `lang.label` de `i18n.js` no se usa.

## Notas para trabajar aquí
- Windows + PowerShell 5.1: los mensajes de commit con comillas se rompen con
  `-m`; usar `git commit -F <archivo>`.
- No hay MongoDB local. Si Docker no está en marcha, se puede probar con
  `mongodb-memory-server` instalado **fuera del repo** (descarga unos 780 MB la
  primera vez). El servidor no escucha hasta conectar con Mongo.
- Al probar en el navegador, no enviar el formulario vacío: abre un `alert()`.
