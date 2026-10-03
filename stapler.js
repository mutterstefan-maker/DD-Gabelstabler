const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const euro = (value) => value.toLocaleString("de-DE") + " €";

const bildPfad = (stapler, nr) => `images/${stapler.id}/${String(nr).padStart(2, "0")}.jpg`;

const main = document.getElementById("detail");
const id = new URLSearchParams(location.search).get("id");
const stapler = window.BESTAND.find((s) => s.id === id);

if (!stapler) {
  main.insertAdjacentHTML("beforeend", `
    <div class="card placeholder detail-missing">
      <p>Dieses Fahrzeug ist leider nicht mehr verfügbar.</p>
      <a href="index.html#bestand" class="btn-link">Zum aktuellen Bestand →</a>
    </div>`);
} else {
  document.title = `${stapler.titel} – DD-Gabelstapler`;
  const bilder = Array.from({ length: stapler.bilder }, (_, i) => bildPfad(stapler, i + 1));
  const anfrage = encodeURIComponent(`Anfrage zu: ${stapler.titel}`);

  main.insertAdjacentHTML("beforeend", `
    <div class="detail-grid">
      <div class="gallery">
        <div class="gallery-main">
          <img id="gallery-image" src="${bilder[0]}" alt="${escapeHtml(stapler.titel)} – Bild 1">
          <button class="gallery-nav prev" aria-label="Vorheriges Bild">‹</button>
          <button class="gallery-nav next" aria-label="Nächstes Bild">›</button>
          <span class="gallery-count" id="gallery-count">1 / ${bilder.length}</span>
        </div>
        <div class="gallery-thumbs">
          ${bilder.map((src, i) => `
            <button class="thumb${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Bild ${i + 1}">
              <img src="${src}" alt="" loading="lazy">
            </button>`).join("")}
        </div>
      </div>

      <aside class="detail-sidebar">
        <p class="eyebrow">${stapler.verkauft ? "Verkauft" : "Verfügbar"}</p>
        <h1>${escapeHtml(stapler.titel)}</h1>
        <p class="muted">${escapeHtml(stapler.untertitel)}</p>
        <div class="price-box">
          <span class="price">${euro(stapler.preisBrutto)}</span>
          <span class="price-note">${stapler.verhandlungsbasis ? "VB · " : ""}inkl. 19 % MwSt.${stapler.preisNetto ? ` · ${euro(stapler.preisNetto)} netto` : ""}</span>
        </div>
        <dl class="specs">
          ${stapler.eckdaten.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join("")}
        </dl>
        <div class="detail-actions">
          <a href="index.html?anfrage=${anfrage}#kontakt" class="btn btn-primary">Anfrage stellen</a>
          <a href="tel:+4915161112391" class="btn btn-ghost">01516 1112391</a>
        </div>
        ${stapler.kleinanzeigen ? `<a href="${stapler.kleinanzeigen}" target="_blank" rel="noopener" class="btn-link external-link">Anzeige auf Kleinanzeigen ansehen ↗</a>` : ""}
      </aside>
    </div>

    <section class="detail-section">
      <h2>Ausstattung</h2>
      <ul class="checklist checklist-2col">
        ${stapler.ausstattung.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
      </ul>
    </section>

    <section class="detail-section">
      <h2>Beschreibung</h2>
      ${stapler.beschreibung.map((p) => `<p class="muted">${escapeHtml(p)}</p>`).join("")}
    </section>`);

  let aktuell = 0;
  const bild = document.getElementById("gallery-image");
  const zaehler = document.getElementById("gallery-count");
  const thumbs = main.querySelectorAll(".thumb");

  const zeige = (index) => {
    aktuell = (index + bilder.length) % bilder.length;
    bild.src = bilder[aktuell];
    bild.alt = `${stapler.titel} – Bild ${aktuell + 1}`;
    zaehler.textContent = `${aktuell + 1} / ${bilder.length}`;
    thumbs.forEach((t, i) => t.classList.toggle("active", i === aktuell));
    thumbs[aktuell].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  main.querySelector(".prev").addEventListener("click", () => zeige(aktuell - 1));
  main.querySelector(".next").addEventListener("click", () => zeige(aktuell + 1));
  thumbs.forEach((t) => t.addEventListener("click", () => zeige(Number(t.dataset.index))));
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") zeige(aktuell - 1);
    if (e.key === "ArrowRight") zeige(aktuell + 1);
  });

  let touchX = null;
  bild.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  bild.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) zeige(aktuell + (dx < 0 ? 1 : -1));
    touchX = null;
  });
}
