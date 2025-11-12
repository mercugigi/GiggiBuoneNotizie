const DATA_URL = "https://raw.githubusercontent.com/mercugigi/GiggiBuoneNotizie/main/news-data.json";

document.addEventListener("DOMContentLoaded", async () => {
  const newsContainer = document.querySelector("#news");
  const dateEl = document.querySelector("#today");
  const searchInput = document.querySelector("#search");
  const searchBtn = document.querySelector("#searchBtn");
  const datePicker = document.querySelector("#datePicker");

  // Mostra la data di oggi
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString("it-IT", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });

  async function loadNews() {
    newsContainer.innerHTML = "🕓 Caricamento notizie...";
    try {
      const res = await fetch(`${DATA_URL}?nocache=${Date.now()}`);
      const data = await res.json();
      renderNews(data.notizie || []);
    } catch (e) {
      newsContainer.innerHTML = "❌ Nessuna notizia disponibile al momento.";
    }
  }

  function renderNews(list) {
    if (!list.length) {
      newsContainer.innerHTML = "Nessuna notizia disponibile.";
      return;
    }
    newsContainer.innerHTML = list.map((n, i) => `
      <div class="news-card">
        <div class="title">${i+1}. ${n.titolo}</div>
        <div class="meta">${n.fonte || ""} — ${new Date(n.pubblicato).toLocaleDateString("it-IT")}</div>
        <div class="desc">${n.descrizione || ""}</div>
        <a href="${n.url}" target="_blank" rel="noopener">Apri fonte</a>
      </div>
    `).join("");
  }

  // Ricerca
  function searchNews(query) {
    fetch(`${DATA_URL}?nocache=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        const found = (d.notizie||[]).filter(n => 
          n.titolo.toLowerCase().includes(query.toLowerCase()) ||
          n.descrizione.toLowerCase().includes(query.toLowerCase())
        );
        if (!found.length) {
          newsContainer.innerHTML = `Nessun risultato trovato per “${query}” nel recente periodo.`;
        } else {
          renderNews(found);
        }
      });
  }

  // Eventi
  searchBtn.addEventListener("click", () => searchNews(searchInput.value));
  searchInput.addEventListener("keyup", e => { if(e.key==="Enter") searchNews(searchInput.value) });

  datePicker.addEventListener("change", () => {
    const val = datePicker.value;
    if (!val) return;
    fetch(`${DATA_URL}?nocache=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        const sameDay = (d.notizie||[]).filter(n => n.pubblicato?.startsWith(val));
        if (!sameDay.length)
          newsContainer.innerHTML = `Nessuna notizia per il ${val}.`;
        else
          renderNews(sameDay);
      });
  });

  loadNews();
});
