# Generador de QR para vCard

Webapp para crear códigos QR de tarjetas de contacto (**vCard 3.0**), compatibles con iPhone y Android (modelos antiguos y nuevos). Permite:

- Capturar todos los datos del contacto (nombre, apellido, organización, cargo, teléfonos, email, web, dirección completa y redes sociales: Instagram, X, TikTok).
- **Incrustar una foto/logo** en el centro del QR (con corrección de errores alta para que siga siendo legible).
- **Descargar el QR en PNG**.
- **Inicio de sesión con Google** (vía **Auth0**) para **guardar perfiles** y regenerar el QR sin volver a escribir los datos. Persistencia en **MongoDB**.

## Arquitectura

```
public/        Frontend estático (HTML, CSS, JS) — QR en el navegador + SDK de Auth0
server/        API Node.js + Express
  models/      Esquemas de Mongoose (User, Vcard)
  routes/      Rutas de vcards (protegidas por Auth0)
  middleware/  Validación del token de Auth0 + resolución del usuario
Dockerfile         Imagen de la app
docker-compose.yml App + MongoDB
```

La autenticación la gestiona **Auth0** (Google y, opcionalmente, email/contraseña).
El backend valida los *access tokens* de Auth0 (RS256 vía JWKS) y asocia cada vCard
al usuario por su `sub` de Auth0.

## Configurar Auth0 (una vez)

1. Crea una cuenta gratis en [auth0.com](https://auth0.com) y un **tenant**.
2. **Applications → Create Application** → "vCard SPA" → tipo **Single Page Web
   Application**. En *Settings*, añade en las tres listas la URL `http://localhost:3000`:
   - Allowed Callback URLs
   - Allowed Logout URLs
   - Allowed Web Origins

   Anota el **Domain** y el **Client ID**.
3. **APIs → Create API** → Name "vCard API", **Identifier** (audience) p. ej.
   `https://vcard-api`, algoritmo **RS256**. Ese identifier es `AUTH0_AUDIENCE`.
4. **Authentication → Social → Google**: activa la conexión `google-oauth2` y
   habilítala para la app "vCard SPA". (Las *dev keys* de Auth0 sirven para probar.)
5. Copia `Domain`, `Client ID` y `Audience` a tu `.env` (ver abajo).

## Cómo ejecutarlo con Docker Desktop (recomendado)

Requiere **Docker Desktop** en marcha.

```bash
# 1. Crea tu .env a partir del ejemplo y rellena las variables AUTH0_*
cp .env.example .env

# 2. Construye y levanta app + base de datos
docker compose up --build
```

Abre **http://localhost:3000**

- La base de datos MongoDB corre en el contenedor `vcard-mongo` y guarda los datos en el volumen `mongo-data` (persisten entre reinicios).
- Para detener: `docker compose down` (añade `-v` para borrar también los datos).

## Cómo ejecutarlo en local sin Docker (opcional)

Necesitas Node.js 20+ y un MongoDB accesible.

```bash
npm install
# Ajusta MONGO_URI en .env a tu MongoDB local, p. ej. mongodb://127.0.0.1:27017/vcards
npm start
```

## Uso

1. Pulsa **Continuar con Google** en la barra superior e inicia sesión con Auth0.
2. Rellena los datos del contacto.
3. (Opcional) sube una foto/logo para incrustarla en el QR.
4. Pulsa **Generar QR** y luego **Descargar PNG**.
5. Pulsa **Guardar perfil** para almacenarlo. Aparecerá en "Mis perfiles guardados"; desde ahí puedes **Cargar** o **Eliminar**.

## Notas de compatibilidad

- Se usa **vCard 3.0**, el formato con mayor soporte en iOS y Android antiguos y modernos.
- Las redes sociales se añaden como ítems etiquetados (`item1.URL` + `X-ABLabel`), que iOS muestra con su nombre.
- La corrección de errores del QR es **H (alta)** para tolerar la foto incrustada.

## Seguridad

- La autenticación la gestiona **Auth0**; la app no almacena contraseñas.
- El backend valida cada *access token* contra el JWKS de tu tenant (issuer +
  audience). `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID` y `AUTH0_AUDIENCE` son datos
  públicos (no secretos).
- Cada usuario solo puede ver y modificar sus propios perfiles.
