# Generador de QR para vCard

Webapp para crear códigos QR de tarjetas de contacto (**vCard 3.0**), compatibles con iPhone y Android (modelos antiguos y nuevos). Permite:

- Capturar todos los datos del contacto (nombre, apellido, organización, cargo, teléfonos, email, web, dirección completa y redes sociales: Instagram, X, TikTok).
- **Incrustar una foto/logo** en el centro del QR (con corrección de errores alta para que siga siendo legible).
- **Descargar el QR en PNG**.
- **Cuentas de usuario** (login con email y contraseña) para **guardar perfiles** y regenerar el QR sin volver a escribir los datos. Persistencia en **MongoDB**.

## Arquitectura

```
public/        Frontend estático (HTML, CSS, JS) — generación del QR en el navegador
server/        API Node.js + Express
  models/      Esquemas de Mongoose (User, Vcard)
  routes/      Rutas de auth y de vcards
  middleware/  Autenticación con JWT
Dockerfile         Imagen de la app
docker-compose.yml App + MongoDB
```

## Cómo ejecutarlo con Docker Desktop (recomendado)

Requiere **Docker Desktop** en marcha.

```bash
# 1. (Opcional) crea tu .env a partir del ejemplo y cambia el JWT_SECRET
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

1. **Crea una cuenta** o inicia sesión en la barra superior.
2. Rellena los datos del contacto.
3. (Opcional) sube una foto/logo para incrustarla en el QR.
4. Pulsa **Generar QR** y luego **Descargar PNG**.
5. Pulsa **Guardar perfil** para almacenarlo. Aparecerá en "Mis perfiles guardados"; desde ahí puedes **Cargar** o **Eliminar**.

## Notas de compatibilidad

- Se usa **vCard 3.0**, el formato con mayor soporte en iOS y Android antiguos y modernos.
- Las redes sociales se añaden como ítems etiquetados (`item1.URL` + `X-ABLabel`), que iOS muestra con su nombre.
- La corrección de errores del QR es **H (alta)** para tolerar la foto incrustada.

## Seguridad

- Las contraseñas se almacenan con hash **bcrypt**.
- La sesión usa **JWT**. Cambia `JWT_SECRET` en producción.
- Cada usuario solo puede ver y modificar sus propios perfiles.
