import { requireAuthenticatedUser } from '../../utils/auth-session';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'GET') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const user = await requireAuthenticatedUser(event);
  return {
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      address: user.address,
      number: user.number,
    },
  };
});
