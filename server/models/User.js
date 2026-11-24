const mongoose = require("mongoose");

// El usuario se identifica por su `sub` de Auth0 (ej. "google-oauth2|12345").
// La autenticación (Google, email/contraseña) la gestiona Auth0; aquí solo
// guardamos una referencia local para asociar las vCards al usuario.
const userSchema = new mongoose.Schema(
  {
    auth0Sub: { type: String, required: true },
    // El email NO es único: Auth0 no siempre lo incluye en el access token.
    email: { type: String, default: "", lowercase: true, trim: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" },
  },
  { timestamps: true }
);

// Único solo para documentos que tienen auth0Sub. Así los usuarios antiguos
// (login con email/contraseña, sin auth0Sub) no rompen la creación del índice.
userSchema.index(
  { auth0Sub: 1 },
  { unique: true, partialFilterExpression: { auth0Sub: { $type: "string" } } }
);

module.exports = mongoose.model("User", userSchema);
