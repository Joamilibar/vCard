/* ============================================================
   Generador de QR para vCard
   - Construye una vCard 3.0 (máxima compatibilidad iOS/Android)
   - Genera el QR con foto/logo opcional incrustado
   - Descarga en PNG
   - Cuentas de usuario (login) + guardado de perfiles en MongoDB
   ============================================================ */

// ---- Estado y constantes ---------------------------------------------------

const FORM_FIELDS = [
  "firstName", "lastName", "org", "title", "phoneWork", "phoneMobile",
  "email", "website", "street", "zip", "city", "state", "country",
  "instagram", "twitter", "tiktok",
];

let qrCode = null;        // instancia de QRCodeStyling
let logoDataUrl = null;   // foto/logo en base64
let editingId = null;     // id del perfil que se está editando (si aplica)
let auth0Client = null;   // instancia del SDK de Auth0

// ---- Utilidades de vCard ---------------------------------------------------

// Escapa caracteres especiales según el estándar vCard (RFC 6350 / 2426).
function esc(value) {
  if (!value) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Normaliza un usuario o URL de red social a una URL completa.
function socialUrl(value, baseUrl, { tiktok = false } = {}) {
  const v = (value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  return baseUrl + (tiktok ? "@" : "") + handle;
}

// Lee los valores del formulario.
function readForm() {
  const data = {};
  for (const id of FORM_FIELDS) {
    data[id] = (document.getElementById(id).value || "").trim();
  }
  return data;
}

// Rellena el formulario con los datos de un perfil guardado.
function fillForm(d) {
  for (const id of FORM_FIELDS) {
    document.getElementById(id).value = d[id] || "";
  }
  logoDataUrl = d.logo || null;
  document.getElementById("removeLogo").hidden = !logoDataUrl;
  document.getElementById("logo").value = "";
}

// Construye la cadena vCard 3.0 a partir de los datos.
function buildVCard(d) {
  const CRLF = "\r\n";
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  // Nombre estructurado: Apellido;Nombre;;;
  lines.push(`N:${esc(d.lastName)};${esc(d.firstName)};;;`);
  const fullName = [d.firstName, d.lastName].filter(Boolean).join(" ");
  lines.push(`FN:${esc(fullName)}`);

  if (d.org) lines.push(`ORG:${esc(d.org)}`);
  if (d.title) lines.push(`TITLE:${esc(d.title)}`);

  if (d.phoneWork) lines.push(`TEL;TYPE=WORK,VOICE:${esc(d.phoneWork)}`);
  if (d.phoneMobile) lines.push(`TEL;TYPE=CELL,VOICE:${esc(d.phoneMobile)}`);

  if (d.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(d.email)}`);
  if (d.website) lines.push(`URL:${esc(d.website)}`);

  // Dirección: ;;calle;ciudad;estado;CP;país
  if (d.street || d.city || d.state || d.zip || d.country) {
    lines.push(
      `ADR;TYPE=WORK:;;${esc(d.street)};${esc(d.city)};${esc(d.state)};${esc(d.zip)};${esc(d.country)}`
    );
  }

  // Redes sociales como ítems etiquetados (iOS los muestra con su nombre).
  let item = 1;
  const addSocial = (url, label) => {
    if (!url) return;
    lines.push(`item${item}.URL:${esc(url)}`);
    lines.push(`item${item}.X-ABLabel:${esc(label)}`);
    item++;
  };
  addSocial(socialUrl(d.instagram, "https://instagram.com/"), "Instagram");
  addSocial(socialUrl(d.twitter, "https://x.com/"), "X (Twitter)");
  addSocial(socialUrl(d.tiktok, "https://tiktok.com/", { tiktok: true }), "TikTok");

  lines.push("END:VCARD");
  return lines.join(CRLF);
}

// ---- Generación del QR -----------------------------------------------------

function buildQrOptions(data, logo) {
  return {
    width: 320,
    height: 320,
    type: "canvas",
    data,
    margin: 8,
    // Corrección de errores alta (H): permite incrustar imagen sin perder lectura.
    qrOptions: { errorCorrectionLevel: "H" },
    image: logo || undefined,
    imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.35 },
    dotsOptions: { type: "square", color: "#0f172a" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "square", color: "#0f172a" },
  };
}

function generateQR() {
  const data = readForm();

  if (!data.firstName && !data.lastName) {
    alert(t("msg.nameRequiredQr"));
    return;
  }

  const vcard = buildVCard(data);
  const options = buildQrOptions(vcard, logoDataUrl);
  const container = document.getElementById("qr-canvas");

  if (!qrCode) {
    container.innerHTML = "";
    qrCode = new QRCodeStyling(options);
    qrCode.append(container);
  } else {
    qrCode.update(options);
  }

  document.getElementById("downloadBtn").disabled = false;
}

function downloadPNG() {
  if (!qrCode) return;
  const data = readForm();
  const namePart = [data.firstName, data.lastName].filter(Boolean).join("_") || "vcard";
  qrCode.download({ name: `qr_${namePart}`, extension: "png" });
}

// ---- Manejo de la foto/logo ------------------------------------------------

function handleLogoChange(e) {
  const file = e.target.files && e.target.files[0];
  const removeBtn = document.getElementById("removeLogo");
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    logoDataUrl = ev.target.result;
    removeBtn.hidden = false;
    if (qrCode) generateQR(); // refresca si ya hay QR
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  logoDataUrl = null;
  document.getElementById("logo").value = "";
  document.getElementById("removeLogo").hidden = true;
  if (qrCode) generateQR();
}

function resetAll() {
  removeLogo();
  editingId = null;
  qrCode = null;
  const container = document.getElementById("qr-canvas");
  container.innerHTML = '<p class="qr-placeholder" data-i18n="qr.placeholder"></p>';
  applyTranslations(container);
  document.getElementById("downloadBtn").disabled = true;
}

// ============================================================
//  AUTENTICACIÓN Y API
// ============================================================

let cachedLoggedIn = false; // estado de sesión conocido (para UI síncrona)

// Estado actual de sesión según Auth0.
async function isLoggedIn() {
  if (!auth0Client) return false;
  return auth0Client.isAuthenticated();
}

// Llamada a la API añadiendo el access token de Auth0 como Bearer.
async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth0Client && (await auth0Client.isAuthenticated())) {
    const token = await auth0Client.getTokenSilently();
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || t("msg.serverError"));
  return body;
}

// Guarda la clave (no el texto) para poder retraducir el mensaje al cambiar de idioma.
let authMsgKey = "";

function setAuthMessage(key, ok = false) {
  authMsgKey = key;
  const el = document.getElementById("authMsg");
  el.textContent = key ? t(key) : "";
  el.classList.toggle("ok", ok);
}

// Inicializa el cliente de Auth0 con la config pública del backend y procesa
// la vuelta del login (callback con ?code&state).
async function initAuth() {
  let config;
  try {
    config = await api("/config");
  } catch (err) {
    setAuthMessage("auth.configError");
    return;
  }
  if (!config.domain || !config.clientId) {
    setAuthMessage("auth.notConfigured");
    return;
  }

  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
    authorizationParams: {
      audience: config.audience || undefined,
      redirect_uri: window.location.origin,
    },
    useRefreshTokens: true,
    cacheLocation: "localstorage",
  });

  // Si volvemos del login, procesa el callback y limpia la URL.
  const params = new URLSearchParams(window.location.search);
  if (params.has("code") && params.has("state")) {
    try {
      await auth0Client.handleRedirectCallback();
    } catch (err) {
      setAuthMessage("auth.callbackError");
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  await updateAuthUI();
}

async function updateAuthUI() {
  const logged = auth0Client ? await auth0Client.isAuthenticated() : false;
  cachedLoggedIn = logged;

  document.getElementById("auth-form").hidden = logged;
  document.getElementById("user-bar").hidden = !logged;
  document.getElementById("saved-panel").hidden = !logged;
  document.getElementById("saveBtn").hidden = !logged;

  if (logged) {
    const user = await auth0Client.getUser();
    currentUser = user;
    renderUserName();
    const pic = document.getElementById("userPicture");
    if (user.picture) {
      pic.src = user.picture;
      pic.hidden = false;
    } else {
      pic.hidden = true;
    }
    loadProfiles();
  }
}

let currentUser = null;

function renderUserName() {
  if (!currentUser) return;
  document.getElementById("userEmail").textContent =
    currentUser.email || currentUser.name || t("auth.connected");
}

function login() {
  if (!auth0Client) {
    setAuthMessage("auth.notReady");
    return;
  }
  // Universal Login (muestra Google y, si está activado, email/contraseña),
  // en el mismo idioma que la app.
  auth0Client.loginWithRedirect({ authorizationParams: { ui_locales: getLang() } });
}

function logout() {
  editingId = null;
  document.getElementById("saved-list").innerHTML = "";
  if (auth0Client) {
    auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}

// ---- Perfiles guardados ----------------------------------------------------

async function loadProfiles() {
  try {
    const items = await api("/vcards");
    renderProfiles(items);
  } catch (err) {
    if (/sesión/i.test(err.message)) logout();
  }
}

function profileName(p) {
  return (
    p.label ||
    [p.firstName, p.lastName].filter(Boolean).join(" ") ||
    p.email ||
    t("saved.noName")
  );
}

let lastProfiles = []; // para repintar la lista al cambiar de idioma

function renderProfiles(items) {
  lastProfiles = items;
  const list = document.getElementById("saved-list");
  const empty = document.getElementById("saved-empty");
  list.innerHTML = "";
  empty.hidden = items.length > 0;

  for (const p of items) {
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.className = "saved-name";
    name.textContent = profileName(p);

    const actions = document.createElement("div");
    actions.className = "saved-actions";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = t("saved.load");
    loadBtn.addEventListener("click", () => {
      fillForm(p);
      editingId = p._id;
      generateQR();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = t("saved.delete");
    delBtn.className = "del";
    delBtn.addEventListener("click", () => deleteProfile(p._id));

    actions.append(loadBtn, delBtn);
    li.append(name, actions);
    list.append(li);
  }
}

async function saveProfile() {
  if (!cachedLoggedIn) return;
  const data = readForm();

  if (!data.firstName && !data.lastName) {
    alert(t("msg.nameRequiredSave"));
    return;
  }

  const suggested = [data.firstName, data.lastName].filter(Boolean).join(" ");
  const label = prompt(t("msg.profileLabel"), suggested);
  if (label === null) return; // cancelado

  const payload = { ...data, label: label.trim(), logo: logoDataUrl || "" };

  try {
    if (editingId) {
      await api(`/vcards/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      const created = await api("/vcards", { method: "POST", body: JSON.stringify(payload) });
      editingId = created._id;
    }
    await loadProfiles();
    alert(t("msg.saved"));
  } catch (err) {
    alert(t("msg.saveError", { error: err.message }));
  }
}

async function deleteProfile(id) {
  if (!confirm(t("msg.confirmDelete"))) return;
  try {
    await api(`/vcards/${id}`, { method: "DELETE" });
    if (editingId === id) editingId = null;
    await loadProfiles();
  } catch (err) {
    alert(t("msg.deleteError", { error: err.message }));
  }
}

// ---- Inicialización --------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Idioma: traduce la página y conecta el selector ES / EN.
  applyTranslations();
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
  onLangChange(() => {
    setAuthMessage(authMsgKey);
    renderUserName();
    if (cachedLoggedIn) renderProfiles(lastProfiles);
  });

  // QR
  document.getElementById("vcard-form").addEventListener("submit", (e) => {
    e.preventDefault();
    generateQR();
  });
  document.getElementById("downloadBtn").addEventListener("click", downloadPNG);
  document.getElementById("logo").addEventListener("change", handleLogoChange);
  document.getElementById("removeLogo").addEventListener("click", removeLogo);
  document.getElementById("resetBtn").addEventListener("click", () => {
    setTimeout(resetAll, 0);
  });

  // Auth (Auth0)
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Guardar perfil
  document.getElementById("saveBtn").addEventListener("click", saveProfile);

  // Inicializa Auth0 (carga config, procesa callback y actualiza la UI).
  initAuth();
});
