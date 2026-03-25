import type { Prisma } from '@prisma/client';
import { defineEventHandler, getQuery, sendRedirect } from 'h3';
import { ofetch } from 'ofetch';
import { verifyStateParam } from '../../../utils/state';
import { createLogger } from '../../../utils/observability';
import prisma from '../../../utils/prisma';
import { issueUserSession } from '../../../utils/session';

const logger = createLogger('auth-github-callback');

type GitHubUserResponse = {
  id: number | string;
  login?: string | null;
  name?: string | null;
};

type GitHubEmailResponse = {
  email?: string | null;
  primary?: boolean;
  verified?: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getGitHubDisplayName(user: GitHubUserResponse) {
  return String(user.name || user.login || 'Utente GitHub').trim();
}

function getPrimaryVerifiedEmail(emailResponse: GitHubEmailResponse[]) {
  const primaryVerifiedEmail = emailResponse.find((email) => email.primary && email.verified)?.email;
  if (!primaryVerifiedEmail) {
    return null;
  }

  return normalizeEmail(primaryVerifiedEmail);
}

async function findOrCreateGitHubUser(params: {
  githubId: string;
  email: string;
  displayName: string;
}) {
  const existingGitHubUser = await prisma.user.findUnique({
    where: { githubId: params.githubId },
  });

  if (existingGitHubUser) {
    const conflictingEmailUser =
      existingGitHubUser.email === params.email
        ? null
        : await prisma.user.findUnique({
            where: { email: params.email },
          });

    if (conflictingEmailUser && conflictingEmailUser.id !== existingGitHubUser.id) {
      return { user: null, error: 'github_email_conflict' as const };
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingGitHubUser.id },
      data: {
        email: params.email,
        name: existingGitHubUser.name || params.displayName,
      },
    });

    return { user: updatedUser, error: null };
  }

  const linkedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existingEmailUser = await tx.user.findUnique({
      where: { email: params.email },
    });

    if (existingEmailUser) {
      if (existingEmailUser.githubId && existingEmailUser.githubId !== params.githubId) {
        return { user: null, error: 'github_email_conflict' as const };
      }

      const updatedUser = await tx.user.update({
        where: { id: existingEmailUser.id },
        data: {
          githubId: params.githubId,
          name: existingEmailUser.name || params.displayName,
        },
      });

      return { user: updatedUser, error: null };
    }

    const createdUser = await tx.user.create({
      data: {
        githubId: params.githubId,
        email: params.email,
        name: params.displayName,
      },
    });

    return { user: createdUser, error: null };
  });

  return linkedUser;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { code, state } = getQuery(event);

  if (!code) {
    return sendRedirect(event, '/login?error=missing_code', 302);
  }

  if (!state || !verifyStateParam(String(state), event)) {
    return sendRedirect(event, '/login?error=invalid_state', 302);
  }

  try {
    const tokenResponse = await ofetch<{ access_token?: string }>(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        body: {
          client_id: config.githubClientId,
          client_secret: config.githubClientSecret,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!tokenResponse?.access_token) {
      throw new Error('Access token GitHub non ricevuto');
    }

    const authHeaders = {
      Authorization: `Bearer ${tokenResponse.access_token}`,
      'User-Agent': 'ecommerce',
    };

    const userResponse = await ofetch<GitHubUserResponse>('https://api.github.com/user', {
      headers: authHeaders,
    });
    const emailResponse = await ofetch<GitHubEmailResponse[]>('https://api.github.com/user/emails', {
      headers: authHeaders,
    });

    const githubId = String(userResponse?.id || '').trim();
    const primaryEmail = Array.isArray(emailResponse)
      ? getPrimaryVerifiedEmail(emailResponse)
      : null;

    if (!githubId || !primaryEmail) {
      return sendRedirect(event, '/login?error=github_email_required', 302);
    }

    const lookupResult = await findOrCreateGitHubUser({
      githubId,
      email: primaryEmail,
      displayName: getGitHubDisplayName(userResponse),
    });

    if (!lookupResult.user) {
      logger.warn('Collisione GitHub su email esistente', {
        requestId: event.context.requestId,
        githubId,
        email: primaryEmail,
      });
      return sendRedirect(event, '/login?error=github_email_conflict', 302);
    }

    await issueUserSession(event, {
      id: lookupResult.user.id,
      email: lookupResult.user.email,
      role: lookupResult.user.role || 'USER',
    });

    return sendRedirect(event, '/authcallback', 302);
  } catch (error) {
    logger.error('GitHub auth error', {
      requestId: event.context.requestId,
      error,
    });
    return sendRedirect(event, '/login?error=github_auth_failed', 302);
  }
});
