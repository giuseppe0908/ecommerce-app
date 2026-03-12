# Database Runtime Strategy

## Chosen strategy

- ORM: Prisma
- Primary database: MySQL
- Preview/production pooling: Prisma Accelerate
- Local development: direct MySQL connection

## Why this strategy

On Vercel, serverless concurrency can open too many direct MySQL connections even when the
application uses a shared Prisma singleton per runtime instance. Prisma Accelerate adds a pooled
`prisma://` endpoint that is designed for serverless fan-out while preserving the existing Prisma
client and schema.

This keeps the current architecture intact:

- no ORM rewrite
- no repository-layer rewrite
- no provider switch required

## Environment split

### Local

- `DATABASE_URL=mysql://...`
- `DIRECT_DATABASE_URL=mysql://...`

Both variables point to the same local MySQL instance.

### Vercel Preview

- `DATABASE_URL=prisma://...`
- `DIRECT_DATABASE_URL=mysql://...`

Preview uses the pooled Accelerate URL at runtime and the direct MySQL URL for
`prisma generate` / `prisma migrate deploy`.

### Vercel Production

- `DATABASE_URL=prisma://...`
- `DIRECT_DATABASE_URL=mysql://...`

Same pattern as preview, with isolated production credentials.

## Connection management

- `server/utils/prisma.ts` creates one Prisma client per runtime instance.
- In local development the client uses direct MySQL access.
- When `DATABASE_URL` starts with `prisma://`, the client is extended with
  `@prisma/extension-accelerate`.
- Prisma CLI and migrations use `DIRECT_DATABASE_URL` via `directUrl` in the Prisma datasource.

## Operational notes

- Run `npm run db:generate` after dependency or schema changes.
- Run `npm run db:migrate:deploy` in preview/production environments against the direct database URL.
- Keep preview and production databases separated.
