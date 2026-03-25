import { createLogger, getRequestIdFromHeader, recordApiMetric } from '../utils/observability';

const logger = createLogger('http');

export default defineEventHandler((event) => {
  const req = event.node.req;
  const res = event.node.res;
  const method = String(req.method || 'GET').toUpperCase();
  const rawUrl = req.url || '/';
  const path = rawUrl.split('?')[0] || '/';
  const requestId = getRequestIdFromHeader(req.headers['x-request-id']);
  const startedAt = Date.now();

  event.context.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  let completed = false;
  const complete = () => {
    if (completed) return;
    completed = true;

    const durationMs = Date.now() - startedAt;
    const statusCode = Number.isInteger(res.statusCode) ? res.statusCode : 200;
    const isApiRequest = path.startsWith('/api/');

    if (isApiRequest) {
      recordApiMetric({
        method,
        path,
        statusCode,
        durationMs,
      });

      const context = {
        requestId,
        method,
        path,
        statusCode,
        durationMs,
      };

      if (statusCode >= 500) {
        logger.error('API request completed with server error', context);
      } else if (statusCode >= 400) {
        logger.warn('API request completed with client error', context);
      } else {
        logger.info('API request completed', context);
      }
    }
  };

  res.once('finish', complete);
  res.once('close', complete);
});
