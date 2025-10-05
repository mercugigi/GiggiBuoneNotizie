# 🚀 GUIDA RAPIDA - 5 MINUTI

## Passo 1: Ottieni API Key (2 minuti)

1. Vai su **newsapi.org**
2. Clicca **"Get API Key"**
3. Registrati gratis
4. **Copia la tua API Key** (es: `abc123def456...`)

---

## Passo 2: Crea Repository GitHub (1 minuto)

1. Vai su **github.com**
2. Clicca **"New repository"**
3. Nome: `news-daily`
4. Clicca **"Create repository"**

---

## Passo 3: Carica File (1 minuto)

Apri terminale nella cartella e esegui:

```bash
git init
git add .
git commit -m "🚀 Initial commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/news-daily.git
git push -u origin main
```

---

## Passo 4: Aggiungi Secret GitHub (30 secondi)

1. Nel repository GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Clicca **"New repository secret"**
3. Nome: `NEWS_API_KEY`
4. Valore: *incolla la tua API key*
5. Clicca **"Add secret"**

---

## Passo 5: Deploy su Netlify (30 secondi)

### Opzione A: Import da GitHub
1. Vai su **netlify.com**
2. **Add new site** → **Import from GitHub**
3. Seleziona il repository `news-daily`
4. Clicca **"Deploy site"**

### Opzione B: Drag & Drop
1. Vai su **netlify.com**
2. Trascina la cartella del progetto
3. Aspetta il deploy

---

## ✅ FATTO!

Il tuo sito è online e si aggiornerà **automaticamente ogni giorno alle 6:00 AM** con notizie VERE!

### 🔗 Prossimi Step

1. **Trova il tuo URL** su Netlify (es: `https://nome-sito.netlify.app`)
2. **Personalizza il nome** su Netlify → Site settings → Change site name
3. **Testa subito**: GitHub → Actions → Run workflow

---

## 📱 Condividi il tuo sito!

Il link funziona perfettamente su:
- 📱 Smartphone
- 💻 Computer
- 📊 Tablet

---

## 🆘 Problemi?

### Le notizie non si vedono?
→ GitHub Actions → Verifica che il workflow sia verde ✅

### Il sito non si aggiorna?
→ Controlla che `NEWS_API_KEY` sia nei Secrets di GitHub

### Errore API?
→ Verifica la tua key su newsapi.org

---

**🎉 Congratulazioni! Hai creato un sito di notizie che si aggiorna da solo per sempre!**
