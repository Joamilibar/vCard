const { auth } = require("express-oauth2-jwt-bearer");
const User = require("../models/User");

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || "";
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || "";

// 1) Valida el access token de Auth0 (RS256 contra el JWKS del tenant).
//    Comprueba issuer (https://DOMINIO/) y audience (identifier de la API).
//    Si aún no se han configurado las variables AUTH0_*, devolvemos 503 con un
//    mensaje claro en vez de crashear al arrancar.
let checkJwt;
if (AUTH0_DOMAIN && AUTH0_AUDIENCE) {
  checkJwt = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  });
} else {
  console.warn(
    "⚠️  AUTH0_DOMAIN/AUTH0_AUDIENCE no configurados: la API de vCards responderá 503."
  );
  checkJwt = (req, res) =>
    res.status(503).json({ error: "Auth0 no está configurado en el servidor." });
}

// 2) A partir del token validado, busca/crea el usuario local (upsert por el
//    `sub` de Auth0) y fija req.userId para que las rutas de vCards lo usen.
//    Mantiene intacta la relación Vcard.user -> User._id.
async function attachUser(req, res, next) {
  try {
    const payload = req.auth && req.auth.payload ? req.auth.payload : {};
    const auth0Sub = payload.sub;
    if (!auth0Sub) {
      return res.status(401).json({ error: "Token sin identificador de usuario." });
    }

    // Algunos campos (email, name, picture) pueden venir en el access token si se
    // añadieron como claims; si no, se quedan vacíos y se rellenan en el login.
    const update = {};
    if (payload.email) update.email = payload.email;
    if (payload.name) update.name = payload.name;
    if (payload.picture) update.picture = payload.picture;

    const upsert = () =>
      User.findOneAndUpdate(
        { auth0Sub },
        { $set: update, $setOnInsert: { auth0Sub } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

    let user;
    try {
      user = await upsert();
    } catch (err) {
      // Dos peticiones simultáneas de un usuario nuevo pueden intentar crearlo a
      // la vez; la perdedora recibe E11000. Reintentar encuentra el ya creado.
      if (err.code !== 11000) throw err;
      user = await upsert();
    }

    req.userId = user._id;
    next();
  } catch (err) {
    console.error("attachUser error:", err);
    res.status(500).json({ error: "Error al resolver el usuario." });
  }
}

module.exports = { checkJwt, attachUser };
