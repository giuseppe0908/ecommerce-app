import { requireAuthenticatedUser } from '../utils/auth-session'
import { createLogger } from '../utils/observability'
import { issueUserSession } from '../utils/session'

const logger = createLogger('auth-refresh-token')

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' })
  }

  try {
    const authUser = await requireAuthenticatedUser(event)
    const { token } = await issueUserSession(event, {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
    })

    return {
      success: true,
      token,
      user: {
        id: authUser.id,
        name: authUser.name,
        surname: authUser.surname,
        email: authUser.email,
        role: authUser.role,
        address: authUser.address,
        number: authUser.number,
      },
    }
  } catch (error: any) {
    if (error?.statusCode) {
      throw error
    }

    logger.error('Errore aggiornamento sessione', {
      requestId: event.context.requestId,
      error,
    })

    throw createError({
      statusCode: 500,
      message: 'Errore interno durante l\'aggiornamento sessione'
    })
  }
})
