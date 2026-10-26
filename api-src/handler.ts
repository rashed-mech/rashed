import '../load-env';
import { createApp } from '../src/server/createApp';
// NOTE: this file is never deployed as-is. The build:vercel step bundles it
// (and everything it imports) into a single self-contained api/index.js
// file, so Vercel never has to resolve any of these relative imports at
// runtime.

// Vercel keeps this module cached across invocations on the same warm
// instance, so we only want to build the Express app once, not on every
// request. This promise is created the first time the module loads and
// reused after that.
let appPromise: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = createApp().catch((err) => {
      // If startup fails (e.g. a transient DB hiccup), don't cache the
      // failure forever — let the next request try building the app again.
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
