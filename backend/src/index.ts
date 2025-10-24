import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './api/trpc/router';
import { createContext } from './api/trpc/context';

/**
 * BZR Portal Backend Server
 *
 * Hono framework with tRPC integration for type-safe API.
 * Implements Serbian BZR law compliance requirements.
 */

const app = new Hono();

// Environment variables
const PORT = parseInt(process.env.PORT || '3000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BZR Portal Backend',
    version: '1.0.0',
  });
});

// tRPC endpoint
app.all('/trpc/*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`tRPC Error on ${path}:`, error);
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'Тражена рута не постоји',
      path: c.req.path,
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

// Start server
console.log(`🚀 BZR Portal Backend starting on port ${PORT}...`);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`✅ Server running at http://localhost:${info.port}`);
    console.log(`📡 tRPC endpoint: http://localhost:${info.port}/trpc`);
    console.log(`💚 Health check: http://localhost:${info.port}/health`);
    console.log(`🌐 CORS origin: ${CORS_ORIGIN}`);
  }
);

export default app;
