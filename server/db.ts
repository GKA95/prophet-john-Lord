import { MongoClient, type Db, type Collection } from 'mongodb';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createDefaultCMSContent } from '../src/data/cmsDefaults.ts';
import type {
  CMSContent,
  CMSPayload,
  CMSSubmissions,
  NewsletterSubscriber,
  ContactSubmission,
  EventRegistration,
  MediaAssetRecord,
} from '../src/types/index.ts';

export interface AdminAuthStore {
  email: string;
  salt: string;
  passwordHash: string;
  tokenSecret: string;
  envFingerprint?: string;
  updatedAt: string;
}

interface CMSDocument {
  _id: string;
  version: string;
  updatedAt: string;
  content: CMSContent;
}

interface AdminAuthDocument extends AdminAuthStore {
  _id: string;
}

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CMS_FILE = path.join(DATA_DIR, 'cms-content.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'cms-submissions.json');
const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media-assets.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let mongoConnected = false;
let lastMongoError: string | undefined;

export function getLastMongoError(): string | undefined {
  return lastMongoError;
}

export function getDatabaseName(): string {
  return (process.env.MONGODB_DB_NAME || 'prophet_john_lord_ministry').trim();
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function ensureLocalDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function mergeCMSWithDefaults(partial?: Partial<CMSPayload>): CMSPayload {
  const defaults = createDefaultCMSContent();
  const raw = partial?.content;
  if (!raw) {
    return {
      version: partial?.version || '1.0.0',
      updatedAt: partial?.updatedAt || new Date().toISOString(),
      content: defaults,
    };
  }

  return {
    version: partial?.version || '1.0.0',
    updatedAt: partial?.updatedAt || new Date().toISOString(),
    content: {
      ...defaults,
      ...raw,
      profile: {
        ...defaults.profile,
        ...(raw.profile || {}),
        subsections: {
          ...defaults.profile.subsections,
          ...(raw.profile?.subsections || {}),
        },
      },
      contactInfo: {
        ...defaults.contactInfo,
        ...(raw.contactInfo || {}),
      },
      mobileMoneyDetails: {
        ...defaults.mobileMoneyDetails,
        ...(raw.mobileMoneyDetails || {}),
      },
      whatsappConfig: {
        ...defaults.whatsappConfig,
        ...(raw.whatsappConfig || {}),
      },
      heroSettings: {
        ...defaults.heroSettings,
        ...(raw.heroSettings || {}),
      },
    },
  };
}

function readLocalCMS(): CMSPayload {
  ensureLocalDirectories();
  if (fs.existsSync(CMS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(CMS_FILE, 'utf-8')) as Partial<CMSPayload>;
      return mergeCMSWithDefaults(parsed);
    } catch {
      // fallback below
    }
  }
  const initial = mergeCMSWithDefaults();
  fs.writeFileSync(CMS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

function writeLocalCMS(payload: CMSPayload): void {
  ensureLocalDirectories();
  fs.writeFileSync(CMS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}

function readLocalAuth(): AdminAuthStore {
  ensureLocalDirectories();
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')) as AdminAuthStore;
      if (parsed.email && parsed.salt && parsed.passwordHash && parsed.tokenSecret) {
        return parsed;
      }
    } catch {
      // re-init below
    }
  }

  const env = getEnvAdminOverrides();
  const initialEmail = env.envEmail || 'gideonkwesiansah@gmail.com';
  const initialPassword = env.envPasscode || 'JohnLord@2026';
  const salt = crypto.randomBytes(16).toString('hex');
  const tokenSecret = crypto.randomBytes(32).toString('hex');
  const store: AdminAuthStore = {
    email: initialEmail,
    salt,
    passwordHash: hashPassword(initialPassword, salt),
    tokenSecret,
    envFingerprint: env.fingerprint,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), 'utf-8');
  return store;
}

function writeLocalAuth(store: AdminAuthStore): void {
  ensureLocalDirectories();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function readLocalSubmissions(): CMSSubmissions {
  ensureLocalDirectories();
  if (fs.existsSync(SUBMISSIONS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8')) as Partial<CMSSubmissions>;
      return {
        newsletterSubscribers: Array.isArray(parsed.newsletterSubscribers) ? parsed.newsletterSubscribers : [],
        contactSubmissions: Array.isArray(parsed.contactSubmissions) ? parsed.contactSubmissions : [],
        eventRegistrations: Array.isArray(parsed.eventRegistrations) ? parsed.eventRegistrations : [],
      };
    } catch {
      // fallback
    }
  }
  const initial: CMSSubmissions = {
    newsletterSubscribers: [],
    contactSubmissions: [],
    eventRegistrations: [],
  };
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

function writeLocalSubmissions(submissions: CMSSubmissions): void {
  ensureLocalDirectories();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
}

function readLocalMedia(): MediaAssetRecord[] {
  ensureLocalDirectories();
  if (fs.existsSync(MEDIA_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function writeLocalMedia(items: MediaAssetRecord[]): void {
  ensureLocalDirectories();
  fs.writeFileSync(MEDIA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function safeDecodeAndEncodeComponent(value: string): string {
  try {
    const decoded = decodeURIComponent(value);
    return encodeURIComponent(decoded);
  } catch {
    return encodeURIComponent(value);
  }
}

function buildMongoUriCandidates(rawUri: string): {
  candidates: string[];
  hasPlaceholder: boolean;
} {
  let cleaned = rawUri.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const protoMatch = /^(mongodb(?:\+srv)?:\/\/)(.*)$/i.exec(cleaned);
  if (!protoMatch) {
    return { candidates: [cleaned], hasPlaceholder: false };
  }

  const proto = protoMatch[1];
  const rest = protoMatch[2];
  const slashOrQueryIdx = rest.search(/[/?]/);
  const authority = slashOrQueryIdx === -1 ? rest : rest.slice(0, slashOrQueryIdx);
  const pathAndQuery = slashOrQueryIdx === -1 ? '' : rest.slice(slashOrQueryIdx);

  const lastAt = authority.lastIndexOf('@');
  if (lastAt === -1) {
    return { candidates: [cleaned], hasPlaceholder: false };
  }

  const creds = authority.slice(0, lastAt);
  const host = authority.slice(lastAt + 1);
  const colonIdx = creds.indexOf(':');
  if (colonIdx === -1) {
    return { candidates: [cleaned], hasPlaceholder: false };
  }

  const rawUser = creds.slice(0, colonIdx);
  const rawPass = creds.slice(colonIdx + 1);
  const hasPlaceholder =
    /^<(db_password|password|user|username)>$/i.test(rawPass) ||
    /^<(user|username)>$/i.test(rawUser);

  const encodedUser = safeDecodeAndEncodeComponent(rawUser);
  const encodedPass = safeDecodeAndEncodeComponent(rawPass);
  const primary = `${proto}${encodedUser}:${encodedPass}@${host}${pathAndQuery}`;

  // Try exact cleaned URI first (in case user already encoded special characters), then encoded/authSource variants
  const candidates = new Set<string>([cleaned, primary]);

  // Also try with authSource=admin if path includes a DB name and authSource isn't specified
  if (!/[?&]authSource=/i.test(pathAndQuery)) {
    const sep = pathAndQuery.includes('?') ? '&' : pathAndQuery.includes('/') ? '?' : '/?';
    candidates.add(`${cleaned}${sep}authSource=admin`);
    candidates.add(`${primary}${sep}authSource=admin`);
  }

  // If password had accidental angle brackets around a real value (not literal placeholder), try unwrapped
  if (!hasPlaceholder && /^<([^<>]+)>$/.test(rawPass)) {
    const unwrapped = rawPass.slice(1, -1);
    const unwrappedUri = `${proto}${encodedUser}:${safeDecodeAndEncodeComponent(unwrapped)}@${host}${pathAndQuery}`;
    candidates.add(unwrappedUri);
    if (!/[?&]authSource=/i.test(pathAndQuery)) {
      const sep = pathAndQuery.includes('?') ? '&' : pathAndQuery.includes('/') ? '?' : '/?';
      candidates.add(`${unwrappedUri}${sep}authSource=admin`);
    }
  }

  return { candidates: Array.from(candidates), hasPlaceholder };
}

export async function initDatabase(): Promise<{
  database: 'mongodb' | 'json';
  databaseName: string;
  mongoConnected: boolean;
}> {
  ensureLocalDirectories();
  let uri = process.env.MONGODB_URI?.trim();
  if (uri && /^MONGODB_URI\s*=/i.test(uri)) {
    uri = uri.replace(/^MONGODB_URI\s*=\s*/i, '').trim();
  }
  const dbName = getDatabaseName();
  lastMongoError = undefined;

  if (!uri) {
    mongoConnected = false;
    return { database: 'json', databaseName: dbName, mongoConnected: false };
  }

  const { candidates, hasPlaceholder } = buildMongoUriCandidates(uri);
  if (hasPlaceholder) {
    mongoClient = null;
    mongoDb = null;
    mongoConnected = false;
    lastMongoError =
      'MONGODB_URI still contains a <db_password> or <username> placeholder. Replace it with your actual MongoDB Atlas Database Access credentials.';
    console.log(`[DB] ${lastMongoError} Using local JSON persistence fallback.`);
    return { database: 'json', databaseName: dbName, mongoConnected: false };
  }

  let lastErr: unknown = null;
  for (const candidateUri of candidates) {
    let client: MongoClient | null = null;
    try {
      client = new MongoClient(candidateUri, {
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      await client.db(dbName).command({ ping: 1 });
      mongoClient = client;
      mongoDb = mongoClient.db(dbName);
      mongoConnected = true;
      lastMongoError = undefined;
      break;
    } catch (err) {
      lastErr = err;
      if (client) {
        try {
          await client.close();
        } catch {
          // ignore close error
        }
      }
    }
  }

  if (mongoConnected && mongoDb) {
    try {
      // Seed MongoDB on initial boot if collections are empty (migrating any existing local JSON cleanly)
      const cmsCol = mongoDb.collection<CMSDocument>('cms_content');
      const existingCms = await cmsCol.findOne({ _id: 'primary' });
      if (!existingCms) {
        const seedCms = readLocalCMS();
        await cmsCol.insertOne({ _id: 'primary', ...seedCms });
      }

      const authCol = mongoDb.collection<AdminAuthDocument>('admin_auth');
      const existingAuth = await authCol.findOne({ _id: 'primary' });
      if (!existingAuth) {
        const seedAuth = readLocalAuth();
        await authCol.insertOne({ _id: 'primary', ...seedAuth });
      }

      // Create helpful indexes
      await mongoDb.collection('newsletter_subscribers').createIndex({ email: 1 }, { unique: true });
      await mongoDb.collection('contact_submissions').createIndex({ createdAt: -1 });
      await mongoDb.collection('event_registrations').createIndex({ createdAt: -1 });
      await mongoDb.collection('media_assets').createIndex({ createdAt: -1 });

      console.log(`Connected to MongoDB database: ${dbName}`);
      return { database: 'mongodb', databaseName: dbName, mongoConnected: true };
    } catch (err) {
      lastErr = err;
      mongoClient = null;
      mongoDb = null;
      mongoConnected = false;
    }
  }

  const rawMsg = lastErr instanceof Error ? lastErr.message : String(lastErr || 'Connection failed');
  lastMongoError = rawMsg.toLowerCase().includes('authentication failed')
    ? 'Atlas server reached, but username/password in MONGODB_URI was rejected (bad auth). Go to MongoDB Atlas -> Security -> Database Access, reset that database user password (letters/numbers only), click Update User, and paste it into MONGODB_URI without < > brackets.'
    : rawMsg;
  console.log(`[DB] MongoDB unavailable (${lastMongoError}); running on local JSON persistence.`);
  return { database: 'json', databaseName: dbName, mongoConnected: false };
}

export async function reconnectDatabase() {
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch {
      // ignore close error
    }
  }
  mongoClient = null;
  mongoDb = null;
  mongoConnected = false;
  return initDatabase();
}

export function isMongoConnected(): boolean {
  return Boolean(mongoConnected && mongoDb);
}

function getCollection<T extends { _id?: string }>(name: string): Collection<T> {
  if (!mongoDb) {
    throw new Error('MongoDB is not initialized');
  }
  return mongoDb.collection<T>(name);
}

// =====================================================================
// CMS CONTENT REPOSITORY
// =====================================================================
export async function getCMS(): Promise<CMSPayload> {
  if (isMongoConnected()) {
    const doc = await getCollection<CMSDocument>('cms_content').findOne({ _id: 'primary' });
    if (doc) {
      return mergeCMSWithDefaults({
        version: doc.version,
        updatedAt: doc.updatedAt,
        content: doc.content,
      });
    }
    const seed = mergeCMSWithDefaults();
    await getCollection<CMSDocument>('cms_content').insertOne({ _id: 'primary', ...seed });
    return seed;
  }
  return readLocalCMS();
}

export async function replaceCMS(content: CMSContent, version = '1.0.0'): Promise<CMSPayload> {
  const next = mergeCMSWithDefaults({
    version,
    updatedAt: new Date().toISOString(),
    content,
  });

  if (isMongoConnected()) {
    await getCollection<CMSDocument>('cms_content').updateOne(
      { _id: 'primary' },
      { $set: { version: next.version, updatedAt: next.updatedAt, content: next.content } },
      { upsert: true }
    );
    return next;
  }

  writeLocalCMS(next);
  return next;
}

export async function updateCMSSection<K extends keyof CMSContent>(
  section: K,
  data: CMSContent[K]
): Promise<CMSPayload> {
  const updatedAt = new Date().toISOString();

  if (isMongoConnected()) {
    await getCollection<CMSDocument>('cms_content').updateOne(
      { _id: 'primary' },
      {
        $set: {
          [`content.${String(section)}`]: data,
          updatedAt,
        },
      },
      { upsert: true }
    );
    return getCMS();
  }

  const current = readLocalCMS();
  const next: CMSPayload = {
    ...current,
    updatedAt,
    content: {
      ...current.content,
      [section]: data,
    },
  };
  writeLocalCMS(next);
  return next;
}

export async function resetCMS(): Promise<CMSPayload> {
  const fresh: CMSPayload = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    content: createDefaultCMSContent(),
  };

  if (isMongoConnected()) {
    await getCollection<CMSDocument>('cms_content').replaceOne(
      { _id: 'primary' },
      { version: fresh.version, updatedAt: fresh.updatedAt, content: fresh.content },
      { upsert: true }
    );
    return fresh;
  }

  writeLocalCMS(fresh);
  return fresh;
}

function getEnvAdminOverrides(): {
  envEmail?: string;
  envPasscode?: string;
  fingerprint?: string;
} {
  const rawEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const rawPass = (process.env.ADMIN_PASSCODE || process.env.ADMIN_PASSWORD || '').trim();
  if (!rawEmail && !rawPass) {
    return {};
  }
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${rawEmail}::${rawPass}`)
    .digest('hex');
  return {
    envEmail: rawEmail || undefined,
    envPasscode: rawPass || undefined,
    fingerprint,
  };
}

export function areAdminSecretsConfigured(): boolean {
  const env = getEnvAdminOverrides();
  return Boolean(env.fingerprint);
}

// =====================================================================
// ADMIN AUTH REPOSITORY
// =====================================================================
export async function getAdminAuth(): Promise<AdminAuthStore> {
  let store: AdminAuthStore;

  if (isMongoConnected()) {
    const doc = await getCollection<AdminAuthDocument>('admin_auth').findOne({ _id: 'primary' });
    if (doc) {
      store = {
        email: doc.email,
        salt: doc.salt,
        passwordHash: doc.passwordHash,
        tokenSecret: doc.tokenSecret,
        envFingerprint: doc.envFingerprint,
        updatedAt: doc.updatedAt,
      };
    } else {
      store = readLocalAuth();
      await getCollection<AdminAuthDocument>('admin_auth').insertOne({ _id: 'primary', ...store });
    }
  } else {
    store = readLocalAuth();
  }

  const env = getEnvAdminOverrides();
  if (env.fingerprint && store.envFingerprint !== env.fingerprint) {
    const nextSalt = env.envPasscode ? crypto.randomBytes(16).toString('hex') : store.salt;
    store = {
      email: env.envEmail || store.email,
      salt: nextSalt,
      passwordHash: env.envPasscode
        ? hashPassword(env.envPasscode, nextSalt)
        : store.passwordHash,
      tokenSecret: crypto.randomBytes(32).toString('hex'),
      envFingerprint: env.fingerprint,
      updatedAt: new Date().toISOString(),
    };
    await saveAdminAuth(store);
  }

  return store;
}

export async function saveAdminAuth(store: AdminAuthStore): Promise<AdminAuthStore> {
  if (isMongoConnected()) {
    await getCollection<AdminAuthDocument>('admin_auth').replaceOne(
      { _id: 'primary' },
      {
        email: store.email,
        salt: store.salt,
        passwordHash: store.passwordHash,
        tokenSecret: store.tokenSecret,
        envFingerprint: store.envFingerprint,
        updatedAt: store.updatedAt,
      },
      { upsert: true }
    );
    return store;
  }
  writeLocalAuth(store);
  return store;
}

// =====================================================================
// SUBMISSIONS REPOSITORY
// =====================================================================
export async function getSubmissions(): Promise<CMSSubmissions> {
  if (isMongoConnected()) {
    const [newsletterSubscribers, contactSubmissions, eventRegistrations] = await Promise.all([
      getCollection<NewsletterSubscriber & { _id?: string }>('newsletter_subscribers')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
      getCollection<ContactSubmission & { _id?: string }>('contact_submissions')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
      getCollection<EventRegistration & { _id?: string }>('event_registrations')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    return {
      newsletterSubscribers,
      contactSubmissions,
      eventRegistrations,
    };
  }

  return readLocalSubmissions();
}

export async function addNewsletterSubscriber(
  entry: NewsletterSubscriber
): Promise<NewsletterSubscriber> {
  const normalized: NewsletterSubscriber = {
    ...entry,
    email: entry.email.trim().toLowerCase(),
  };

  if (isMongoConnected()) {
    const col = getCollection<NewsletterSubscriber & { _id?: string }>('newsletter_subscribers');
    const existing = await col.findOne(
      { email: normalized.email },
      { projection: { _id: 0 } }
    );
    if (existing) {
      return existing;
    }
    await col.insertOne({ _id: normalized.id, ...normalized });
    return normalized;
  }

  const current = readLocalSubmissions();
  const exists = current.newsletterSubscribers.find(
    (s) => s.email.toLowerCase() === normalized.email
  );
  if (exists) {
    return exists;
  }
  current.newsletterSubscribers.unshift(normalized);
  writeLocalSubmissions(current);
  return normalized;
}

export async function addContactSubmission(entry: ContactSubmission): Promise<ContactSubmission> {
  if (isMongoConnected()) {
    await getCollection<ContactSubmission & { _id?: string }>('contact_submissions').insertOne({
      _id: entry.id,
      ...entry,
    });
    return entry;
  }

  const current = readLocalSubmissions();
  current.contactSubmissions.unshift(entry);
  writeLocalSubmissions(current);
  return entry;
}

export async function addEventRegistration(entry: EventRegistration): Promise<EventRegistration> {
  if (isMongoConnected()) {
    await getCollection<EventRegistration & { _id?: string }>('event_registrations').insertOne({
      _id: entry.id,
      ...entry,
    });
    return entry;
  }

  const current = readLocalSubmissions();
  current.eventRegistrations.unshift(entry);
  writeLocalSubmissions(current);
  return entry;
}

export async function deleteSubmission(
  type: 'newsletter' | 'contact' | 'rsvp',
  id: string
): Promise<CMSSubmissions> {
  if (isMongoConnected()) {
    if (type === 'newsletter') {
      await getCollection<{ _id?: string; id: string }>('newsletter_subscribers').deleteOne({ id });
    } else if (type === 'contact') {
      await getCollection<{ _id?: string; id: string }>('contact_submissions').deleteOne({ id });
    } else if (type === 'rsvp') {
      await getCollection<{ _id?: string; id: string }>('event_registrations').deleteOne({ id });
    }
    return getSubmissions();
  }

  const current = readLocalSubmissions();
  if (type === 'newsletter') {
    current.newsletterSubscribers = current.newsletterSubscribers.filter((s) => s.id !== id);
  } else if (type === 'contact') {
    current.contactSubmissions = current.contactSubmissions.filter((s) => s.id !== id);
  } else if (type === 'rsvp') {
    current.eventRegistrations = current.eventRegistrations.filter((s) => s.id !== id);
  }
  writeLocalSubmissions(current);
  return current;
}

// =====================================================================
// MEDIA ASSETS CATALOG REPOSITORY (CLOUDINARY / LOCAL)
// =====================================================================
export async function listMediaAssets(): Promise<MediaAssetRecord[]> {
  if (isMongoConnected()) {
    return getCollection<MediaAssetRecord & { _id?: string }>('media_assets')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }
  return readLocalMedia();
}

export async function saveMediaAsset(asset: MediaAssetRecord): Promise<MediaAssetRecord> {
  if (isMongoConnected()) {
    await getCollection<MediaAssetRecord & { _id?: string }>('media_assets').insertOne({
      _id: asset.id,
      ...asset,
    });
    return asset;
  }
  const current = readLocalMedia();
  current.unshift(asset);
  writeLocalMedia(current);
  return asset;
}

export async function deleteMediaAssetRecord(id: string): Promise<MediaAssetRecord | null> {
  if (isMongoConnected()) {
    const col = getCollection<MediaAssetRecord & { _id?: string }>('media_assets');
    const doc = await col.findOne({ id }, { projection: { _id: 0 } });
    if (doc) {
      await col.deleteOne({ id });
      return doc;
    }
    return null;
  }
  const current = readLocalMedia();
  const target = current.find((m) => m.id === id) || null;
  if (target) {
    writeLocalMedia(current.filter((m) => m.id !== id));
  }
  return target;
}
