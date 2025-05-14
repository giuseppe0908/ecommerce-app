import { defineEventHandler } from 'h3'
import { sendRedirect } from 'h3'
import { generateStateParam } from '~/server/utils/state'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Verifica la configurazione
  if (!config.githubClientId || !config.githubCallbackUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfigured: Missing GitHub OAuth credentials'
    })
  }

  // Costruisci l'URL di autorizzazione GitHub
  const authUrl = new URL('https://github.com/login/oauth/authorize')
  
  // Aggiungi parametri obbligatori
  authUrl.searchParams.append('client_id', config.githubClientId)
  authUrl.searchParams.append('redirect_uri', config.githubCallbackUrl)
  authUrl.searchParams.append('scope', 'user:email read:user')
  
  // Parametri di sicurezza
  authUrl.searchParams.append('state', generateStateParam())
  authUrl.searchParams.append('allow_signup', 'false')

  // Restituisci l'URL invece di fare il redirect
  return {
    url: authUrl.toString()
  }
})

