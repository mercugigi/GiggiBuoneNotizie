// fetch-news.js
// Aggiorna news-data.json solo se arrivano dati validi e diversi dai precedenti.

const fs = require('fs');
const path = require('path');
const https = require('https');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
if (!NEWS_API_KEY) {
  console.error('ERROR: missing NEWS_API_KEY secret');
  process.exit(1);
}

// Esempio con NewsAPI.org (modifica query/endpoint a tuo piacere)
const NEWS_URL = `https://newsapi.org/v2/top-headlines?language=it&category=general&pageSize=50&apiKey=${NEWS_API_KEY}`;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(
                new Error(`HTTP ${res.statusCode}: ${data?.slice(0, 200)}`)
              );
            }
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject)
      .setTimeout(15000, function () {
        this.destroy(new Error('Request timeout'));
      });
  });
}

function normalize(items) {
  // Pulisci/minimizza i campi utili per la tua UI
  return (items || [])
    .filter((x) => x && x.title && x.url)
    .map((x) => ({
      title: x.title,
      url: x.url,
      source: x.source?.name || '',
      publishedAt: x.publishedAt || '',
      description: x.description || '',
      // altri campi se ti servono
    }));
}

async function run() {
  console.log('Fetching latest news…');
  const api = await fetchJson(NEWS_URL);

  if (!api || !Array.isArray(api.articles)) {
    throw new Error('Invalid API response structure');
  }

  const next = { updatedAt: new Date().toISOString(), items: normalize(api.articles) };

  const outPath = path.join(process.cwd(), 'news-data.json');
  let prev = null;

  try {
    prev = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  } catch (_) {
    // file assente o invalido: verrà scritto da zero
  }

  const prevStr = prev ? JSON.stringify(prev.items) : '';
  const nextStr = JSON.stringify(next.items);

  if (prevStr === nextStr) {
    console.log('No changes in news; nothing to update.');
    // exit 0: il workflow non committerà nulla
    process.exit(0);
  }

  fs.writeFileSync(outPath, JSON.stringify(next, null, 2), 'utf8');
  console.log('news-data.json updated.');
}

run().catch((err) => {
  console.error('Fetch failed:', err && err.message ? err.message : err);
  process.exit(1);
});
