import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../server/app.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await createApp();
  return app(req as unknown as Parameters<typeof app>[0], res as unknown as Parameters<typeof app>[1]);
}
