require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const vcardRoutes = require("./routes/vcards");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vcards";

// Middlewares
app.use(cors());
// Límite alto para permitir fotos/logos en base64.
app.use(express.json({ limit: "5mb" }));

// Config pública de Auth0 que el frontend necesita para inicializar el SDK.
// Son datos públicos (no secretos): dominio, client id y audience de la API.
app.get("/api/config", (req, res) => {
  res.json({
    domain: process.env.AUTH0_DOMAIN || "",
    clientId: process.env.AUTH0_CLIENT_ID || "",
    audience: process.env.AUTH0_AUDIENCE || "",
  });
});

// API
app.use("/api/vcards", vcardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Frontend estático
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Cualquier otra ruta sirve el index (SPA simple).
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Manejo de errores (incluye los 401 que lanza express-oauth2-jwt-bearer).
// Devuelve JSON en vez del HTML de error por defecto de Express.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error("Error no controlado:", err);
  res.status(status).json({
    error: status === 401 ? "No autenticado." : err.message || "Error de servidor.",
  });
});

// Conexión a MongoDB con reintentos (Mongo puede tardar en arrancar en Docker).
async function connectWithRetry(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ Conectado a MongoDB");
      return;
    } catch (err) {
      console.warn(`Intento ${attempt}/${retries} de conexión a MongoDB falló: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// Alinea los índices de la colección de usuarios con el esquema actual.
// Elimina los índices heredados de la versión con email/contraseña (p. ej. el
// único sobre `email`, que haría fallar a partir del 2.º usuario con email vacío)
// y crea el índice parcial de `auth0Sub`. No borra ningún documento.
async function syncUserIndexes() {
  const User = require("./models/User");
  const dropped = await User.syncIndexes();
  if (dropped.length) console.log("🧹 Índices antiguos eliminados en users:", dropped.join(", "));
}

connectWithRetry()
  .then(syncUserIndexes)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("No se pudo conectar a MongoDB:", err);
    process.exit(1);
  });
