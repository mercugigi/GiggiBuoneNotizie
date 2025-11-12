/* ===========================
   app.js — VERSIONE COMPLETA
   =========================== */

/* Sorgente dati: SEMPRE dal repo GitHub, con cache-buster */
const DATA_URL =
  "https://raw.githubusercontent.com/mercugigi/GiggiBuoneNotizie/main/news-data.json";

/* Giorni considerati “recente periodo” per il messaggio della ricerca */
const RECENT_DAYS = 60;

let allNews = [];         // tutte le notizie in lista piatta
let newsByDate = {};      // indice per_data { "YYYY-MM-DD": [ ... ] }
let currentDateKey = "";  // data selezionata (YYYY-MM-DD)

/* ---------- UTIL ---------- */
function norm(s = "") {
  return s.toString()
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "") // rimuove accenti
    .trim();
}
function escapeHtml(s=""){
  return s.replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function formatISO(iso){
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT",{ day:"2-digit", month:"long", year:"numeric" });
}
function formatDateKey(key){
  if (!key) return "";
  const [y,m,d] = key.split("-");
  return `${d}/${m}/${y}`;
}
function renderMessage(text) {
  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  container.innerHTML = `<div class="news-empty">${escapeHtml(text)}</div>`;
}

/* ---------- CARICAMENTO DATI ---------- */
async function loadNews() {
  const url = `${DATA_URL}?nocache=${Date.now()}`; // forza NO cache
  try {
    const res = await fetch(url, { headers: { "User-Agent":"GiggiGoodNewsApp/1.0" }});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // salva copia offline
    localStorage.setItem("ggn:data", JSON.stringify(data));

    applyData(data);
  } catch (e) {
    console.warn("Online KO, uso cache locale:", e.message);
    const raw = localStorage.getItem("ggn:data");
    if (raw) applyData(JSON.parse(raw));
    else renderMessage("Nessun dato disponibile. Connettiti a internet e riapri l’app.");
  }
}

function applyData(data) {
  allNews   = Array.isArray(data.notizie) ? data.notizie : [];
  newsByDate = data.per_data || {};

  // data in testata (se c’è l’elemento)
  const headerDate = document.querySelector("[data-header-date]");
  if (headerDate) {
    headerDate.textContent = new Date().toLocaleDateString(
      "it-IT",
      { weekday:"long", day:"2-digit", month:"long", year:"numeric" }
    );
  }

  // limiti calendario (se presente)
  const picker = document.querySelector("#datePicker");
  if (picker) {
    const keys = Object.keys(newsByDate).filter(k => k !== "senzadata").sort();
    if (keys.length) {
      picker.min = keys[0];
      picker.max = keys[keys.length - 1];
    }
  }

  // mostra giorno più recente disponibile
  const keysDesc = Object.keys(newsByDate).filter(k => k !== "senzadata").sort().reverse();
  currentDateKey = keysDesc[0] || "";
  renderByDate(currentDateKey);
}

/* ---------- RENDER ---------- */
function renderByDate(dateKey) {
  currentDateKey = dateKey;
  const list = newsByDate[dateKey] || [];
  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  container.innerHTML = "";

  if (!list.length) {
    renderMessage(`Nessuna notizia per ${formatDateKey(dateKey)}.`);
    return;
  }

  for (const n of list) {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-title">${escapeHtml(n.titolo)}</div>
      <div class="news-meta">${escapeHtml(n.fonte || "")} — ${formatISO(n.pubblicato)} — <span class="tag">${escapeHtml(n.categoria || "")}</span></div>
      <div class="news-desc">${escapeHtml(n.descrizione || "")}</div>
      <a class="news-link" href="${n.url}" target="_blank" rel="noopener">Apri fonte</a>
    `;
    container.appendChild(card);
  }
}

/* ---------- RICERCA ---------- */
function searchNews(query) {
  const q = norm(query);
  const container = document.querySelector("[data-news-list]");
  if (!container) return;

  if (!q) { renderByDate(currentDateKey); return; }

  const hits = allNews.filter(n =>
    norm(n.titolo).includes(q) ||
    norm(n.descrizione).includes(q) ||
    norm(n.fonte).includes(q) ||
    norm(n.categoria).includes(q)
  );

  if (!hits.length) {
    const msg = `Nessun risultato trovato per “${escapeHtml(query)}” nel recente periodo (ultimi ${RECENT_DAYS} giorni). Prova una parola diversa o scegli una data dal calendario.`;
    renderMessage(msg);
    return;
  }

  container.innerHTML = "";
  for (const n of hits) {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-title">${escapeHtml(n.titolo)}</div>
      <div class="news-meta">${escapeHtml(n.fonte || "")} — ${formatISO(n.pubblicato)} — <span class="tag">${escapeHtml(n.categoria || "")}</span></div>
      <div class="news-desc">${escapeHtml(n.descrizione || "")}</div>
      <a class="news-link" href="${n.url}" target="_blank" rel="noopener">Apri fonte</a>
    `;
    container.appendChild(card);
  }
}

/* ---------- LISTENERS ---------- */
function setupSearch() {
  const input = document.querySelector("#searchInput");
  const btn = document.querySelector("#searchBtn");
  if (input) input.addEventListener("keyup", (e) => { if (e.key === "Enter") searchNews(input.value); });
  if (btn)   btn.addEventListener("click", () => searchNews(input?.value || ""));
}
function setupDatePicker() {
  const picker = document.querySelector("#datePicker");
  if (!picker) return;
  picker.addEventListener("change", () => {
    const v = picker.value; // YYYY-MM-DD
    if (v && newsByDate[v]) renderByDate(v);
    else if (v) renderMessage(`Nessuna notizia per ${formatDateKey(v)}.`);
  });
}

/* ---------- AVVIO ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupDatePicker();
  loadNews();
});
