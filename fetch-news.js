/**
 * fetch-news.js — Genera news-data.json con archivio per data
 * Output:
 * {
 *   "aggiornato_il": "...",
 *   "totale": N,
 *   "notizie": [...],
 *   "per_data": { "YYYY-MM-DD": [ ... ] }
 * }
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const NEWS_API_KEY = process.env.NEWS_API_KEY;
if (!NEWS_API_KEY) {
  console.error("❌ Manca NEWS_API_KEY nei Secrets di GitHub.");
  process.exit(1);
}

const CATEGORIES = ["technology","business","science","health","sports","entertainment","general"];
const BASE_URL = "https://newsapi.org/v2/top-headlines?language=it&pageSize=30";

/** GET con User-Agent (NewsAPI rifiuta richieste anonime) */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "GiggiGoodNewsBot/1.0" } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0,180)}`));
            }
            resolve(JSON.parse(data));
          } catch (e) { reject(e); }
        });
      })
      .on("error", reject)
      .setTimeout(15000, function () { this.destroy(new Error("Timeout API")); });
  });
}

function normalize(articles, categoria) {
  return (articles || [])
    .filter(a => a && a.title && a.url)
    .map(a => {
      const iso = a.publishedAt || "";
      const data_articolo = iso ? iso.slice(0,10) : "";
      return {
        categoria,
        titolo: a.title,
        fonte: a.source?.name || "",
        url: a.url,
        descrizione: a.description || "",
        pubblicato: iso,
        data_articolo
      };
    });
}

async function run() {
  console.log("⚙️ Raccolta notizie…");
  let tutte = [];

  for (const cat of CATEGORIES) {
    const url = `${BASE_URL}&category=${cat}&apiKey=${NEWS_API_KEY}`;
    try {
      const json = await fetchJson(url);
      const items = normalize(json.articles, cat);
      console.log(`✅ ${cat}: ${items.length} articoli`);
      tutte = tutte.concat(items);
    } catch (e) {
      console.log(`❌ ${cat}: ${e.message}`);
    }
  }

  // Ordina per data (desc)
  tutte.sort((a,b) => new Date(b.pubblicato) - new Date(a.pubblicato));

  // Indice per data
  const per_data = {};
  for (const n of tutte) {
    const key = n.data_articolo || "senzadata";
    (per_data[key] ||= []).push(n);
  }

  const out = {
    aggiornato_il: new Date().toISOString(),
    totale: tutte.length,
    notizie: tutte,
    per_data
  };

  fs.writeFileSync(path.join(process.cwd(),"news-data.json"), JSON.stringify(out,null,2), "utf8");
  console.log(`💾 news-data.json scritto. Totale: ${out.totale}`);
}

run().catch(e => { console.error("Errore generale:", e.message || e); process.exit(1); });
