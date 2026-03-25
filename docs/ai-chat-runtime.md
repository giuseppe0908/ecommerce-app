# AI Chat Runtime

## Goal

The AI chat is optional. It must never block build, preview deploy, or production runtime when no
AI backend is configured.

## Configuration

- `AI_CHAT_ENABLED`
- `AI_CHAT_PROVIDER`
- `AI_CHAT_BASE_URL`
- `AI_CHAT_MODEL`
- `AI_CHAT_TIMEOUT_MS`

Only `ollama` is supported today.

## Environment behavior

### Local with Ollama active

Set:

```bash
AI_CHAT_ENABLED=true
AI_CHAT_PROVIDER=ollama
AI_CHAT_BASE_URL=http://127.0.0.1:11434
AI_CHAT_MODEL=llama3.2:1b
AI_CHAT_TIMEOUT_MS=3000
```

Result:

- the layout checks `/api/chat/status`
- the chatbot is shown only if the backend responds and exposes at least one model
- chat requests are proxied through server routes, never directly from the browser to Ollama

### Local without Ollama

If `AI_CHAT_ENABLED=false`:

- no backend probe is executed
- the chatbot is hidden
- build, tests and smoke remain green

If `AI_CHAT_ENABLED=true` but Ollama is down:

- `/api/chat/status` returns `available: false`
- the chatbot stays hidden
- direct calls to `/api/chat/ollama` fail with a safe `503`

### Preview / Production without AI backend

Set:

```bash
AI_CHAT_ENABLED=false
```

Result:

- preview and production do not depend on `localhost`
- the chatbot is disabled cleanly
- no client-side hardcoded call targets a local AI process

## Runtime strategy

- client-side availability check goes through `/api/chat/status`
- server-side chat routes read runtime config and use the configured backend URL
- unavailable or disabled AI returns a safe `503` without leaking backend details
