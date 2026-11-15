import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createApp, getStorageStatus } from './server/app.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();

async function startServer() {
  const app = await createApp();

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const status = getStorageStatus();
    console.log(
      `Prophet John Lord Ministry & CMS Server listening on http://0.0.0.0:${PORT} [DB: ${status.database} | Media: ${status.mediaHost}]`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
