# Vercel Preview Runtime

## Goal

Preview deployments must be stable enough to validate SSR, protected routes, checkout draft
validation, and optional features such as AI chat without behaving as a production rollout.

## Runtime assumptions

- Framework: Nuxt 3 + Nitro
- Deploy target: Vercel serverless Node runtime via the default Nuxt/Nitro preset
- ORM: Prisma
- Remote database: Neon PostgreSQL over SSL
- Optional AI chat: disabled in preview unless an explicit backend is configured

## Preview environment variables

### Required for the validated preview baseline in this task

- `JWT_SECRET`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `STRIPE_PUBLISHABLE_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `AI_CHAT_ENABLED`

### Strongly recommended for stable preview URLs

- `APP_BASE_URL`
- `BASE_URL`
- `GITHUB_CALLBACK_URL`
- `APP_SITE_NAME`
- `AI_CHAT_PROVIDER`
- `AI_CHAT_BASE_URL`
- `AI_CHAT_MODEL`
- `AI_CHAT_TIMEOUT_MS`

### Additional envs to validate provider-backed preview flows

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

If `APP_BASE_URL` and `BASE_URL` are omitted, the runtime falls back to Vercel system variables
(`VERCEL_BRANCH_URL` / `VERCEL_URL`) when available.

## Recommended preview values

### Preview with remote database

- `DATABASE_URL=postgresql://...?...sslmode=require`
- `DIRECT_DATABASE_URL=postgresql://...?...sslmode=require`
- `AI_CHAT_ENABLED=false`

This is the preferred path for meaningful auth, catalog, admin and checkout verification.

### Preview with temporary local placeholder database URL

If preview is deployed before a real remote DB is available and `DATABASE_URL` still points to
`localhost` / `127.0.0.1`, selected public read endpoints fall back to empty collections instead of
breaking SSR pages:

- `/api/categories`
- `/api/brands`
- `/api/genders`
- `/api/products/newArrivals`

This fallback is preview-only and must not be treated as database validation.

### Preview without remote AI backend

- `AI_CHAT_ENABLED=false`

The chatbot stays disabled and `/api/chat/status` reports `enabled: false`.

### Preview without GitHub OAuth

If GitHub OAuth is not configured for preview callback domains, keep preview credentials as
placeholders and do not treat that flow as validated in preview.

## Preview vs production

- Preview may intentionally keep optional integrations disabled.
- Preview may run with empty catalog collections if no real remote DB is configured yet.
- Production must use a real remote PostgreSQL database and production provider credentials.
- Production should validate Stripe webhooks, email delivery, and OAuth callbacks against real
  provider configuration.
