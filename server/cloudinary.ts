import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import type { MediaAssetRecord } from '../src/types/index.ts';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function getCloudinaryFolder(): string {
  return (process.env.CLOUDINARY_FOLDER || 'prophet-john-lord-ministry').trim();
}

export function isCloudinaryConfigured(): boolean {
  const hasUrl = Boolean(process.env.CLOUDINARY_URL?.trim());
  const hasKeys = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
  return hasUrl || hasKeys;
}

export function getCloudinaryConfigSummary() {
  const configured = isCloudinaryConfigured();
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
  if (!cloudName && process.env.CLOUDINARY_URL) {
    const match = /@([^/?]+)$/.exec(process.env.CLOUDINARY_URL.trim());
    if (match) cloudName = match[1];
  }

  if (configured) {
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
        secure: true,
      });
    } else {
      cloudinary.config({ secure: true });
    }
  }

  return {
    configured,
    folder: getCloudinaryFolder(),
    cloudName: cloudName || undefined,
  };
}

export async function uploadImageAsset(options: {
  filename?: string;
  dataUrl: string;
}): Promise<MediaAssetRecord> {
  const { filename, dataUrl } = options;
  const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    throw new Error('Unsupported image format. Use PNG, JPG, WEBP, or GIF.');
  }

  const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Image size exceeds 8MB limit.');
  }

  const baseName =
    String(filename || 'media')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 40) || 'media';
  const uniqueSlug = `${baseName}-${Date.now()}`;

  const configSummary = getCloudinaryConfigSummary();
  if (configSummary.configured) {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: configSummary.folder,
      public_id: uniqueSlug,
      resource_type: 'image',
      overwrite: false,
    });

    return {
      id: `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      publicId: result.public_id,
      url: result.secure_url,
      secureUrl: result.secure_url,
      filename: `${baseName}.${result.format || ext}`,
      format: result.format || ext,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      provider: 'cloudinary',
      createdAt: new Date().toISOString(),
    };
  }

  // Graceful local disk fallback when Cloudinary env vars are not yet configured
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const finalName = `${uniqueSlug}.${ext}`;
  const targetPath = path.join(UPLOADS_DIR, finalName);
  fs.writeFileSync(targetPath, buffer);

  const localUrl = `/uploads/${finalName}`;
  return {
    id: `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    url: localUrl,
    secureUrl: localUrl,
    filename: finalName,
    format: ext,
    bytes: buffer.length,
    provider: 'local',
    createdAt: new Date().toISOString(),
  };
}

export async function removeMediaAssetFile(asset: MediaAssetRecord): Promise<void> {
  if (asset.provider === 'cloudinary' && asset.publicId && isCloudinaryConfigured()) {
    getCloudinaryConfigSummary();
    await cloudinary.uploader.destroy(asset.publicId, { resource_type: 'image' });
    return;
  }

  if (asset.provider === 'local' && asset.url.startsWith('/uploads/')) {
    const fileName = asset.url.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, path.basename(fileName));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
