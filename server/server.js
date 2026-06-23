require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const vcardRoutes = require("./routes/vcards");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vcards";

// Middlewares
app.use(cors());
// Límite alto para permitir fotos/logos en base64.
app.use(express.json({ limit: "5mb" }));

// API
app.use("/api/auth", authRoutes);
app.use("/api/vcards", vcardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Frontend estático
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Cualquier otra ruta sirve el index (SPA simple).
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
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

connectWithRetry()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("No se pudo conectar a MongoDB:", err);
    process.exit(1);
  });
