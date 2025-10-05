const https = require('https');
const fs = require('fs');

// Configurazione categorie
const categories = ['technology', 'business', 'science', 'health', 'sports', 'entertainment'];
const articlesPerCategory = 5;

// API NewsAPI
const API_KEY = process.env.NEWS_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'newsapi.org';

// Fonti affidabili
const sources = [
    'bbc-news',
    'reuters',
    'the-guardian-uk',
    'associated-press',
    'cnn',
    'the-washington-post'
].join(',');

// Funzione per chiamare NewsAPI
function fetchNews(category) {
    return new Promise((resolve, reject) => {
        const today = new Date().toISOString().split('T')[0];
        
        const options = {
            hostname: BASE_URL,
            path: `/v2/top-headlines?category=${category}&language=it&pageSize=${articlesPerCategory}&apiKey=${API_KEY}`,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    
                    if (json.status === 'ok' && json.articles) {
                        const articles = json.articles.map(article => ({
                            title: article.title,
                            description: article.description,
                            content: article.content || article.description,
                            url: article.url,
                            source: article.source.name,
                            publishedAt: article.publishedAt,
                            category: category,
                            urlToImage: article.urlToImage
                        }));
                        resolve(articles);
                    } else {
                        console.error(`Errore API per ${category}:`, json.message);
                        resolve([]);
                    }
                } catch (err) {
                    console.error(`Errore parsing per ${category}:`, err);
                    resolve([]);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`Errore richiesta per ${category}:`, err);
            resolve([]);
        });

        req.end();
    });
}

// Funzione principale
async function generateNewsData() {
    console.log('🚀 Inizio recupero notizie...');
    console.log(`📅 Data: ${new Date().toLocaleDateString('it-IT')}`);

    let allArticles = [];

    // Recupera notizie per ogni categoria
    for (const category of categories) {
        console.log(`\n📰 Recupero notizie: ${category}...`);
        const articles = await fetchNews(category);
        console.log(`✅ Trovate ${articles.length} notizie per ${category}`);
        allArticles = allArticles.concat(articles);
        
        // Pausa per evitare rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Se non ci sono abbastanza notizie italiane, prova con notizie internazionali
    if (allArticles.length < 15) {
        console.log('\n🌍 Aggiungo notizie internazionali...');
        for (const category of categories) {
            const options = {
                hostname: BASE_URL,
                path: `/v2/top-headlines?category=${category}&language=en&pageSize=${articlesPerCategory}&apiKey=${API_KEY}`,
                method: 'GET'
            };

            const articles = await new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            if (json.status === 'ok' && json.articles) {
                                resolve(json.articles.map(a => ({
                                    title: a.title,
                                    description: a.description,
                                    content: a.content || a.description,
                                    url: a.url,
                                    source: a.source.name,
                                    publishedAt: a.publishedAt,
                                    category: category,
                                    urlToImage: a.urlToImage
                                })));
                            } else resolve([]);
                        } catch (err) {
                            resolve([]);
                        }
                    });
                });
                req.on('error', () => resolve([]));
                req.end();
            });

            allArticles = allArticles.concat(articles);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Limita a 30 articoli totali
    allArticles = allArticles.slice(0, 30);

    // Salva nel file JSON
    const newsData = {
        lastUpdate: new Date().toISOString(),
        totalArticles: allArticles.length,
        articles: allArticles
    };

    fs.writeFileSync('news-data.json', JSON.stringify(newsData, null, 2));
    console.log(`\n✅ File news-data.json creato con successo!`);
    console.log(`📊 Totale articoli: ${allArticles.length}`);
    console.log(`⏰ Ultimo aggiornamento: ${new Date().toLocaleString('it-IT')}`);
}

// Esegui
generateNewsData().catch(err => {
    console.error('❌ Errore:', err);
    process.exit(1);
});
