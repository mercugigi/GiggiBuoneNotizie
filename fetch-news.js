/**
 * fetch-news.js — versione stabile e completa
 * Aggiorna automaticamente news-data.json con notizie vere
 * Fonti: BBC News, ANSA, Reuters, SkyTG24 (via NewsAPI.org)
 * © Giggi Good News
 */

import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.NEWS_API_KEY;
const OUTPUT_FILE = "news-data.json";
const SOURCES = [
  "bbc-news",
  "ansa",
  "reuters",
  "sky-tg24"
];

// Numero max di articoli per fonte
const LIMIT = 12;

// Funzione di pausa per sicurezza API
const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchSource(source) {
  const url = `https://newsapi.org/v2/top-headlines?sources=${source}&pageSize=${LIMIT}&language=it&apiKey=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.articles) return [];
    return data.articles.map(a => ({
      titolo: a.title || "",
      descrizione: a.description || "",
      url: a.url || "",
      fonte: a.source?.name || source,
      pubblicato: a.publishedAt || new Date().toISOString(),
      categoria: a.category || "",
    }));
  } catch (err) {
    console.error(`❌ Errore su ${source}:`, err.message);
    return [];
  }
}

async function run() {
  console.log("🚀 Avvio raccolta notizie reali...");

  if (!API_KEY) {
    console.error("❌ Manca la variabile NEWS_API_KEY nei Secrets GitHub!");
    process.exit(1);
  }

  let allNews = [];
  for (const src of SOURCES) {
    console.log(`🔹 Raccolgo da ${src}...`);
    const news = await fetchSource(src);
    allNews.push(...news);
    await wait(1500); // evita blocchi API
  }

  // Ordina per data più recente
  allNews.sort((a,b) => new Date(b.pubblicato) - new Date(a.pubblicato));

  // Raggruppa per data (AAAA-MM-GG)
  const per_data = {};
  for (const n of allNews) {
    const key = n.pubblicato.slice(0,10);
    if (!per_data[key]) per_data[key] = [];
    per_data[key].push(n);
  }

  const out = {
    aggiornato_il: new Date().toISOString(),
    totale: allNews.length,
    notizie: allNews,
    per_data
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf-8");
  console.log(`✅ File aggiornato: ${OUTPUT_FILE} (${allNews.length} notizie)`);
}

run().catch(e => {
  console.error("❌ Errore generale:", e);
  process.exit(1);
});
