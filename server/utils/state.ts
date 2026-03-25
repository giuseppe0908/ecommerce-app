import type { H3Event } from 'h3';
import { deleteCookie, getCookie, setCookie } from 'h3';
import crypto from 'crypto';

const stateStore = new Map<string, NodeJS.Timeout>();
const OAUTH_STATE_COOKIE_NAME = 'oauth_state';
const STATE_EXPIRATION_MS = 5 * 60 * 1000;
const STATE_EXPIRATION_SECONDS = Math.floor(STATE_EXPIRATION_MS / 1000);

function setLegacyState(state: string) {
  const timeout = setTimeout(() => {
    stateStore.delete(state);
  }, STATE_EXPIRATION_MS);

  stateStore.set(state, timeout);
}

function consumeLegacyState(state: string): boolean {
  if (!stateStore.has(state)) {
    return false;
  }

  clearTimeout(stateStore.get(state)!);
  stateStore.delete(state);
  return true;
}

export function generateStateParam(event?: H3Event): string {
  const state = crypto.randomBytes(16).toString('hex');

  if (!event) {
    setLegacyState(state);
    return state;
  }

  setCookie(event, OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: STATE_EXPIRATION_SECONDS,
    expires: new Date(Date.now() + STATE_EXPIRATION_MS),
  });

  return state;
}

export function verifyStateParam(state: string, event?: H3Event): boolean {
  if (event) {
    const storedState = getCookie(event, OAUTH_STATE_COOKIE_NAME);
    deleteCookie(event, OAUTH_STATE_COOKIE_NAME, {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    if (storedState && storedState === state) {
      return true;
    }
  }

  return consumeLegacyState(state);
}
