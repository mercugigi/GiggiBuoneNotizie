/**
 * fetch-news.js — Giggi Buone Notizie
 * Ultima versione ottimizzata per GitHub Actions + Netlify
 * Autore: Maestro Luigi (Sicily Acro)
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  console.error("❌ Errore: manca la variabile NEWS_API_KEY (impostala nei secrets GitHub).");
  process.exit(1);
}

// ⚙️ Categorie da aggiornare
const CATEGORIES = [
  "technology",
  "business",
  "science",
  "health",
  "sports",
  "entertainment",
  "general",
];

// 🔧 URL base di NewsAPI (puoi cambiare lingua o paese)
const BASE_URL = "https://newsapi.org/v2/top-headlines?language=it&pageSize=20";

// Funzione HTTP con header User-Agent richiesto
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "GiggiGoodNewsBot/1.0",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(
                  new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`)
                );
              }
              const json = JSON.parse(data);
              resolve(json);
            } catch (e) {
              reject(e);
            }
          });
        }
      )
      .on("error", reject)
      .setTimeout(15000, function () {
        this.destroy(new Error("Timeout richiesta API"));
      });
  });
}

// Normalizza i dati
function normalize(articles, category) {
  return (articles || [])
    .filter((a) => a && a.title && a.url)
    .map((a) => ({
      categoria: category,
      titolo: a.title,
      fonte: a.source?.name || "",
      url: a.url,
      descrizione: a.description || "",
      pubblicato: a.publishedAt || "",
    }));
}

async function run() {
  console.log("⚙️ Inizio recupero notizie...");
  console.log(`📅 Data: ${new Date().toLocaleDateString("it-IT")}`);

  let tutteLeNotizie = [];

  for (const cat of CATEGORIES) {
    console.log(`\n🔸 Recupero notizie: ${cat}...`);
    const url = `${BASE_URL}&category=${cat}&apiKey=${NEWS_API_KEY}`;

    try {
      const api = await fetchJson(url);
      if (!api.articles) {
        console.log(`⚠️ Nessun risultato per ${cat}.`);
        continue;
      }
      const items = normalize(api.articles, cat);
      console.log(`✅ Trovate ${items.length} notizie per ${cat}`);
      tutteLeNotizie = tutteLeNotizie.concat(items);
    } catch (err) {
      console.log(`❌ Errore API per ${cat}: ${err.message}`);
    }
  }

  // Ordina per data
  tutteLeNotizie.sort(
    (a, b) => new Date(b.pubblicato) - new Date(a.pubblicato)
  );

  const risultato = {
    aggiornato_il: new Date().toISOString(),
    totale: tutteLeNotizie.length,
    notizie: tutteLeNotizie,
  };

  const outPath = path.join(process.cwd(), "news-data.json");
  fs.writeFileSync(outPath, JSON.stringify(risultato, null, 2), "utf8");

  console.log(`\n💾 File news-data.json creato con successo!`);
  console.log(`📰 Totale articoli salvati: ${risultato.totale}`);
  console.log(`🕒 Ultimo aggiornamento: ${new Date().toLocaleString("it-IT")}`);

  process.exit(0);
}

// Avvia lo script
run().catch((err) => {
  console.error("❌ Errore generale:", err.message || err);
  process.exit(1);
});
