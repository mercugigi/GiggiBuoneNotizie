/**
 * app.js — Client della web-app (APK) sempre aggiornato
 * - Legge SEMPRE il JSON online dal repo (cache-busting)
 * - Ricerca smart (titolo+descrizione+fonte+categoria)
 * - Filtro per data (dal calendario)
 * - Salvataggio ultima copia in localStorage per uso offline
 */

const DATA_URL = "https://raw.githubusercontent.com/mercugigi/GiggiBuoneNotizie/main/news-data.json";

let allNews = [];         // lista piatta
let newsByDate = {};      // indice per_data { YYYY-MM-DD: [...] }
let lastUpdatedISO = "";  // ISO string
let currentDateKey = "";  // data selezionata (YYYY-MM-DD)

/** util: rimuove accenti e normalizza */
function norm(s="") {
  return s
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"")
    .trim();
}

/** carica online con cache-busting, fallback a localStorage offline */
async function loadNews() {
  const url = `${DATA_URL}?t=${Date.now()}`;
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
    if (raw) {
      applyData(JSON.parse(raw));
    } else {
      renderMessage("Nessun dato disponibile offline. Connettiti a internet.");
    }
  }
}

/** applica struttura a memoria e aggiorna UI */
function applyData(data) {
  lastUpdatedISO = data.aggiornato_il || "";
  allNews = Array.isArray(data.notizie) ? data.notizie : [];
  newsByDate = data.per_data || {};

  // mostra data di “oggi” nella testata, se hai un elemento dedicato
  const headerDate = document.querySelector("[data-header-date]");
  if (headerDate) {
    const d = new Date();
    headerDate.textContent = d.toLocaleDateString("it-IT", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
  }

  // default: mostra le notizie del giorno più recente disponibile
  const keys = Object.keys(newsByDate).filter(k => k !== "senzadata").sort().reverse();
  currentDateKey = keys[0] || "";
  renderByDate(currentDateKey);
}

/** rendering lista notizie per data */
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
      <div class="news-meta">${escapeHtml(n.fonte || "")} — ${formatISO(n.pubblicato)}</div>
      <div class="news-desc">${escapeHtml(n.descrizione || "")}</div>
      <a class="news-link" href="${n.url}" target="_blank" rel="noopener">Apri fonte</a>
    `;
    container.appendChild(card);
  }
}

/** ricerca smart su TUTTE le notizie (titolo/descrizione/fonte/categoria) */
function searchNews(query) {
  const q = norm(query);
  if (!q) { renderByDate(currentDateKey); return; }

  const results = allNews.filter(n =>
    norm(n.titolo).includes(q) ||
    norm(n.descrizione).includes(q) ||
    norm(n.fonte).includes(q) ||
    norm(n.categoria).includes(q)
  );

  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  container.innerHTML = "";

  if (!results.length) {
    renderMessage(`Nessun risultato per “${escapeHtml(query)}”.`);
    return;
  }

  for (const n of results) {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-title">${escapeHtml(n.titolo)}</div>
      <div class="news-meta">${escapeHtml(n.fonte || "")} — ${formatISO(n.pubblicato)} — <span class="tag">${escapeHtml(n.categoria)}</span></div>
      <div class="news-desc">${escapeHtml(n.descrizione || "")}</div>
      <a class="news-link" href="${n.url}" target="_blank" rel="noopener">Apri fonte</a>
    `;
    container.appendChild(card);
  }
}

/** hook UI: campo ricerca con id #searchInput (se esiste) */
function setupSearch() {
  const input = document.querySelector("#searchInput");
  const btn = document.querySelector("#searchBtn");
  if (input) {
    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") searchNews(input.value);
    });
  }
  if (btn) btn.addEventListener("click", () => searchNews(input?.value || ""));
}

/** hook UI: date picker con id #datePicker (se esiste) */
function setupDatePicker() {
  const picker = document.querySelector("#datePicker");
  if (!picker) return;
  picker.addEventListener("change", () => {
    const v = picker.value; // YYYY-MM-DD
    if (v && newsByDate[v]) {
      renderByDate(v);
    } else if (v) {
      renderMessage(`Nessuna notizia per ${formatDate(v)}.`);
    }
  });
}

/** helpers UI */
function renderMessage(text) {
  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  container.innerHTML = `<div class="news-empty">${escapeHtml(text)}</div>`;
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));}
function formatISO(iso){ if(!iso) return ""; const d=new Date(iso); return d.toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"}); }
function formatDate(key){ if(!key) return ""; const [y,m,d]=key.split("-"); return `${d}/${m}/${y}`; }

/** avvio */
document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupDatePicker();
  loadNews();
});
