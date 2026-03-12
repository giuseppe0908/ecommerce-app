// server/api/ip.ts
import { defineEventHandler, getRequestHeader } from 'h3'
import { createLogger } from '../../utils/observability'

const logger = createLogger('request-ip')

export default defineEventHandler((event) => {
  try {
    // Raccolta di tutti i possibili header/IP sources
    const ipSources = {
      cloudflare: getRequestHeader(event, 'cf-connecting-ip'),
      vercel: getRequestHeader(event, 'x-vercel-forwarded-for'),
      forwarded: getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim(),
      real: getRequestHeader(event, 'x-real-ip'),
      clientIp: getRequestHeader(event, 'x-client-ip'),
      socket: event.node.req.socket?.remoteAddress,
      connection: event.node.req.connection?.remoteAddress
    }

    // Priorità: Cloudflare → Vercel → X-Forwarded-For → X-Real-IP → Socket
    const clientIP = ipSources.cloudflare ||
                    ipSources.vercel ||
                    ipSources.forwarded ||
                    ipSources.real ||
                    ipSources.clientIp ||
                    ipSources.socket ||
                    ipSources.connection ||
                    'unknown'

    // Determinazione della fonte
    const source = ipSources.cloudflare ? 'cloudflare' :
                  ipSources.vercel ? 'vercel' :
                  ipSources.forwarded ? 'x-forwarded-for' :
                  ipSources.real ? 'x-real-ip' :
                  ipSources.clientIp ? 'x-client-ip' :
                  ipSources.socket ? 'socket' :
                  ipSources.connection ? 'connection' :
                  'fallback'

    logger.debug('IP rilevato', {
      requestId: event.context.requestId,
      source,
      clientIP,
    })

    return {
      data: {
        ip: clientIP,
        source,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error('Errore rilevamento IP', {
      requestId: event.context.requestId,
      error,
    })
    return {
      data: {
        ip: 'unknown',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }
    }
  }
})
