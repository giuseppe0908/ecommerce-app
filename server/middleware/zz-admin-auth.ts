import { requireAuthenticatedUser } from '../utils/auth-session';

export default defineEventHandler(async (event) => {
  const rawUrl = event.node.req.url || '/';
  const path = rawUrl.split('?')[0] || '/';

  if (!path.startsWith('/api/admin/')) {
    return;
  }
  await requireAuthenticatedUser(event, { requiredRole: 'ADMIN' });
});
