const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: "30d" });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register  { email, password }
router.post("/register", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email no válido." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Ese email ya está registrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    return res.status(201).json({ token: signToken(user), email: user.email });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Error al registrar." });
  }
});

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    return res.json({ token: signToken(user), email: user.email });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

module.exports = router;
