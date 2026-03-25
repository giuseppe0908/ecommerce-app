# Database Runtime Strategy

## Chosen strategy

- ORM: Prisma
- Primary database: PostgreSQL
- Hosted database: Neon
- Local development: direct PostgreSQL connection

## Why this strategy

On Vercel, the application can run directly against Neon over SSL using a standard
`postgresql://` connection string. If the project later adopts Prisma Accelerate, the runtime
already supports `prisma://` URLs as an optional pooled layer.

This keeps the current architecture intact:

- no ORM rewrite
- no repository-layer rewrite
- provider aligned with Neon/Postgres

## Environment split

### Local

- `DATABASE_URL=postgresql://...`
- `DIRECT_DATABASE_URL=postgresql://...`

Both variables point to the same local PostgreSQL instance.

### Vercel Preview

- `DATABASE_URL=postgresql://...`
- `DIRECT_DATABASE_URL=postgresql://...`

Preview uses the Neon URL with `sslmode=require` at runtime and for
`prisma generate` / `prisma migrate deploy`.

### Vercel Production

- `DATABASE_URL=postgresql://...`
- `DIRECT_DATABASE_URL=postgresql://...`

Same pattern as preview, with isolated production credentials.

## Connection management

- `server/utils/prisma.ts` creates one Prisma client per runtime instance.
- In local development the client uses direct PostgreSQL access.
- When `DATABASE_URL` starts with `prisma://`, the client is extended with
  `@prisma/extension-accelerate`.
- Prisma CLI and migrations use `DIRECT_DATABASE_URL` via `directUrl` in the Prisma datasource.

## Operational notes

- Run `npm run db:generate` after dependency or schema changes.
- Run `npm run db:migrate:deploy` in preview/production environments against the direct Neon URL.
- Keep preview and production databases separated.
