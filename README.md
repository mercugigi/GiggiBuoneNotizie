# 📰 News Daily - Sistema Automatico di Notizie

Sistema completo che si aggiorna automaticamente ogni giorno alle 6:00 AM con notizie VERE da fonti affidabili.

## ✨ Caratteristiche

- 🔄 **Aggiornamento automatico giornaliero** alle 6:00 AM
- 📱 **Design responsive** ottimizzato per mobile
- 🎨 **Grafica moderna** con gradiente viola-blu
- 📖 **Lettura 1:1** - una notizia alla volta in modale
- 🔍 **Ricerca avanzata** tra le notizie
- 🏷️ **6 categorie**: Tecnologia, Business, Scienza, Salute, Sport, Intrattenimento
- ✅ **Fonti verificate**: BBC, Reuters, Associated Press, The Guardian

## 🚀 Setup Completo

### 1. Crea Account NewsAPI

1. Vai su [newsapi.org](https://newsapi.org)
2. Clicca su "Get API Key"
3. Registrati gratuitamente (Free tier: 100 richieste/giorno)
4. Copia la tua API Key

### 2. Crea Repository GitHub

1. Vai su GitHub e crea un nuovo repository
2. Chiama il repository: `news-daily` (o come preferisci)
3. NON aggiungere README, .gitignore o license (li abbiamo già)

### 3. Carica i File su GitHub

Apri il terminale nella cartella del progetto e esegui:

```bash
git init
git add .
git commit -m "🚀 Initial commit - News Daily System"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/news-daily.git
git push -u origin main
```

### 4. Aggiungi Secret su GitHub

1. Vai nel tuo repository GitHub
2. Clicca su **Settings** → **Secrets and variables** → **Actions**
3. Clicca **New repository secret**
4. Nome: `NEWS_API_KEY`
5. Valore: Incolla la tua API Key di NewsAPI
6. Clicca **Add secret**

### 5. Deploy su Netlify

#### Metodo 1: Import da GitHub (Consigliato)

1. Vai su [netlify.com](https://netlify.com)
2. Clicca **Add new site** → **Import an existing project**
3. Scegli **GitHub** e autorizza Netlify
4. Seleziona il repository `news-daily`
5. Configurazione build:
   - **Build command**: lascia vuoto
   - **Publish directory**: `.` (punto)
6. Clicca **Deploy site**

#### Metodo 2: Deploy Manuale

1. Vai su [netlify.com](https://netlify.com)
2. Trascina la cartella del progetto nell'area di drop
3. Aspetta il deploy

### 6. Attiva GitHub Actions

1. Vai nel repository GitHub
2. Clicca sulla tab **Actions**
3. Se vedi un messaggio, clicca **I understand my workflows, go ahead and enable them**
4. Il workflow partirà automaticamente ogni giorno alle 6:00 AM

### 7. Test Manuale (Opzionale)

Per testare subito l'aggiornamento senza aspettare:

1. Vai su **Actions** nel repository
2. Clicca su **Update News Daily**
3. Clicca **Run workflow** → **Run workflow**
4. Aspetta che finisca (1-2 minuti)
5. Le notizie si aggiorneranno automaticamente su Netlify

## 📁 Struttura Progetto

```
news-system/
├── index.html              # Pagina principale
├── app.js                  # JavaScript frontend
├── fetch-news.js           # Script per recuperare notizie
├── news-data.json          # Dati notizie (generato automaticamente)
├── package.json            # Dipendenze Node.js
├── netlify.toml           # Configurazione Netlify
├── .github/
│   └── workflows/
│       └── update-news.yml # Automazione GitHub Actions
└── README.md              # Questa guida
```

## ⚙️ Come Funziona

1. **Ogni giorno alle 6:00 AM** (UTC):
   - GitHub Actions esegue `fetch-news.js`
   - Lo script chiama NewsAPI per ogni categoria
   - Recupera 5 articoli per categoria (30 totali)
   - Salva tutto in `news-data.json`
   - Fa commit e push automatico su GitHub

2. **Netlify rileva il cambiamento**:
   - Si attiva il deploy automatico
   - Il sito si aggiorna con le nuove notizie
   - Disponibile online in 1-2 minuti

3. **L'utente vede notizie fresche**:
   - Ogni giorno notizie del giorno corrente
   - Fonti verificate e affidabili
   - Aggiornamento completamente automatico

## 🔧 Personalizzazione

### Cambiare Orario Aggiornamento

Modifica `.github/workflows/update-news.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'  # 6:00 AM UTC
  # Esempi:
  # '0 8 * * *'   → 8:00 AM UTC
  # '30 12 * * *' → 12:30 PM UTC
  # '0 0 * * *'   → Mezzanotte UTC
```

### Cambiare Categorie

Modifica `fetch-news.js`:

```javascript
const categories = ['technology', 'business', 'science', 'health', 'sports', 'entertainment'];
// Aggiungi o rimuovi categorie a piacimento
```

### Cambiare Numero Articoli

Modifica `fetch-news.js`:

```javascript
const articlesPerCategory = 5; // Cambia questo numero
```

## 🌍 Fuso Orario

Il cron di GitHub Actions usa **UTC**. Per l'Italia (UTC+1/UTC+2):
- `0 5 * * *` = 6:00 AM Italia (ora solare)
- `0 4 * * *` = 6:00 AM Italia (ora legale)

## 🐛 Risoluzione Problemi

### Le notizie non si aggiornano

1. Controlla GitHub Actions:
   - Vai su **Actions** nel repository
   - Verifica che il workflow sia verde ✅
   - Se rosso ❌, leggi i log per errori

2. Verifica la API Key:
   - Controlla che `NEWS_API_KEY` sia nei Secrets
   - Verifica che la key sia valida su newsapi.org

3. Controlla il limite API:
   - Free tier: 100 richieste/giorno
   - Se superato, aspetta 24h o passa a piano paid

### Il sito non si aggiorna su Netlify

1. Controlla deploy:
   - Vai su Netlify Dashboard
   - Verifica lo stato del deploy
   - Controlla i log per errori

2. Force deploy:
   - Su Netlify: **Deploys** → **Trigger deploy** → **Deploy site**

## 📊 Monitoraggio

- **GitHub Actions**: Tab "Actions" nel repository
- **Netlify**: Dashboard → il tuo sito → "Deploys"
- **Notizie**: File `news-data.json` nel repository

## 🎨 Design Features

- ✅ Gradiente viola-blu di sfondo
- ✅ Card bianche eleganti con ombra
- ✅ Numeri grandi colorati su ogni card
- ✅ Emoji per ogni categoria
- ✅ Tag colorati
- ✅ Modale per lettura immersiva
- ✅ Design responsive mobile-first
- ✅ Footer con fonti verificate

## 📱 Supporto Mobile

- Ottimizzato per schermi piccoli
- Touch-friendly
- Modale a schermo intero su mobile
- Tabs scrollabili orizzontalmente

## 📝 Licenza

MIT License - Usa liberamente il codice!

## 🆘 Supporto

Se hai problemi:
1. Controlla questa guida
2. Verifica i log di GitHub Actions
3. Controlla i log di Netlify
4. Verifica che la API key sia corretta

---

**🎉 Il tuo sito è pronto! Ogni mattina alle 6:00 avrà notizie fresche automaticamente!**
