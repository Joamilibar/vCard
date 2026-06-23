const mongoose = require("mongoose");

// Una vCard guardada pertenece siempre a un usuario (campo `user`).
const vcardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Etiqueta del perfil para mostrarlo en la lista (ej. "Trabajo", "Personal").
    label: { type: String, default: "", trim: true },

    // Campos del contacto
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    org: { type: String, default: "" },
    title: { type: String, default: "" },
    phoneWork: { type: String, default: "" },
    phoneMobile: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    street: { type: String, default: "" },
    zip: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    tiktok: { type: String, default: "" },

    // Foto/logo incrustado en el QR (data URL base64). Opcional.
    logo: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vcard", vcardSchema);
