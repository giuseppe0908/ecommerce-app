# Quality Gates

## Chosen tooling

- Linting: ESLint flat config
- Typecheck: `nuxi prepare && vue-tsc --noEmit -p tsconfig.typecheck.json`
- Tests: `npm test`
- Build validation: `npm run build`

## Why this setup

- ESLint gives a repeatable JavaScript and TypeScript baseline without forcing a large style refactor.
- `vue-tsc` runs against a Nuxt-generated project config so it still understands auto-imports,
  `.vue` files, server routes and generated Nuxt types, while keeping the scope explicit.
- Tests and build remain part of the gate so runtime regressions are caught before preview deploys.

## Scope

- Lint covers runtime-critical JavaScript and TypeScript files.
- Typecheck covers the Nuxt application, including frontend and server code.
- `tsconfig.typecheck.json` is the dedicated project used by the gate.
- Typecheck explicitly excludes:
  - `tests/**/*` because runtime behavior is already validated by `npm test`
  - `prisma/seeder.ts` because it is a local data bootstrap script, not preview runtime code
  - `stores/items.ts` because it is a legacy Vuex store no longer used by the active app
  - `server/api/chat/**/*` because the optional AI chat runtime is smoke-validated separately and
    must not become a hard dependency of preview deploys
- CI uses placeholder environment variables so the gates do not depend on live Stripe, GitHub,
  email or a remote database provider.

## Local execution

Run the gates individually:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run the full sequence:

```bash
npm run quality
```

## Notes

- If `nuxi typecheck` or `nuxt build` complain about missing environment variables, export the
  same placeholders used in CI.
- The CI workflow only validates install, lint, typecheck, test and build. It does not require
  real provider credentials or a production database.
