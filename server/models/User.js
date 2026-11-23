const mongoose = require("mongoose");

// El usuario se identifica por su `sub` de Auth0 (ej. "google-oauth2|12345").
// La autenticación (Google, email/contraseña) la gestiona Auth0; aquí solo
// guardamos una referencia local para asociar las vCards al usuario.
const userSchema = new mongoose.Schema(
  {
    auth0Sub: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: { type: String, default: "", lowercase: true, trim: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
