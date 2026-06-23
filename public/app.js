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

const TOKEN_KEY = "vcard_token";
const EMAIL_KEY = "vcard_email";

let qrCode = null;        // instancia de QRCodeStyling
let logoDataUrl = null;   // foto/logo en base64
let editingId = null;     // id del perfil que se está editando (si aplica)

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
    alert("Escribe al menos el nombre o el apellido para generar el QR.");
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
  container.innerHTML = '<p class="qr-placeholder">Aquí aparecerá tu QR</p>';
  document.getElementById("downloadBtn").disabled = true;
}

// ============================================================
//  AUTENTICACIÓN Y API
// ============================================================

function getToken() { return localStorage.getItem(TOKEN_KEY); }

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Error de servidor.");
  return body;
}

function setAuthMessage(text, ok = false) {
  const el = document.getElementById("authMsg");
  el.textContent = text;
  el.classList.toggle("ok", ok);
}

function isLoggedIn() { return !!getToken(); }

function updateAuthUI() {
  const logged = isLoggedIn();
  document.getElementById("auth-form").hidden = logged;
  document.getElementById("user-bar").hidden = !logged;
  document.getElementById("saved-panel").hidden = !logged;
  document.getElementById("saveBtn").hidden = !logged;
  if (logged) {
    document.getElementById("userEmail").textContent = localStorage.getItem(EMAIL_KEY) || "";
    loadProfiles();
  }
}

async function doAuth(kind) {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  setAuthMessage("");
  try {
    const res = await api(`/auth/${kind}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(EMAIL_KEY, res.email);
    document.getElementById("authPassword").value = "";
    updateAuthUI();
  } catch (err) {
    setAuthMessage(err.message);
  }
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  editingId = null;
  document.getElementById("saved-list").innerHTML = "";
  updateAuthUI();
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
    "Sin nombre"
  );
}

function renderProfiles(items) {
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
    loadBtn.textContent = "Cargar";
    loadBtn.addEventListener("click", () => {
      fillForm(p);
      editingId = p._id;
      generateQR();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Eliminar";
    delBtn.className = "del";
    delBtn.addEventListener("click", () => deleteProfile(p._id));

    actions.append(loadBtn, delBtn);
    li.append(name, actions);
    list.append(li);
  }
}

async function saveProfile() {
  if (!isLoggedIn()) return;
  const data = readForm();

  if (!data.firstName && !data.lastName) {
    alert("Escribe al menos el nombre o el apellido antes de guardar.");
    return;
  }

  const suggested = [data.firstName, data.lastName].filter(Boolean).join(" ");
  const label = prompt("Nombre para este perfil:", suggested);
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
    alert("Perfil guardado.");
  } catch (err) {
    alert("No se pudo guardar: " + err.message);
  }
}

async function deleteProfile(id) {
  if (!confirm("¿Eliminar este perfil?")) return;
  try {
    await api(`/vcards/${id}`, { method: "DELETE" });
    if (editingId === id) editingId = null;
    await loadProfiles();
  } catch (err) {
    alert("No se pudo eliminar: " + err.message);
  }
}

// ---- Inicialización --------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
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

  // Auth
  document.getElementById("loginBtn").addEventListener("click", () => doAuth("login"));
  document.getElementById("registerBtn").addEventListener("click", () => doAuth("register"));
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Guardar perfil
  document.getElementById("saveBtn").addEventListener("click", saveProfile);

  updateAuthUI();
});
