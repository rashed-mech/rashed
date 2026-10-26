import '../load-env';
import serverless from 'serverless-http';
import { serverlessOptions } from '../src/server/serverlessOptions';
// NOTE: this file is never deployed as-is. The build:netlify step bundles it
// (and everything it imports) into a single self-contained
// netlify/functions/api.cjs file, so Netlify never has to resolve any of
// these relative imports at runtime.

// Netlify keeps this module cached across invocations on the same warm
// instance, so we only want to build the Express app (and wrap it) once,
// not on every request. This promise is created the first time the module
// loads and reused after that.
let handlerPromise: ReturnType<typeof buildHandler> | null = null;

async function buildHandler() {
  if (!process.env.MONGODB_URI?.trim()) throw new Error('MONGODB_URI is required for Netlify.');
  const { createApp } = await import('../src/server/createApp');
  const app = await createApp();
  return serverless(app, serverlessOptions);
}

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    if (!handlerPromise) {
      handlerPromise = buildHandler().catch((err) => {
        // Let the next request retry after a transient database failure.
        handlerPromise = null;
        throw err;
      });
    }
    const serverlessHandler = await handlerPromise;
    return await serverlessHandler(event, context);
  } catch (err: any) {
    // Static, non-secret reason code so the real cause is visible in the browser and in Netlify's function logs.
    const raw = typeof err?.code === 'string' ? err.code : '';
    const reason = /MONGODB_URI is required/.test(String(err?.message)) ? 'missing-env' : (raw || 'unknown');
    console.error('[API] Database initialization failed:', reason, '-', err?.message);
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({success:false, reason, message:'Database unavailable. Check MongoDB configuration and complete the initial data migration.'}),
    };
  }
};
