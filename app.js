// Configurazione
const categoryEmojis = {
    'technology': '💻',
    'business': '💼',
    'science': '🔬',
    'health': '🏥',
    'sports': '⚽',
    'entertainment': '🎬',
    'general': '🌍'
};

const categoryNames = {
    'technology': 'Tecnologia',
    'business': 'Business',
    'science': 'Scienza',
    'health': 'Salute',
    'sports': 'Sport',
    'entertainment': 'Intrattenimento',
    'general': 'Generale'
};

let allNews = [];
let currentCategory = 'all';

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
    updateDate();
    setupEventListeners();
    await loadNews();
});

// Aggiorna data corrente
function updateDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const date = new Date().toLocaleDateString('it-IT', options);
    document.getElementById('currentDate').textContent = `📅 ${date}`;
}

// Setup Event Listeners
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            filterNews();
        });
    });

    // Search
    document.getElementById('searchBox').addEventListener('input', (e) => {
        searchNews(e.target.value);
    });

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
}

// Carica notizie da NewsAPI
async function loadNews() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const newsGrid = document.getElementById('newsGrid');

    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        newsGrid.innerHTML = '';

        // Carica notizie da file JSON (generate da GitHub Actions)
        const response = await fetch('news-data.json');
        
        if (!response.ok) {
            throw new Error('Impossibile caricare le notizie');
        }

        const data = await response.json();
        allNews = data.articles || [];

        loading.style.display = 'none';

        if (allNews.length === 0) {
            error.style.display = 'block';
            error.textContent = '📭 Nessuna notizia disponibile al momento';
        } else {
            displayNews(allNews);
        }

    } catch (err) {
        console.error('Errore caricamento notizie:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = `❌ Errore: ${err.message}. Le notizie verranno aggiornate automaticamente domani alle 6:00`;
    }
}

// Mostra notizie
function displayNews(newsArray) {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';

    newsArray.forEach((article, index) => {
        const category = article.category || 'general';
        const emoji = categoryEmojis[category] || '📰';
        
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-number">${index + 1}</div>
            <div class="news-emoji">${emoji}</div>
            <span class="news-category">${categoryNames[category] || 'Generale'}</span>
            <h3 class="news-title">${article.title}</h3>
            <p class="news-source">📡 ${article.source || 'Fonte non disponibile'}</p>
        `;
        
        card.addEventListener('click', () => openModal(article, emoji, category));
        newsGrid.appendChild(card);
    });
}

// Filtra per categoria
function filterNews() {
    if (currentCategory === 'all') {
        displayNews(allNews);
    } else {
        const filtered = allNews.filter(article => article.category === currentCategory);
        displayNews(filtered);
    }
}

// Cerca notizie
function searchNews(query) {
    if (!query.trim()) {
        filterNews();
        return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allNews.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm);
        const descMatch = article.description?.toLowerCase().includes(searchTerm);
        const contentMatch = article.content?.toLowerCase().includes(searchTerm);
        
        return titleMatch || descMatch || contentMatch;
    });

    displayNews(filtered);
}

// Apri modal
function openModal(article, emoji, category) {
    const modal = document.getElementById('modal');
    const modalEmoji = document.getElementById('modalEmoji');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalSource = document.getElementById('modalSource');
    const modalDate = document.getElementById('modalDate');
    const modalContent = document.getElementById('modalContent');

    modalEmoji.textContent = emoji;
    modalCategory.textContent = categoryNames[category] || 'Generale';
    modalTitle.textContent = article.title;
    modalSource.textContent = `📡 ${article.source || 'Fonte non disponibile'}`;
    
    const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('it-IT') : 'Data non disponibile';
    modalDate.textContent = `📅 ${date}`;

    // Formatta contenuto articolo
    let content = `<p>${article.description || ''}</p>`;
    
    if (article.content) {
        // Divide il contenuto in paragrafi
        const paragraphs = article.content.split('\n\n');
        content += paragraphs.map(p => `<p>${p}</p>`).join('');
    }

    if (article.url) {
        content += `<p><a href="${article.url}" target="_blank" style="color: #667eea; font-weight: 600;">🔗 Leggi l'articolo completo</a></p>`;
    }

    modalContent.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Chiudi modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Chiudi modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
