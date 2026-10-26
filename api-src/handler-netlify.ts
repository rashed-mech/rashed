import '../load-env';
import serverless from 'serverless-http';
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
  return serverless(app);
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
  } catch {
    console.error('[API] Database initialization failed. Check MongoDB variables, migration and Atlas access.');
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({success:false, message:'Database unavailable. Check MongoDB configuration and complete the initial data migration.'}),
    };
  }
};
