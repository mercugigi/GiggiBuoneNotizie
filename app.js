/**
 * app.js — Client della web-app (APK) sempre aggiornato
 * - Legge SEMPRE il JSON online dal repo (cache-busting)
 * - Ricerca smart (titolo+descrizione+fonte+categoria) con messaggio “nel recente periodo”
 * - Filtro per data (calendario)
 * - Cache locale per uso offline
 */

const DATA_URL = "https://raw.githubusercontent.com/mercugigi/GiggiBuoneNotizie/main/news-data.json";
const RECENT_DAYS = 60; // “recente periodo” per il messaggio della ricerca

let allNews = [];         // lista piatta
let newsByDate = {};      // indice per_data { YYYY-MM-DD: [...] }
let lastUpdatedISO = "";  // ISO string
let currentDateKey = "";  // data selezionata (YYYY-MM-DD)

function norm(s="") {
  return s
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"")
    .trim();
}

async function loadNews() {
  const url = `${DATA_URL}?t=${Date.now()}`; // cache-buster
  try {
    const res = await fetch(url, { headers: { "User-Agent":"GiggiGoodNewsApp/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // salva copia offline
    localStorage.setItem("ggn:data", JSON.stringify(data));
    applyData(data);
  } catch (e) {
    console.warn("⚠️ Online KO, uso cache locale:", e.message);
    const raw = localStorage.getItem("ggn:data");
    if (raw) applyData(JSON.parse(raw));
    else renderMessage("Nessun dato disponibile offline. Connettiti a internet.");
  }
}

function applyData(data) {
  lastUpdatedISO = data.aggiornato_il || "";
  allNews = Array.isArray(data.notizie) ? data.notizie : [];
  newsByDate = data.per_data || {};

  // Mostra data umana in testata (se presente l’elemento)
  const headerDate = document.querySelector("[data-header-date]");
  if (headerDate) {
    const d = new Date();
    headerDate.textContent = d.toLocaleDateString("it-IT", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
  }

  // Imposta min/max del datePicker (per comodità)
  const picker = document.querySelector("#datePicker");
  if (picker) {
    const keys = Object.keys(newsByDate).filter(k => k !== "senzadata").sort(); // asc
    if (keys.length) {
      picker.min = keys[0];
      picker.max = keys[keys.length - 1];
    }
  }

  // Mostra il giorno più recente
  const keysDesc = Object.keys(newsByDate).filter(k => k !== "senzadata").sort().reverse();
  currentDateKey = keysDesc[0] || "";
  renderByDate(currentDateKey);
}

function renderByDate(dateKey) {
  currentDateKey = dateKey;
  const list = newsByDate[dateKey] || [];
  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  container.innerHTML = "";

  if (!list.length) {
    renderMessage(`Nessuna notizia per ${formatDate(dateKey)}.`);
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

function searchNews(query) {
  const q = norm(query);
  const container = document.querySelector("[data-news-list]");
  if (!container) return;

  if (!q) { renderByDate(currentDateKey); return; }

  // filtro full-text
  const hits = allNews.filter(n =>
    norm(n.titolo).includes(q) ||
    norm(n.descrizione).includes(q) ||
    norm(n.fonte).includes(q) ||
    norm(n.categoria).includes(q)
  );

  // se zero risultati → messaggio “recente periodo”
  if (!hits.length) {
    container.innerHTML = "";
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
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

function setupSearch() {
  const input = document.querySelector("#searchInput");
  const btn = document.querySelector("#searchBtn");
  if (input) input.addEventListener("keyup", (e) => { if (e.key === "Enter") searchNews(input.value); });
  if (btn) btn.addEventListener("click", () => searchNews(input?.value || ""));
}

function setupDatePicker() {
  const picker = document.querySelector("#datePicker");
  if (!picker) return;
  picker.addEventListener("change", () => {
    const v = picker.value; // YYYY-MM-DD
    if (v && newsByDate[v]) renderByDate(v);
    else if (v) renderMessage(`Nessuna notizia per ${formatDate(v)}.`);
  });
}

/* ——— Helpers ——— */
function renderMessage(text) {
  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  container.innerHTML = `<div class="news-empty">${escapeHtml(text)}</div>`;
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));}
function formatISO(iso){ if(!iso) return ""; const d=new Date(iso); return d.toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"}); }
function formatDate(key){ if(!key) return ""; const [y,m,d]=key.split("-"); return `${d}/${m}/${y}`; }

/* ——— Avvio ——— */
document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupDatePicker();
  loadNews();
});
