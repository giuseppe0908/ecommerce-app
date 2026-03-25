import { defineEventHandler } from 'h3';
import { generateStateParam } from '../../utils/state';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.githubClientId || !config.githubCallbackUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfigured: Missing GitHub OAuth credentials',
    });
  }

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.append('client_id', config.githubClientId);
  authUrl.searchParams.append('redirect_uri', config.githubCallbackUrl);
  authUrl.searchParams.append('scope', 'user:email read:user');
  authUrl.searchParams.append('state', generateStateParam(event));
  authUrl.searchParams.append('allow_signup', 'false');

  return {
    url: authUrl.toString(),
  };
});
