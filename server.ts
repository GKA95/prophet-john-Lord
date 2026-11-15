import 'dotenv/config';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import type {
  CMSContent,
  NewsletterSubscriber,
  ContactSubmission,
  EventRegistration,
  StorageBackendInfo,
} from './src/types/index.ts';
import {
  initDatabase,
  reconnectDatabase,
  isMongoConnected,
  getLastMongoError,
  getDatabaseName,
  areAdminSecretsConfigured,
  hashPassword,
  getCMS,
  replaceCMS,
  updateCMSSection,
  resetCMS,
  getAdminAuth,
  saveAdminAuth,
  getSubmissions,
  addNewsletterSubscriber,
  addContactSubmission,
  addEventRegistration,
  deleteSubmission,
  listMediaAssets,
  saveMediaAsset,
  deleteMediaAssetRecord,
} from './server/db.ts';
import {
  getCloudinaryConfigSummary,
  uploadImageAsset,
  removeMediaAssetFile,
} from './server/cloudinary.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');

const VALID_CMS_SECTIONS: (keyof CMSContent)[] = [
  'profile',
  'heroSlides',
  'heroSettings',
  'coreMandates',
  'pillars',
  'sermons',
  'events',
  'resources',
  'testimonials',
  'givingInitiatives',
  'mobileMoneyDetails',
  'contactInfo',
  'socialLinks',
  'whatsappConfig',
  'formspreeEndpoint',
  'coreTenets',
];

function createSignedToken(email: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySignedToken(token: string, secret: string): { email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      email: string;
      exp: number;
    };
    if (!decoded.exp || Date.now() > decoded.exp) {
      return null;
    }
    return { email: decoded.email };
  } catch {
    return null;
  }
}

function getStorageStatus(): StorageBackendInfo {
  const mongoOk = isMongoConnected();
  const cloud = getCloudinaryConfigSummary();
  return {
    database: mongoOk ? 'mongodb' : 'json',
    databaseName: getDatabaseName(),
    mongoConnected: mongoOk,
    mongoError: mongoOk ? undefined : getLastMongoError(),
    mediaHost: cloud.configured ? 'cloudinary' : 'local',
    cloudinaryConfigured: cloud.configured,
    cloudinaryFolder: cloud.folder,
    cloudinaryCloudName: cloud.cloudName,
    adminSecretsConfigured: areAdminSecretsConfigured(),
  };
}

async function startServer() {
  await initDatabase();
  // Ensure initial CMS & auth records exist on startup
  await getCMS();
  await getAdminAuth();

  const app = express();

  // Public CORS for headless CMS consumption
  app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '15mb' }));

  // Serve fallback local uploads if Cloudinary isn't configured
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Auth middleware for protected Admin routes
  const requireAdmin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const authStore = await getAdminAuth();
      const verified = token ? verifySignedToken(token, authStore.tokenSecret) : null;
      if (!verified) {
        res.status(401).json({ error: 'Unauthorized. Valid admin session token required.' });
        return;
      }
      next();
    } catch {
      res.status(500).json({ error: 'Authentication verification failed.' });
    }
  };

  // =====================================================================
  // 1. PUBLIC CONSUMABLE CONTENT MANAGEMENT SERVICE (CMS) API
  // =====================================================================

  // Full CMS payload (MongoDB primary or JSON fallback)
  app.get('/api/cms', async (_req, res) => {
    try {
      const payload = await getCMS();
      res.json(payload);
    } catch {
      res.status(500).json({ error: 'Failed to load CMS content.' });
    }
  });

  // CMS API discovery / schema manifest
  app.get('/api/cms/schema', async (req, res) => {
    try {
      const cms = await getCMS();
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
      const baseUrl = `${protocol}://${host}`;
      const storage = getStorageStatus();
      res.json({
        service: 'Prophet John Lord Ministry CMS',
        version: cms.version,
        updatedAt: cms.updatedAt,
        storage: {
          database: storage.database,
          mediaHost: storage.mediaHost,
        },
        endpoints: {
          allContent: `${baseUrl}/api/cms`,
          sections: VALID_CMS_SECTIONS.reduce<Record<string, string>>((acc, key) => {
            acc[key] = `${baseUrl}/api/cms/${key}`;
            return acc;
          }, {}),
        },
      });
    } catch {
      res.status(500).json({ error: 'Failed to load CMS schema.' });
    }
  });

  // Section-level consumable endpoints
  app.get('/api/cms/:section', async (req, res) => {
    const section = req.params.section as keyof CMSContent;
    if (!VALID_CMS_SECTIONS.includes(section)) {
      res.status(404).json({
        error: `Unknown CMS section '${req.params.section}'.`,
        availableSections: VALID_CMS_SECTIONS,
      });
      return;
    }
    try {
      const cms = await getCMS();
      res.json({
        section,
        updatedAt: cms.updatedAt,
        data: cms.content[section],
      });
    } catch {
      res.status(500).json({ error: 'Failed to read CMS section.' });
    }
  });

  // =====================================================================
  // 2. PUBLIC SUBMISSIONS (Newsletter, Contact, Event RSVP -> MongoDB)
  // =====================================================================

  app.post('/api/submissions/newsletter', async (req, res) => {
    const { name, email } = req.body || {};
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }
    try {
      const entry: NewsletterSubscriber = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: String(name).trim().slice(0, 120),
        email: String(email).trim().slice(0, 160),
        createdAt: new Date().toISOString(),
      };
      const subscriber = await addNewsletterSubscriber(entry);
      res.status(201).json({ ok: true, subscriber });
    } catch {
      res.status(500).json({ error: 'Failed to store subscription.' });
    }
  });

  app.post('/api/submissions/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Name, email, subject, and message are required.' });
      return;
    }
    try {
      const entry: ContactSubmission = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: String(name).trim().slice(0, 120),
        email: String(email).trim().slice(0, 160),
        phone: phone ? String(phone).trim().slice(0, 50) : undefined,
        subject: String(subject).trim().slice(0, 200),
        message: String(message).trim().slice(0, 5000),
        createdAt: new Date().toISOString(),
      };
      const submission = await addContactSubmission(entry);
      res.status(201).json({ ok: true, submission });
    } catch {
      res.status(500).json({ error: 'Failed to store contact message.' });
    }
  });

  app.post('/api/submissions/event-rsvp', async (req, res) => {
    const { eventId, eventTitle, name, email, phone, attendeeCount } = req.body || {};
    if (!eventId || !name || !email) {
      res.status(400).json({ error: 'Event ID, name, and email are required.' });
      return;
    }
    try {
      const entry: EventRegistration = {
        id: `rsvp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        eventId: String(eventId).trim(),
        eventTitle: String(eventTitle || 'Ministry Gathering').trim().slice(0, 200),
        name: String(name).trim().slice(0, 120),
        email: String(email).trim().slice(0, 160),
        phone: phone ? String(phone).trim().slice(0, 50) : undefined,
        attendeeCount: String(attendeeCount || '1').slice(0, 10),
        createdAt: new Date().toISOString(),
      };
      const registration = await addEventRegistration(entry);
      res.status(201).json({ ok: true, registration });
    } catch {
      res.status(500).json({ error: 'Failed to store event RSVP.' });
    }
  });

  // =====================================================================
  // 3. ADMIN AUTHENTICATION & PROTECTED CMS MUTATIONS
  // =====================================================================

  app.post('/api/admin/login', async (req, res) => {
    const { email, passcode } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const providedPass = String(passcode || '');

    if (!normalizedEmail || !providedPass) {
      res.status(400).json({ error: 'Email and passcode are required.' });
      return;
    }

    try {
      const authStore = await getAdminAuth();
      const emailMatches = normalizedEmail === authStore.email.toLowerCase();
      const candidateHash = hashPassword(providedPass, authStore.salt);
      const storedBuf = Buffer.from(authStore.passwordHash, 'hex');
      const candidateBuf = Buffer.from(candidateHash, 'hex');
      const passMatches =
        storedBuf.length === candidateBuf.length &&
        crypto.timingSafeEqual(storedBuf, candidateBuf);

      if (!emailMatches || !passMatches) {
        res.status(401).json({ error: 'Invalid admin email or passcode.' });
        return;
      }

      const token = createSignedToken(authStore.email, authStore.tokenSecret);
      res.json({
        ok: true,
        token,
        admin: { email: authStore.email },
      });
    } catch {
      res.status(500).json({ error: 'Login failed.' });
    }
  });

  app.get('/api/admin/session', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const authStore = await getAdminAuth();
      const verified = token ? verifySignedToken(token, authStore.tokenSecret) : null;
      if (!verified) {
        res.status(401).json({ authenticated: false });
        return;
      }
      res.json({ authenticated: true, admin: { email: verified.email } });
    } catch {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post('/api/admin/password', requireAdmin, async (req, res) => {
    const { currentPasscode, newPasscode, newEmail } = req.body || {};
    try {
      let authStore = await getAdminAuth();
      const candidateHash = hashPassword(String(currentPasscode || ''), authStore.salt);
      const storedBuf = Buffer.from(authStore.passwordHash, 'hex');
      const candidateBuf = Buffer.from(candidateHash, 'hex');
      const passMatches =
        storedBuf.length === candidateBuf.length &&
        crypto.timingSafeEqual(storedBuf, candidateBuf);

      if (!passMatches) {
        res.status(403).json({ error: 'Current passcode is incorrect.' });
        return;
      }

      if (newPasscode && String(newPasscode).length < 6) {
        res.status(400).json({ error: 'New passcode must be at least 6 characters.' });
        return;
      }

      const nextSalt = crypto.randomBytes(16).toString('hex');
      authStore = {
        ...authStore,
        email: newEmail ? String(newEmail).trim().toLowerCase() : authStore.email,
        salt: newPasscode ? nextSalt : authStore.salt,
        passwordHash: newPasscode
          ? hashPassword(String(newPasscode), nextSalt)
          : authStore.passwordHash,
        updatedAt: new Date().toISOString(),
      };
      await saveAdminAuth(authStore);

      const token = createSignedToken(authStore.email, authStore.tokenSecret);
      res.json({ ok: true, token, admin: { email: authStore.email } });
    } catch {
      res.status(500).json({ error: 'Failed to update credentials.' });
    }
  });

  // Storage & backend readiness info (MongoDB + Cloudinary)
  app.get('/api/admin/storage', requireAdmin, (_req, res) => {
    res.json(getStorageStatus());
  });

  app.post('/api/admin/storage/reconnect', requireAdmin, async (_req, res) => {
    await reconnectDatabase();
    res.json(getStorageStatus());
  });

  // Replace entire CMS content
  app.put('/api/cms', requireAdmin, async (req, res) => {
    const incomingContent = req.body?.content || req.body;
    if (!incomingContent || typeof incomingContent !== 'object') {
      res.status(400).json({ error: 'Invalid CMS content payload.' });
      return;
    }
    try {
      const updated = await replaceCMS(incomingContent as CMSContent);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to save CMS payload.' });
    }
  });

  // Update a single CMS section atomically
  app.put('/api/cms/:section', requireAdmin, async (req, res) => {
    const section = req.params.section as keyof CMSContent;
    if (!VALID_CMS_SECTIONS.includes(section)) {
      res.status(404).json({ error: `Unknown CMS section '${req.params.section}'.` });
      return;
    }
    const data = req.body?.data !== undefined ? req.body.data : req.body;
    if (data === undefined) {
      res.status(400).json({ error: 'Missing data field for section update.' });
      return;
    }
    try {
      const updated = await updateCMSSection(section, data);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update CMS section.' });
    }
  });

  // Reset CMS back to original defaults
  app.post('/api/cms/reset', requireAdmin, async (_req, res) => {
    try {
      const fresh = await resetCMS();
      res.json(fresh);
    } catch {
      res.status(500).json({ error: 'Failed to reset CMS content.' });
    }
  });

  // Upload media asset -> Cloudinary (if configured) or local fallback, & catalog in MongoDB
  app.post('/api/cms/upload', requireAdmin, async (req, res) => {
    const { filename, dataUrl } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Missing image dataUrl.' });
      return;
    }
    try {
      const asset = await uploadImageAsset({ filename, dataUrl });
      await saveMediaAsset(asset);
      res.status(201).json({
        ok: true,
        url: asset.secureUrl,
        asset,
      });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Image upload failed.',
      });
    }
  });

  // List uploaded Cloudinary / local media assets
  app.get('/api/admin/media', requireAdmin, async (_req, res) => {
    try {
      const assets = await listMediaAssets();
      res.json({ assets });
    } catch {
      res.status(500).json({ error: 'Failed to list media assets.' });
    }
  });

  // Delete media asset from MongoDB & Cloudinary/disk
  app.delete('/api/admin/media/:id', requireAdmin, async (req, res) => {
    try {
      const removed = await deleteMediaAssetRecord(req.params.id);
      if (removed) {
        await removeMediaAssetFile(removed);
      }
      const assets = await listMediaAssets();
      res.json({ ok: true, assets });
    } catch {
      res.status(500).json({ error: 'Failed to delete media asset.' });
    }
  });

  // Protected Inbox endpoints for Admin
  app.get('/api/admin/submissions', requireAdmin, async (_req, res) => {
    try {
      const submissions = await getSubmissions();
      res.json(submissions);
    } catch {
      res.status(500).json({ error: 'Failed to load submissions.' });
    }
  });

  app.delete('/api/admin/submissions/:type/:id', requireAdmin, async (req, res) => {
    const { type, id } = req.params;
    if (type !== 'newsletter' && type !== 'contact' && type !== 'rsvp') {
      res.status(400).json({ error: 'Invalid submission type.' });
      return;
    }
    try {
      const submissions = await deleteSubmission(type, id);
      res.json(submissions);
    } catch {
      res.status(500).json({ error: 'Failed to delete submission.' });
    }
  });

  // =====================================================================
  // 4. VITE DEV MIDDLEWARE OR PRODUCTION STATIC SERVING
  // =====================================================================
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
