import { createHash, randomBytes } from 'node:crypto';

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(String(token || '').trim()).digest('hex');
}

export function getTokenLookupCandidates(token: string): string[] {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) return [];

  const hashedToken = hashOpaqueToken(normalizedToken);
  return hashedToken === normalizedToken ? [normalizedToken] : [normalizedToken, hashedToken];
}

export function createOpaqueToken(byteLength = 32) {
  const token = randomBytes(byteLength).toString('hex');

  return {
    token,
    tokenHash: hashOpaqueToken(token),
  };
}
