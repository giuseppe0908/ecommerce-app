import { defineEventHandler, getQuery, createError, sendRedirect } from 'h3'
import { ofetch } from 'ofetch'
import { PrismaClient } from '@prisma/client';
import { verifyStateParam } from '~/server/utils/state'
import jwt from 'jsonwebtoken';


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { code, state } = getQuery(event)
  if (!code) {
    await sendRedirect(event, '/login?error=missing_code', 302)
    return
  }
  // Verifica lo state (anti-CSRF)
  if (!state || !verifyStateParam(state.toString())) {
    throw createError({ statusCode: 401, message: 'Invalid state parameter' })
  }
  const prisma = new PrismaClient();
  const JWT_SECRET = config.jwtSecret;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET non configurato');
  }
  // 1. Scambio code con access token
  const tokenResponse = await ofetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: {
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    },
    headers: {
      Accept: 'application/json',
    },
  })

  // 2. Ottieni i dati dell'utente
  const userResponse = await ofetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
      'User-Agent': 'ecommerce'
    },
  })

  if (!userResponse.id) {
    throw new Error('Dati utente non ricevuti da GitHub')
  }

  const emailResponse = await ofetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
      'User-Agent': 'ecommerce'
    },
  })


  if (!emailResponse || !Array.isArray(emailResponse)) {
    throw new Error('Dati email non ricevuti da GitHub')
  }


  const primaryEmail = emailResponse.find((email: any) => email.primary && email.verified)?.email

  if (!primaryEmail) {
    throw new Error('Nessuna email principale verificata trovata')
  }

  // 3. Crea o aggiorna l'utente nel database
  
  let user = await prisma.user.findUnique({
    where: { githubId: userResponse.id.toString() },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        githubId: userResponse.id.toString(),
        email: primaryEmail|| `${userResponse.id}@github.local`, // Email fittizia
        name: userResponse.login || 'Utente GitHub',
      }
    })
  }

  // 4. Crea JWT
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 ore in millisecondi
  // Genera il token JWT con payload minimale per ridurre la dimensione
  const token = jwt.sign(
    { 
      sub: user.id.toString(),
      email: user.email,
      role: user.role || 'USER',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    },
    JWT_SECRET
  );  

  try {
    // Trova se esiste già un token per questo utente
    const existingToken = await prisma.token.findFirst({
      where: { userId: user.id },
    });

    if (existingToken) {
      // Se esiste, aggiorna il record del token
      await prisma.token.update({
        where: { id: existingToken.id },
        data: {
          token,
          expiresAt: new Date(Date.now() + ONE_DAY),
        },
      });
    } else {
      // Se non esiste, crea un nuovo record per il token
      await prisma.token.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + ONE_DAY),
        },
      });
    }
  } catch (error) {
    //console.error('Errore nel salvataggio del token:', error);
    console.error('GitHub Auth Error:', error)
    await sendRedirect(event, '/login?error=github_auth_failed', 302)
  }
  // 5. Reindirizza alla pagina frontend con il token
  //await sendRedirect(event, `/auth-callback?token=${token}`, 302)
  return sendRedirect(event, `/authcallback?token=${token}`, 302)
})
