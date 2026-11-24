import type { IncomingMessage, ServerResponse } from 'http';
import app from '../backend/src/server';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Normalize path so all requests match Express /api routes
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  return app(req as any, res as any);
}
