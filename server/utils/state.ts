import { defineEventHandler } from 'h3'
import { sendRedirect } from 'h3'
import crypto from 'crypto'

const stateStore = new Map<string, NodeJS.Timeout>()
const STATE_EXPIRATION_MS = 5 * 60 * 1000 // 5 minuti

export function generateStateParam(): string {
  const state = crypto.randomBytes(16).toString('hex')

  // Salva il parametro state con scadenza
  const timeout = setTimeout(() => {
    stateStore.delete(state) // Rimuovi il parametro dopo la scadenza
  }, STATE_EXPIRATION_MS)

  stateStore.set(state, timeout)
  return state
}

export function verifyStateParam(state: string): boolean {
  if (stateStore.has(state)) {
    clearTimeout(stateStore.get(state)!) // Cancella il timeout
    stateStore.delete(state) // Rimuovi il parametro dopo la verifica
    return true
  }
  return false
}