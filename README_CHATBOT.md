# 🤖 AI ChatBot con Ollama - Guida Completa

## 📋 Panoramica

Questo chatbot AI è integrato nell'applicazione e-commerce e utilizza **Ollama** per fornire assistenza intelligente ai clienti. Il sistema è completamente locale e offre risposte contestuali basate sulla pagina corrente.

## 🚀 Caratteristiche Principali

### ✨ Interfaccia Utente
- **Design Moderno**: Interfaccia floating con animazioni fluide
- **Responsive**: Ottimizzato per desktop e mobile
- **Indicatori Visivi**: Typing indicators, contatori messaggi non letti
- **Suggerimenti Rapidi**: Quick actions per iniziare la conversazione

### 🧠 Intelligenza Artificiale
- **Modello**: Llama 3.2 (configurabile)
- **Contesto Consapevole**: Risposte basate sulla pagina corrente
- **Memoria Conversazione**: Mantiene il contesto durante la sessione
- **Risposte Personalizzate**: Specializzato per e-commerce sportivo

### 💾 Gestione Stato
- **Persistenza**: Messaggi salvati in localStorage
- **Analytics**: Statistiche conversazione e tempi di risposta
- **Export**: Possibilità di esportare cronologia chat
- **Sessioni**: Gestione sessioni multiple

## 🛠️ Installazione e Configurazione

### 1. Prerequisiti

```bash
# Installa Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Scarica il modello Llama 3.2
ollama pull llama3.2

# Verifica che Ollama sia in esecuzione
ollama serve
```

### 2. Configurazione Modello

Il chatbot è configurato per utilizzare `llama3.2` di default. Per cambiare modello:

```typescript
// server/api/chat/ollama.post.ts
body: {
  model: 'llama3.2', // Cambia qui il modello
  // Altri modelli disponibili: llama2, codellama, mistral, etc.
}
```

### 3. Personalizzazione Prompt

Modifica il prompt di sistema in `/server/api/chat/ollama.post.ts`:

```typescript
function buildSystemPrompt(context: any): string {
  let systemPrompt = `Sei un assistente AI per un e-commerce di abbigliamento sportivo.
  // Personalizza qui il comportamento del bot
  `
}
```

## 📁 Struttura File

```
├── components/
│   └── ChatBot.vue              # Componente principale UI
├── server/api/chat/
│   └── ollama.post.ts           # API endpoint Ollama
├── stores/
│   └── chatStore.js             # Store Pinia per gestione stato
└── layouts/
    └── default.vue              # Layout con chatbot integrato
```

## 🎯 Funzionalità Avanzate

### Contesto Consapevole
Il chatbot riconosce automaticamente:
- Pagina prodotto corrente
- Categoria navigata
- Stato dell'utente (logged in/out)
- Carrello e wishlist

### Comandi Speciali
- **Suggerimenti Prodotti**: "Mostrami prodotti simili"
- **Assistenza Ordini**: "Traccia il mio ordine"
- **Informazioni Spedizione**: "Costi di spedizione"
- **Taglie e Misure**: "Guida alle taglie"

### Analytics Integrate
```javascript
// Ottieni statistiche conversazione
const stats = chatStore.getChatStatistics()
console.log(stats)
// Output: { totalMessages, userMessages, botMessages, sessionDuration, ... }
```

## 🔧 Configurazioni Avanzate

### Parametri Ollama
```typescript
options: {
  temperature: 0.7,    // Creatività (0.0-1.0)
  top_p: 0.9,         // Diversità risposta
  max_tokens: 500     // Lunghezza massima risposta
}
```

### Impostazioni Chat Store
```javascript
chatSettings: {
  model: 'llama3.2',
  temperature: 0.7,
  maxTokens: 500,
  autoSave: true      // Salvataggio automatico
}
```

## 🎨 Personalizzazione UI

### Colori e Stili
```vue
<!-- Modifica in ChatBot.vue -->
<style scoped>
.chat-toggle-btn {
  @apply bg-gradient-to-r from-blue-500 to-purple-600;
  /* Personalizza colori qui */
}
</style>
```

### Animazioni
- `bounce`: Animazione bottone floating
- `slide-up`: Animazione apertura chat
- `pulse`: Indicatore nuovi messaggi

## 🚨 Troubleshooting

### Errori Comuni

1. **Ollama non disponibile**
   ```bash
   # Verifica che Ollama sia in esecuzione
   curl http://localhost:11434/api/tags
   ```

2. **Modello non trovato**
   ```bash
   # Scarica il modello necessario
   ollama pull llama3.2
   ```

3. **Errori CORS**
   ```typescript
   // Aggiungi headers CORS se necessario
   headers: {
     'Access-Control-Allow-Origin': '*'
   }
   ```

### Debug Mode
```javascript
// Abilita logging dettagliato
console.log('Chat Debug:', chatStore.getChatStatistics())
```

## 📊 Monitoraggio Performance

### Metriche Chiave
- Tempo medio di risposta
- Tasso di completamento conversazioni
- Messaggi per sessione
- Errori API

### Ottimizzazioni
- Cache risposte frequenti
- Lazy loading componenti
- Debounce input utente
- Cleanup sessioni vecchie

## 🔒 Sicurezza

### Best Practices
- Sanitizzazione input utente
- Rate limiting API calls
- Validazione prompt injection
- Logging sicuro (no dati sensibili)

### Configurazione Sicura
```typescript
// Limita lunghezza input
if (message.length > 1000) {
  throw createError({ statusCode: 400, statusMessage: 'Message too long' })
}
```

## 🚀 Deployment

### Produzione
1. Configura Ollama su server dedicato
2. Aggiorna endpoint API per produzione
3. Configura reverse proxy per Ollama
4. Monitora performance e logs

### Docker (Opzionale)
```dockerfile
# Dockerfile per Ollama
FROM ollama/ollama
RUN ollama pull llama3.2
EXPOSE 11434
```

## 📈 Roadmap Future

- [ ] Supporto multilingua
- [ ] Integrazione voice-to-text
- [ ] Analytics avanzate
- [ ] A/B testing risposte
- [ ] Integrazione CRM
- [ ] Chatbot training personalizzato

## 🤝 Contributi

Per contribuire al miglioramento del chatbot:
1. Fork del repository
2. Crea feature branch
3. Implementa miglioramenti
4. Testa con diversi modelli Ollama
5. Crea pull request

---

**Sviluppato con ❤️ per un'esperienza e-commerce intelligente**