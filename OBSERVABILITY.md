# Observability Strategy

## Obiettivi
- Rendere i log machine-readable e filtrabili per livello.
- Tracciare metriche API minime senza dipendenze esterne.
- Collegare ogni richiesta a un `requestId` per diagnosi veloce.

## Implementazione attuale
- Logger strutturato centralizzato: `server/utils/observability.ts`
- Middleware globale request tracing + metriche API: `server/middleware/observability.ts`
- Endpoint admin metriche runtime: `GET /api/admin/observability`

## Logging
- Formato log: JSON line con `timestamp`, `level`, `scope`, `message`, `context`.
- Livelli supportati: `debug`, `info`, `warn`, `error`.
- Configurazione livello:
  - `LOG_LEVEL=debug|info|warn|error`
  - default: `info`
- Sanitizzazione automatica:
  - redazione chiavi sensibili (`password`, `token`, `authorization`, `cookie`, `secret`, ecc.)
  - masking email in output
  - truncation payload troppo lunghi

## Metriche API
- Metriche aggregate in-memory per processo (non persistenti, non condivise multi-instance).
- Dati disponibili:
  - totali richieste/errori/latenza media
  - dettaglio per route normalizzata (`/api/products/:id`)
  - top route lente
  - top route per volume

## Endpoint metriche
- `GET /api/admin/observability`
- Accesso: solo `ADMIN` con token Bearer valido e sessione attiva.
- Risposta: snapshot completo metriche runtime.

## Limiti attuali
- Metriche in-memory: reset a ogni restart deploy.
- Assenza di exporter esterno (Prometheus/OpenTelemetry).
- Copertura logger ancora parziale su endpoint legacy con `console.*`.

## Prossimi passi consigliati
- Migrare progressivamente i `console.*` rimanenti su logger centralizzato.
- Aggiungere exporter metriche (Prometheus/OpenTelemetry collector).
- Introdurre alerting su error rate/latency SLA.
