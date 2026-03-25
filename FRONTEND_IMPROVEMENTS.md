# FRONTEND_IMPROVEMENTS

Data audit: 2026-02-21
Scope: `pages/`, `components/`, `stores/`, `composables/`, `middleware/`, `plugins/`, `layouts/`
Obiettivo: portare il frontend a standard senior (stabile SSR, manutenibile, testabile, performante).

## 1) Executive Summary

Il frontend e funzionale ma ha debito tecnico alto in queste aree:
- Architettura catalogo duplicata (`/product`, `/products`, `/catalog`, `/product/gender/[gender]`).
- Incoerenze SSR/client (`localStorage` e DOM access in punti non protetti).
- Stato e API layer non uniformi (mix di `fetch`, `useFetch`, store con logica mista).
- Error handling e UX non omogenei (alert, log rumorosi, fallback incompleti).
- Alcuni componenti usano dati mock o hardcoded in produzione.
- Mancano quality gate FE (lint/typecheck/unit/component/e2e) orientati ai flussi critici.

## 2) Priorita P0 (alto impatto, esecuzione immediata)

| Priorita | File | Modificare | Aggiungere |
|---|---|---|---|
| P0 | `pages/order.vue` | Rimuovere accesso top-level a `localStorage`; allineare payload ordine allo schema backend; eliminare reset stato incoerente (`fullName` vs `name`/`surname`) | `composables/useCheckoutDraft.ts` per bootstrap client-safe + validazione form |
| P0 | `middleware/auth.ts` | Limitare redirect solo a route protette; rimuovere `console.log`; evitare blocco pagine pubbliche | Config centralizzata route policy (`utils/route-access.ts`) |
| P0 | `plugins/vue-toastification.js` | Convertire in plugin client-only per evitare issue SSR CJS | `plugins/vue-toastification.client.ts` + `composables/useAppToast.ts` |
| P0 | `components/Card.vue` | Usare `props.img` al posto URL hardcoded immagine; ridurre side effects in card click | Placeholder image fallback centralizzato (`utils/image.ts`) |
| P0 | `components/SearchBar.vue` | Rimuovere log debug; importare `computed`; uniformare query brand route | Debounce composable riusabile (`composables/useDebouncedRef.ts`) |
| P0 | `components/Jumbo.vue` | Rimuovere listener `resize` anonimo non cleanup; correggere link `gender=/uomo` | Uso diretto di `useResponsiveButton` per evitare duplicazione |
| P0 | `components/Brand.vue` | Cleanup listener resize e riduzione logica responsive duplicata | Reuse `useResponsiveButton` + mapping brand da API |
| P0 | `components/NewArrivals.vue` | Cleanup listener resize; verificare query `NewArrivals` vs `newArrivals` | Naming query constants condivise (`constants/catalog.ts`) |
| P0 | `components/CardCategory.vue` | Eliminare doppio listener resize e anonimous callback non removibile | Hook responsive unico per width/height |
| P0 | `components/ReviewComponent.vue` | Sostituire mock data con endpoint reale review; gestire loading/error reali | DTO FE review (`types/review.ts`) e sanitizzazione input |
| P0 | `pages/authcallback.vue` | Evitare scritture duplicate manuali su storage; delegare tutto ad `authStore` | `authStore.completeOAuthLogin(token)` con un solo path di init |
| P0 | `pages/register.vue` | Validazione client formale + gestione errori backend coerente | Schema Zod FE (`schemas/register.ts`) |

## 3) Priorita P1 (rifattorizzazione strutturale)

| Priorita | Area | Modificare | Aggiungere |
|---|---|---|---|
| P1 | Catalog architecture | Consolidare flussi oggi duplicati in un unico shell catalogo (filtri, sort, paging, search) | `pages/catalog/index.vue` unico entry + redirect da route legacy |
| P1 | Catalog state/query sync | Estrarre logica URL<->state da `pages/product/index.vue` e `pages/product/gender/[gender].vue` | `composables/useCatalogQuery.ts`, `composables/useCatalogFilters.ts`, `composables/useCatalogFetch.ts` |
| P1 | Component decomposition | Ridurre peso di `pages/product/index.vue` e `components/Product/SingleProduct.vue` | `components/Catalog/CatalogHeader.vue`, `CatalogFilters.vue`, `CatalogGrid.vue`, `CatalogEmptyState.vue` |
| P1 | API client layer | Uniformare chiamate `fetch/useFetch/$fetch` in un solo client typed con error mapper | `composables/useApiClient.ts`, `utils/api-error.ts`, `types/api.ts` |
| P1 | Store hardening | Ridurre responsabilita miste in `wishlistStore`, `searchStore`, `productStore` | Store per dominio con adapter API + normalizzazione |
| P1 | Session/state hygiene | Evitare accessi diretti a storage in componenti vari | `composables/useClientStorage.ts` e chiavi in `constants/storage.ts` |
| P1 | UI consistency | Unificare stati loading/empty/error e copy | `components/App/AppEmptyState.vue`, `AppErrorState.vue`, `AppLoader.vue` |
| P1 | Accessibility | Migliorare focus, aria-live, tastiera su modali/menu/filter chips | Checklist a11y + utility focus trap |

## 4) Priorita P2 (qualita continua e performance)

| Priorita | Area | Modificare | Aggiungere |
|---|---|---|---|
| P2 | Design system | Ridurre hardcoded colori/spazi/font | `assets/styles/tokens.css`, naming BEM/Tailwind strategy |
| P2 | Performance | Lazy hydration e ottimizzazione immagini/card list | `NuxtImg` migration plan + budget LCP/CLS |
| P2 | Test strategy | Copertura FE assente su flussi critici | `tests/components/*.test.ts`, `tests/e2e/checkout-auth.e2e.test.ts` |
| P2 | Observability FE | Tracciare errori runtime e UX drop-off | FE logger wrapper + event tracking minimo |
| P2 | i18n/readability | Uniformare testi e naming route/query | Dizionario copy centralizzato |

## 5) Route da consolidare (riduzione duplicazioni)

Route attuali da razionalizzare:
- `pages/product/index.vue`
- `pages/products.vue`
- `pages/catalog.vue`
- `pages/product/gender/[gender].vue`

Target:
- Tenere un solo catalogo principale.
- Lasciare le route legacy come redirect 301/302 con mapping query.
- Condividere un solo modello filtri/paginazione/ordinamento.

## 6) Codice da ripulire subito

- Rimuovere `console.*` da componenti e store in produzione (tenere solo logger standardizzato).
- Rimuovere dati mock in componenti runtime (`ReviewComponent`).
- Rimuovere hardcoded URL immagini in card prodotto.
- Eliminare listener `resize` anonimi con cleanup sicuro.
- Uniformare naming query params (`newArrivals`, `brand`, `gender`, `priceMin`, `priceMax`).

## 7) Nuovi file consigliati (base minima)

- `composables/useApiClient.ts`
- `composables/useClientStorage.ts`
- `composables/useCatalogQuery.ts`
- `composables/useCatalogFilters.ts`
- `composables/useCatalogFetch.ts`
- `composables/useAppToast.ts`
- `plugins/vue-toastification.client.ts`
- `types/product.ts`
- `types/review.ts`
- `types/api.ts`
- `schemas/register.ts`
- `schemas/checkout.ts`
- `utils/api-error.ts`
- `utils/route-access.ts`
- `constants/catalog.ts`
- `constants/storage.ts`
- `components/App/AppLoader.vue`
- `components/App/AppEmptyState.vue`
- `components/App/AppErrorState.vue`

## 8) Sequenza implementativa consigliata

1. Chiudere P0 SSR/auth/card/search/review/order.
2. Consolidare catalogo in un solo flusso (P1).
3. Introdurre API client typed + storage abstraction (P1).
4. Attivare test FE minimi su login/catalog/checkout (P2 iniziale).
5. Iterare su design system e performance budget (P2 avanzato).

## 9) Definition of Done FE

- Nessun uso non protetto di `window/document/localStorage` in SSR path.
- Zero `console.*` runtime FE non controllati.
- Un solo entry point catalogo + route legacy coperte da redirect.
- Componenti critici con stati `loading/empty/error` consistenti.
- Flussi `login -> catalog -> cart -> order` coperti da test smoke FE.
