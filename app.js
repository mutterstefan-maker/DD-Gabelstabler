if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

let deferredInstallPrompt = null;
const installBtn = document.getElementById("install-btn");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

const inventory = document.getElementById("inventory");
const verfuegbar = window.BESTAND.filter((s) => !s.verkauft);
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

inventory.innerHTML = verfuegbar.length
  ? verfuegbar.map((s) => `
    <a href="stapler.html?id=${s.id}" class="card stapler-card">
      <div class="stapler-card-image">
        <img src="images/${s.id}/01.jpg" alt="${escapeHtml(s.titel)}" loading="lazy">
        <span class="badge">${s.bilder} Bilder</span>
      </div>
      <div class="stapler-card-body">
        <h3>${escapeHtml(s.titel)}</h3>
        <p class="muted">${escapeHtml(s.untertitel)}</p>
        <ul class="tags">
          ${s.eckdaten.slice(0, 3).map(([, v]) => `<li>${escapeHtml(v)}</li>`).join("")}
        </ul>
        <div class="stapler-card-footer">
          <span class="price">${s.preisBrutto.toLocaleString("de-DE")} €${s.verhandlungsbasis ? " <small>VB</small>" : ""}</span>
          <span class="btn-link">Details →</span>
        </div>
      </div>
    </a>`).join("")
  : `<div class="card placeholder"><p>Neue Angebote folgen in Kürze.</p></div>`;

// Vorausgefüllte Anfrage, z.B. von der Fahrzeug-Detailseite.
const vorbelegung = new URLSearchParams(location.search).get("anfrage");
if (vorbelegung) {
  document.getElementById("nachricht").value = vorbelegung + "\n\n";
}

// Kein Backend angebunden - Anfragen landen aktuell nur lokal im Browser.
const form = document.getElementById("kontaktform");
const status = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "Danke für Ihre Anfrage! Wir melden uns zeitnah.";
  form.reset();
});
