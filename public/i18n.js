/* ============================================================
   Internacionalización (Español / Inglés)
   - Textos estáticos: atributos data-i18n (texto), data-i18n-html (HTML de
     confianza, solo de este archivo) y data-i18n-placeholder.
   - Textos dinámicos: t("clave", { variables }).
   - El idioma se guarda en localStorage; por defecto, el del navegador.
   ============================================================ */

const I18N = {
  es: {
    "meta.title": "Generador de QR para vCard",
    "meta.description": "Crea un código QR de tu tarjeta de contacto (vCard) compatible con iPhone y Android, con foto incrustada y descarga en PNG.",
    "hero.title": "Generador de QR para vCard",
    "hero.subtitle": "Rellena tus datos, incrusta tu foto y descarga el código QR en PNG.<br />Compatible con iPhone y Android (modelos antiguos y nuevos).",
    "lang.label": "Idioma",

    "auth.intro": "Inicia sesión para guardar tus perfiles y reutilizarlos.",
    "auth.google": "Continuar con Google",
    "auth.session": "Sesión:",
    "auth.logout": "Cerrar sesión",
    "auth.connected": "Conectado",
    "auth.configError": "No se pudo cargar la configuración de Auth0.",
    "auth.notConfigured": "Auth0 no está configurado (revisa las variables AUTH0_*).",
    "auth.callbackError": "Error al completar el inicio de sesión.",
    "auth.notReady": "Auth0 aún no está listo. Inténtalo de nuevo en un momento.",

    "saved.title": "Mis perfiles guardados",
    "saved.empty": "Aún no tienes perfiles guardados.",
    "saved.load": "Cargar",
    "saved.delete": "Eliminar",
    "saved.noName": "Sin nombre",

    "form.personal": "Datos personales",
    "form.firstName": "Nombre",
    "form.lastName": "Apellido",
    "form.org": "Organización",
    "form.title": "Cargo",
    "form.contact": "Contacto",
    "form.phoneWork": "Teléfono de trabajo",
    "form.phoneMobile": "Teléfono móvil",
    "form.email": "Email",
    "form.website": "Sitio web",
    "form.address": "Dirección",
    "form.street": "Calle",
    "form.zip": "Código postal",
    "form.city": "Ciudad",
    "form.state": "Estado",
    "form.country": "País",
    "form.social": "Redes sociales",
    "form.socialHint": "Puedes escribir solo el usuario (ej. <code>juanperez</code>) o la URL completa.",
    "form.photo": "Foto / logo en el QR (opcional)",
    "form.photoHint": "Se incrusta en el centro del QR. La corrección de errores se ajusta para que siga siendo legible.",
    "form.removePhoto": "Quitar foto",
    "form.generate": "Generar QR",
    "form.save": "Guardar perfil",
    "form.reset": "Limpiar",

    "ph.firstName": "Juan",
    "ph.lastName": "Pérez",
    "ph.org": "Acme S.A.",
    "ph.title": "Director Comercial",
    "ph.phoneWork": "+52 55 1234 5678",
    "ph.phoneMobile": "+52 55 8765 4321",
    "ph.email": "juan@acme.com",
    "ph.website": "https://acme.com",
    "ph.street": "Av. Reforma 123",
    "ph.zip": "06600",
    "ph.city": "Ciudad de México",
    "ph.state": "CDMX",
    "ph.country": "México",
    "ph.social": "juanperez",

    "qr.title": "Tu código QR",
    "qr.placeholder": "Aquí aparecerá tu QR",
    "qr.download": "Descargar PNG",
    "qr.scanHint": "Escanéalo con la cámara para guardar el contacto.",
    "footer": "vCard 3.0 · Datos guardados por usuario en MongoDB.",

    "msg.nameRequiredQr": "Escribe al menos el nombre o el apellido para generar el QR.",
    "msg.nameRequiredSave": "Escribe al menos el nombre o el apellido antes de guardar.",
    "msg.profileLabel": "Nombre para este perfil:",
    "msg.saved": "Perfil guardado.",
    "msg.saveError": "No se pudo guardar: {error}",
    "msg.confirmDelete": "¿Eliminar este perfil?",
    "msg.deleteError": "No se pudo eliminar: {error}",
    "msg.serverError": "Error de servidor.",
  },

  en: {
    "meta.title": "vCard QR Code Generator",
    "meta.description": "Create a QR code for your contact card (vCard) that works on iPhone and Android, with an embedded photo and PNG download.",
    "hero.title": "vCard QR Code Generator",
    "hero.subtitle": "Fill in your details, embed your photo and download the QR code as PNG.<br />Works on iPhone and Android (old and new models).",
    "lang.label": "Language",

    "auth.intro": "Sign in to save your profiles and reuse them.",
    "auth.google": "Continue with Google",
    "auth.session": "Signed in as:",
    "auth.logout": "Sign out",
    "auth.connected": "Connected",
    "auth.configError": "Could not load the Auth0 configuration.",
    "auth.notConfigured": "Auth0 is not configured (check the AUTH0_* variables).",
    "auth.callbackError": "Could not complete sign-in.",
    "auth.notReady": "Auth0 is not ready yet. Please try again in a moment.",

    "saved.title": "My saved profiles",
    "saved.empty": "You don't have any saved profiles yet.",
    "saved.load": "Load",
    "saved.delete": "Delete",
    "saved.noName": "Unnamed",

    "form.personal": "Personal details",
    "form.firstName": "First name",
    "form.lastName": "Last name",
    "form.org": "Organization",
    "form.title": "Job title",
    "form.contact": "Contact",
    "form.phoneWork": "Work phone",
    "form.phoneMobile": "Mobile phone",
    "form.email": "Email",
    "form.website": "Website",
    "form.address": "Address",
    "form.street": "Street",
    "form.zip": "ZIP / Postal code",
    "form.city": "City",
    "form.state": "State",
    "form.country": "Country",
    "form.social": "Social media",
    "form.socialHint": "You can enter just the username (e.g. <code>johnsmith</code>) or the full URL.",
    "form.photo": "Photo / logo in the QR (optional)",
    "form.photoHint": "It is embedded in the center of the QR. Error correction is adjusted so it stays scannable.",
    "form.removePhoto": "Remove photo",
    "form.generate": "Generate QR",
    "form.save": "Save profile",
    "form.reset": "Clear",

    "ph.firstName": "John",
    "ph.lastName": "Smith",
    "ph.org": "Acme Inc.",
    "ph.title": "Sales Director",
    "ph.phoneWork": "+1 555 123 4567",
    "ph.phoneMobile": "+1 555 765 4321",
    "ph.email": "john@acme.com",
    "ph.website": "https://acme.com",
    "ph.street": "123 Main St",
    "ph.zip": "10001",
    "ph.city": "New York",
    "ph.state": "NY",
    "ph.country": "USA",
    "ph.social": "johnsmith",

    "qr.title": "Your QR code",
    "qr.placeholder": "Your QR code will appear here",
    "qr.download": "Download PNG",
    "qr.scanHint": "Scan it with your camera to save the contact.",
    "footer": "vCard 3.0 · Data saved per user in MongoDB.",

    "msg.nameRequiredQr": "Enter at least a first or last name to generate the QR code.",
    "msg.nameRequiredSave": "Enter at least a first or last name before saving.",
    "msg.profileLabel": "Name for this profile:",
    "msg.saved": "Profile saved.",
    "msg.saveError": "Could not save: {error}",
    "msg.confirmDelete": "Delete this profile?",
    "msg.deleteError": "Could not delete: {error}",
    "msg.serverError": "Server error.",
  },
};

const SUPPORTED_LANGS = Object.keys(I18N);
const LANG_KEY = "vcard_lang";
const langListeners = [];

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch { /* almacenamiento no disponible */ }
  const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(nav) ? nav : "es";
}

let currentLang = detectLang();

function getLang() { return currentLang; }

// Traduce una clave; sustituye {variables}. Si falta, usa español y luego la clave.
function t(key, vars = {}) {
  const str = I18N[currentLang][key] ?? I18N.es[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? vars[name] : `{${name}}`));
}

function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.documentElement.lang = currentLang;
  document.title = t("meta.title");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = t("meta.description");

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.dataset.lang === currentLang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === currentLang) return;
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignorar */ }
  applyTranslations();
  langListeners.forEach((fn) => fn(lang));
}

// Permite a app.js volver a pintar textos dinámicos al cambiar de idioma.
function onLangChange(fn) { langListeners.push(fn); }
