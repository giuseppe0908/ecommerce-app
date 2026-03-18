const LOCAL_DATABASE_PATTERN = /(?:127\.0\.0\.1|localhost)(?::\d+)?/i

export function shouldServePreviewEmptyCollectionFallback() {
  const rawDatabaseUrl = (process.env.DATABASE_URL || '').trim()
  const databaseUrl =
    (rawDatabaseUrl.startsWith('"') && rawDatabaseUrl.endsWith('"')) ||
    (rawDatabaseUrl.startsWith("'") && rawDatabaseUrl.endsWith("'"))
      ? rawDatabaseUrl.slice(1, -1)
      : rawDatabaseUrl
  return process.env.VERCEL_ENV === 'preview' && LOCAL_DATABASE_PATTERN.test(databaseUrl)
}
