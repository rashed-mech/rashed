import '../load-env';
import serverless from 'serverless-http';
import { createApp } from '../src/server/createApp';
// NOTE: this file is never deployed as-is. The build:netlify step bundles it
// (and everything it imports) into a single self-contained
// netlify/functions/api.js file, so Netlify never has to resolve any of
// these relative imports at runtime.

// Netlify keeps this module cached across invocations on the same warm
// instance, so we only want to build the Express app (and wrap it) once,
// not on every request. This promise is created the first time the module
// loads and reused after that.
let handlerPromise: ReturnType<typeof buildHandler> | null = null;

async function buildHandler() {
  const app = await createApp();
  return serverless(app);
}

export const handler = async (event: any, context: any) => {
  if (!handlerPromise) {
    handlerPromise = buildHandler().catch((err) => {
      // If startup fails (e.g. a transient DB hiccup), don't cache the
      // failure forever — let the next request try building the app again.
      handlerPromise = null;
      throw err;
    });
  }
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(event, context);
};
