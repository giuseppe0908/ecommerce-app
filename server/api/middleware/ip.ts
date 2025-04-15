// server/api/ip.ts
import { defineEventHandler, getRequestHeader } from 'h3'

export default defineEventHandler((event) => {
  try {
    // Debug headers
    const headers = event.node.req.headers
    console.log('[Debug] Request headers:', headers)

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

    console.log('[Debug] IP Sources:', ipSources)

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

    console.log('[Debug] Final IP:', { ip: clientIP, source })

    return {
      data: {
        ip: clientIP,
        source,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    }
  } catch (error) {
    console.error('[Error] IP Detection:', error)
    return {
      data: {
        ip: 'unknown',
        error: error.message,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }
  }
})