const express = require("express");
const Vcard = require("../models/Vcard");
const auth = require("../middleware/auth");

const router = express.Router();

// Todas las rutas de vCards requieren autenticación.
router.use(auth);

// Campos editables permitidos (evita inyectar campos no deseados).
const FIELDS = [
  "label", "firstName", "lastName", "org", "title",
  "phoneWork", "phoneMobile", "email", "website",
  "street", "zip", "city", "state", "country",
  "instagram", "twitter", "tiktok", "logo",
];

function pickFields(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f];
  }
  return out;
}

// GET /api/vcards  -> lista de vCards del usuario
router.get("/", async (req, res) => {
  const items = await Vcard.find({ user: req.userId }).sort({ updatedAt: -1 });
  res.json(items);
});

// GET /api/vcards/:id -> una vCard concreta
router.get("/:id", async (req, res) => {
  const item = await Vcard.findOne({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ error: "Perfil no encontrado." });
  res.json(item);
});

// POST /api/vcards -> crear
router.post("/", async (req, res) => {
  try {
    const data = pickFields(req.body);
    const item = await Vcard.create({ ...data, user: req.userId });
    res.status(201).json(item);
  } catch (err) {
    console.error("create vcard error:", err);
    res.status(500).json({ error: "Error al guardar el perfil." });
  }
});

// PUT /api/vcards/:id -> actualizar
router.put("/:id", async (req, res) => {
  try {
    const data = pickFields(req.body);
    const item = await Vcard.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: data },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Perfil no encontrado." });
    res.json(item);
  } catch (err) {
    console.error("update vcard error:", err);
    res.status(500).json({ error: "Error al actualizar el perfil." });
  }
});

// DELETE /api/vcards/:id -> eliminar
router.delete("/:id", async (req, res) => {
  const item = await Vcard.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ error: "Perfil no encontrado." });
  res.json({ ok: true });
});

module.exports = router;
