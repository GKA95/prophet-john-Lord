import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  CMSContent,
  CMSPayload,
  MediaAssetRecord,
  StorageBackendInfo,
} from '../types/index.ts';
import { createDefaultCMSContent } from '../data/cmsDefaults.ts';

interface CMSContextType {
  content: CMSContent;
  version: string;
  updatedAt: string;
  isLoading: boolean;
  isSaving: boolean;
  serverConnected: boolean;
  storageInfo: StorageBackendInfo | null;
  mediaAssets: MediaAssetRecord[];
  refreshCMS: () => Promise<void>;
  refreshMediaAssets: () => Promise<void>;
  deleteMediaAsset: (id: string) => Promise<{ ok: boolean; error?: string }>;
  adminToken: string | null;
  adminEmail: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  loginAdmin: (email: string, passcode: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => void;
  changeAdminCredentials: (
    currentPasscode: string,
    newPasscode?: string,
    newEmail?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  updateSection: <K extends keyof CMSContent>(
    section: K,
    data: CMSContent[K]
  ) => Promise<{ ok: boolean; error?: string }>;
  updateFullContent: (nextContent: CMSContent) => Promise<{ ok: boolean; error?: string }>;
  resetAllContent: () => Promise<{ ok: boolean; error?: string }>;
  uploadImage: (file: File) => Promise<{ ok: boolean; url?: string; error?: string }>;
}

const ADMIN_TOKEN_KEY = 'pjl_cms_admin_token_v1';
const ADMIN_EMAIL_KEY = 'pjl_cms_admin_email_v1';

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<CMSContent>(() => createDefaultCMSContent());
  const [version, setVersion] = useState<string>('1.0.0');
  const [updatedAt, setUpdatedAt] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [serverConnected, setServerConnected] = useState<boolean>(false);
  const [storageInfo, setStorageInfo] = useState<StorageBackendInfo | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRecord[]>([]);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_EMAIL_KEY);
  });
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const refreshCMS = useCallback(async () => {
    try {
      const res = await fetch('/api/cms', { cache: 'no-store' });
      if (res.ok) {
        const payload = (await res.json()) as CMSPayload;
        if (payload && payload.content) {
          setContent(payload.content);
          setVersion(payload.version || '1.0.0');
          setUpdatedAt(payload.updatedAt || new Date().toISOString());
          setServerConnected(true);
        }
      }
    } catch {
      setServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCMS();
  }, [refreshCMS]);

  const refreshMediaAssets = useCallback(async () => {
    if (!adminToken) return;
    try {
      const [mediaRes, storageRes] = await Promise.all([
        fetch('/api/admin/media', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/admin/storage', { headers: { Authorization: `Bearer ${adminToken}` } }),
      ]);
      if (mediaRes.ok) {
        const data = await mediaRes.json();
        if (Array.isArray(data.assets)) setMediaAssets(data.assets);
      }
      if (storageRes.ok) {
        const s = (await storageRes.json()) as StorageBackendInfo;
        setStorageInfo(s);
      }
    } catch {
      // ignore transient network errors
    }
  }, [adminToken]);

  // Validate stored admin session token with backend
  useEffect(() => {
    const verifySession = async () => {
      if (!adminToken) {
        setAuthChecked(true);
        return;
      }
      try {
        const res = await fetch('/api/admin/session', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAdminEmail(data.admin?.email || adminEmail);
            await refreshMediaAssets();
          } else {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_EMAIL_KEY);
            setAdminToken(null);
            setAdminEmail(null);
          }
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(ADMIN_EMAIL_KEY);
          setAdminToken(null);
          setAdminEmail(null);
        }
      } catch {
        // Keep current token on transient network error
      } finally {
        setAuthChecked(true);
      }
    };
    verifySession();
  }, [adminToken, adminEmail, refreshMediaAssets]);

  const loginAdmin = async (
    email: string,
    passcode: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || 'Authentication failed.' };
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_EMAIL_KEY, data.admin.email);
      setAdminToken(data.token);
      setAdminEmail(data.admin.email);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to reach CMS server.' };
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    setAdminToken(null);
    setAdminEmail(null);
  };

  const changeAdminCredentials = async (
    currentPasscode: string,
    newPasscode?: string,
    newEmail?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!adminToken) return { ok: false, error: 'Not authenticated.' };
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ currentPasscode, newPasscode, newEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || 'Failed to update credentials.' };
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_EMAIL_KEY, data.admin.email);
      setAdminToken(data.token);
      setAdminEmail(data.admin.email);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error updating credentials.' };
    }
  };

  const updateSection = async <K extends keyof CMSContent>(
    section: K,
    data: CMSContent[K]
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!adminToken) return { ok: false, error: 'Admin authentication required.' };
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cms/${String(section)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 401) logoutAdmin();
        return { ok: false, error: result.error || 'Failed to save changes.' };
      }
      setContent(result.content);
      setUpdatedAt(result.updatedAt);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to save to CMS server.' };
    } finally {
      setIsSaving(false);
    }
  };

  const updateFullContent = async (
    nextContent: CMSContent
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!adminToken) return { ok: false, error: 'Admin authentication required.' };
    setIsSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ content: nextContent }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 401) logoutAdmin();
        return { ok: false, error: result.error || 'Failed to save CMS payload.' };
      }
      setContent(result.content);
      setUpdatedAt(result.updatedAt);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to save CMS payload.' };
    } finally {
      setIsSaving(false);
    }
  };

  const resetAllContent = async (): Promise<{ ok: boolean; error?: string }> => {
    if (!adminToken) return { ok: false, error: 'Admin authentication required.' };
    setIsSaving(true);
    try {
      const res = await fetch('/api/cms/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || 'Failed to reset CMS.' };
      }
      setContent(result.content);
      setUpdatedAt(result.updatedAt);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error resetting CMS.' };
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (
    file: File
  ): Promise<{ ok: boolean; url?: string; error?: string }> => {
    if (!file.type.startsWith('image/')) {
      return { ok: false, error: 'Please choose a valid image file (PNG, JPG, WEBP, GIF).' };
    }
    if (file.size > 8 * 1024 * 1024) {
      return { ok: false, error: 'Image size must be under 8MB.' };
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });

    if (!adminToken) {
      return { ok: true, url: dataUrl };
    }

    try {
      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      const result = await res.json();
      if (!res.ok || !result.url) {
        return { ok: false, error: result.error || 'Image upload failed.' };
      }
      if (result.asset) {
        setMediaAssets((prev) => [result.asset as MediaAssetRecord, ...prev]);
      }
      return { ok: true, url: result.url };
    } catch {
      return { ok: false, error: 'Network error uploading image.' };
    }
  };

  const deleteMediaAsset = async (
    id: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!adminToken) return { ok: false, error: 'Admin authentication required.' };
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || 'Failed to delete asset.' };
      }
      if (Array.isArray(result.assets)) {
        setMediaAssets(result.assets);
      } else {
        setMediaAssets((prev) => prev.filter((a) => a.id !== id));
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error deleting asset.' };
    }
  };

  return (
    <CMSContext.Provider
      value={{
        content,
        version,
        updatedAt,
        isLoading,
        isSaving,
        serverConnected,
        storageInfo,
        mediaAssets,
        refreshCMS,
        refreshMediaAssets,
        deleteMediaAsset,
        adminToken,
        adminEmail,
        isAuthenticated: Boolean(adminToken),
        authChecked,
        loginAdmin,
        logoutAdmin,
        changeAdminCredentials,
        updateSection,
        updateFullContent,
        resetAllContent,
        uploadImage,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return ctx;
};
