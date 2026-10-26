import './load-env.ts';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/createApp.ts';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const app = await createApp();

  // --- Vite / Static Middleware (local dev / local prod only) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use('/media', express.static(path.join(distPath, 'media'), { maxAge: '30d' }));
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer();
