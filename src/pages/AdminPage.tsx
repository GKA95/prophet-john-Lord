import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  Save,
  RefreshCw,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Check,
  LayoutDashboard,
  Database,
  User,
  Images,
  BookOpen,
  Video,
  Calendar,
  FileText,
  MessageSquareQuote,
  Phone,
  Inbox,
  Shield,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Heart,
  CloudUpload,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BUNDLED_ASSET_MAP } from '../components/PortraitPlaceholder';
import type {
  CMSContent,
  CMSSubmissions,
  HeroSlideItem,
  HeroTransitionAnimation,
  HeroImageFitMode,
  MinistryPillar,
  SermonItem,
  EventItem,
  ResourceItem,
  TestimonialItem,
  GivingInitiative,
  SocialLink,
} from '../types';

interface AdminPageProps {
  onExitToSite: () => void;
}

type AdminTab =
  | 'overview'
  | 'profile'
  | 'slides'
  | 'mandates'
  | 'sermons'
  | 'events'
  | 'resources'
  | 'testimonies'
  | 'contact'
  | 'media'
  | 'inbox'
  | 'security';

function extractYouTubeId(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pat of patterns) {
    const m = pat.exec(trimmed);
    if (m && m[1]) return m[1];
  }
  return '';
}

export const AdminPage: React.FC<AdminPageProps> = ({ onExitToSite }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const {
    content,
    version,
    updatedAt,
    isSaving,
    serverConnected,
    storageInfo,
    mediaAssets,
    refreshMediaAssets,
    deleteMediaAsset,
    adminToken,
    adminEmail,
    isAuthenticated,
    authChecked,
    loginAdmin,
    logoutAdmin,
    changeAdminCredentials,
    updateSection,
    updateFullContent,
    resetAllContent,
    uploadImage,
  } = useCMS();

  // Auth Login form state
  const [loginEmail, setLoginEmail] = useState('gideonkwesiansah@gmail.com');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab & draft copy
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [draft, setDraft] = useState<CMSContent>(() => JSON.parse(JSON.stringify(content)));
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [reconnectingMongo, setReconnectingMongo] = useState(false);

  // Submissions inbox state
  const [submissions, setSubmissions] = useState<CMSSubmissions>({
    newsletterSubscribers: [],
    contactSubmissions: [],
    eventRegistrations: [],
  });
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Security tab state
  const [secCurrentPass, setSecCurrentPass] = useState('');
  const [secNewEmail, setSecNewEmail] = useState('');
  const [secNewPass, setSecNewPass] = useState('');
  const [showSecPass, setShowSecPass] = useState(false);
  const [secStatus, setSecStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(content)));
  }, [content]);

  useEffect(() => {
    if (adminEmail) {
      setSecNewEmail(adminEmail);
    }
  }, [adminEmail]);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const fetchSubmissions = useCallback(async () => {
    if (!adminToken) return;
    setLoadingSubmissions(true);
    try {
      const res = await fetch('/api/admin/submissions', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as CMSSubmissions;
        setSubmissions(data);
      }
    } catch {
      // Ignore network hiccup
    } finally {
      setLoadingSubmissions(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (isAuthenticated && (activeTab === 'inbox' || activeTab === 'overview')) {
      fetchSubmissions();
    }
  }, [isAuthenticated, activeTab, fetchSubmissions]);

  const handleSaveSection = async <K extends keyof CMSContent>(section: K, label: string) => {
    const res = await updateSection(section, draft[section]);
    if (res.ok) {
      showToast('success', `${label} saved and published live.`);
    } else {
      showToast('error', res.error || `Failed to save ${label}.`);
    }
  };

  const handleSaveMultiple = async (sections: (keyof CMSContent)[], label: string) => {
    for (const sec of sections) {
      const res = await updateSection(sec, draft[sec]);
      if (!res.ok) {
        showToast('error', res.error || `Failed to save ${sec}.`);
        return;
      }
    }
    showToast('success', `${label} saved and published live.`);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReconnectMongo = async () => {
    if (!adminToken) return;
    setReconnectingMongo(true);
    try {
      const res = await fetch('/api/admin/storage/reconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      await refreshMediaAssets();
      if (res.ok) {
        const s = await res.json();
        if (s.mongoConnected) {
          showToast('success', `Connected to MongoDB (${s.databaseName})!`);
        } else {
          showToast('error', s.mongoError || 'MongoDB authentication failed.');
        }
      }
    } catch {
      showToast('error', 'Unable to reach server to retry MongoDB connection.');
    } finally {
      setReconnectingMongo(false);
    }
  };

  const handleUploadHelper = async (file: File | undefined, onUrl: (url: string) => void) => {
    if (!file) return;
    const res = await uploadImage(file);
    if (res.ok && res.url) {
      onUrl(res.url);
      showToast('success', 'Image uploaded to CMS media store.');
    } else {
      showToast('error', res.error || 'Image upload failed.');
    }
  };

  const handleDeleteSubmission = async (type: 'newsletter' | 'contact' | 'rsvp', id: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/submissions/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const next = (await res.json()) as CMSSubmissions;
        setSubmissions(next);
        showToast('success', 'Submission entry removed.');
      }
    } catch {
      showToast('error', 'Failed to remove submission.');
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify({ version, updatedAt, content }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prophet-john-lord-cms-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const nextContent = parsed?.content ? parsed.content : parsed;
      if (!nextContent || !nextContent.profile) {
        showToast('error', 'Invalid CMS JSON structure.');
        return;
      }
      const res = await updateFullContent(nextContent);
      if (res.ok) {
        showToast('success', 'Full CMS backup imported and published.');
      } else {
        showToast('error', res.error || 'Import failed.');
      }
    } catch {
      showToast('error', 'Could not parse JSON file.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const res = await loginAdmin(loginEmail, loginPasscode);
    setIsLoggingIn(false);
    if (!res.ok) {
      setLoginError(res.error || 'Invalid credentials.');
    } else {
      setLoginPasscode('');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecStatus(null);
    const res = await changeAdminCredentials(
      secCurrentPass,
      secNewPass.trim() || undefined,
      secNewEmail.trim() || undefined
    );
    if (res.ok) {
      setSecCurrentPass('');
      setSecNewPass('');
      setSecStatus({ type: 'success', msg: 'Admin credentials updated successfully.' });
    } else {
      setSecStatus({ type: 'error', msg: res.error || 'Could not update credentials.' });
    }
  };

  // Styles helpers
  const cardCls = isLight
    ? 'bg-white border border-gray-200 shadow-xs'
    : 'bg-[#0A130E] border border-white/10';
  const inputCls = isLight
    ? 'w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 text-base sm:text-sm outline-none focus:border-[#168A45] min-h-[42px]'
    : 'w-full px-3 py-2 border border-white/15 bg-black/60 text-white text-base sm:text-sm outline-none focus:border-[#63D98A] min-h-[42px]';
  const labelCls = `block text-[10px] uppercase tracking-wider font-semibold mb-1 ${
    isLight ? 'text-gray-600' : 'text-white/60'
  }`;

  if (!authChecked) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isLight ? 'bg-[#F8FAF8] text-gray-900' : 'bg-[#050505] text-white'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#168A45]" />
          <span className="text-xs font-mono uppercase tracking-widest opacity-60">
            Verifying CMS Session...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================================
  // RESTRICTED ADMIN LOGIN GATE (NOT LINKED ON FRONT PAGE)
  // =====================================================================
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 ${
          isLight
            ? 'bg-gradient-to-b from-[#EAF5EE] via-[#F8FAF8] to-white text-neutral-900'
            : 'bg-[#050505] text-[#F5F7F5]'
        }`}
      >
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <button
            onClick={onExitToSite}
            className={`px-4 py-2 border text-xs uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
              isLight
                ? 'bg-white border-gray-300 text-gray-800 hover:border-[#168A45]'
                : 'bg-white/5 border-white/15 text-white/80 hover:border-[#63D98A]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#168A45]" />
            <span>Return to Website</span>
          </button>
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className={`p-6 sm:p-10 shadow-2xl relative ${cardCls}`}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#168A45] to-transparent" />
            <div className="text-center space-y-2 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#168A45]/15 border border-[#168A45]/40 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-[#168A45] dark:text-[#63D98A]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold block">
                PRIVATE CONTENT MANAGEMENT SERVICE
              </span>
              <h1 className="font-serif-luxury text-3xl font-normal">
                PROPHET JOHN LORD CMS
              </h1>
              <p className={`text-xs font-light ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                Sign in with your authorized ministry administrator credentials to edit website content and manage submissions.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3 border border-red-500/40 bg-red-500/10 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className={labelCls}>
                  Administrator Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputCls}
                  placeholder="admin@prophetjohnlord.org"
                />
              </div>

              <div>
                <label htmlFor="admin-passcode" className={labelCls}>
                  CMS Passcode
                </label>
                <div className="relative">
                  <input
                    id="admin-passcode"
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    className={`${inputCls} pr-10`}
                    placeholder="Enter admin passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer"
                    aria-label={showLoginPass ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-[#63D98A]" />
                    <span>ENTER ADMIN STUDIO</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono opacity-40">
          Prophet John Lord Ministry • Content Management Portal
        </div>
      </div>
    );
  }

  // =====================================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // =====================================================================
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Bio', icon: <User className="w-4 h-4" /> },
    { id: 'slides', label: 'Hero Slideshow', icon: <Images className="w-4 h-4" /> },
    { id: 'mandates', label: 'Mandates & Pillars', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'sermons', label: 'Sermons & Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'testimonies', label: 'Testimonies & Giving', icon: <Heart className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact & WhatsApp', icon: <Phone className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <CloudUpload className="w-4 h-4" /> },
    { id: 'inbox', label: 'Submissions Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans-clean ${
        isLight ? 'bg-[#F3F6F4] text-neutral-900' : 'bg-[#050505] text-[#F5F7F5]'
      }`}
    >
      {/* Top Admin Bar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isLight ? 'bg-white/95 border-gray-200' : 'bg-[#08100C]/95 border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#168A45] text-white flex items-center justify-center font-serif-luxury font-bold text-xs sm:text-sm shrink-0">
              CMS
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif-luxury text-base sm:text-xl font-medium truncate">
                  Prophet John Lord — Admin CMS
                </h1>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase border shrink-0 ${
                    serverConnected
                      ? 'bg-[#168A45]/15 text-[#168A45] dark:text-[#63D98A] border-[#168A45]/40'
                      : 'bg-amber-500/15 text-amber-500 border-amber-500/40'
                  }`}
                >
                  {serverConnected ? 'LIVE SYNCED' : 'LOCAL MODE'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono opacity-60 truncate">
                {adminEmail} · Updated {new Date(updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={onExitToSite}
              className={`px-2.5 sm:px-3.5 py-2 border text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 min-h-[40px] cursor-pointer transition-colors ${
                isLight
                  ? 'bg-white border-gray-300 hover:border-[#168A45] text-gray-800'
                  : 'bg-white/5 border-white/15 hover:border-[#63D98A] text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#168A45]" />
              <span className="hidden xs:inline sm:inline">View Live Site</span>
              <span className="xs:hidden sm:hidden">Site</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-2.5 sm:px-3.5 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Feedback Banner */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 animate-fade-in">
          <div
            className={`px-4 py-3 border shadow-xl flex items-center gap-2.5 text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-[#0B2418] border-[#63D98A] text-white'
                : 'bg-red-950 border-red-500 text-red-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#63D98A] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1">
        {/* Sidebar Navigation (Horizontal scrollable on mobile, stacked sidebar on desktop) */}
        <aside className="lg:col-span-3 space-y-2 min-w-0">
          <div className={`p-2 flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-none ${cardCls}`}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap shrink-0 lg:w-full px-3.5 py-2.5 text-xs font-medium tracking-wide flex items-center gap-2 sm:gap-2.5 transition-all min-h-[40px] cursor-pointer text-left ${
                  activeTab === t.id
                    ? 'bg-[#168A45] text-white shadow-sm font-semibold'
                    : isLight
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Editor Workspace */}
        <main className="lg:col-span-9 space-y-6 min-w-0">
          {/* ==================== 1. OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'Hero Slides', count: content.heroSlides.length },
                  { label: 'Pillars', count: content.pillars.length },
                  { label: 'Sermons', count: content.sermons.length },
                  { label: 'Events', count: content.events.length },
                  { label: 'Resources', count: content.resources.length },
                  { label: 'Testimonies', count: content.testimonials.length },
                ].map((stat) => (
                  <div key={stat.label} className={`p-4 text-center ${cardCls}`}>
                    <div className="font-serif-luxury text-3xl text-[#168A45] dark:text-[#63D98A]">
                      {stat.count}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-mono opacity-60 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* MongoDB & Cloudinary Storage Overview */}
              <div className={`p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 ${cardCls}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#168A45]/10 border border-[#168A45]/30 text-[#168A45] dark:text-[#63D98A]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                      Database Backend
                    </div>
                    <div className="text-sm font-semibold">
                      {storageInfo?.mongoConnected
                        ? `MongoDB (${storageInfo.databaseName})`
                        : 'Local Persistence (MongoDB Ready)'}
                    </div>
                    <p className="text-[11px] opacity-65 mt-0.5">
                      {storageInfo?.mongoConnected
                        ? 'CMS content, submissions, media catalog & admin auth persisted in MongoDB.'
                        : 'Set MONGODB_URI in environment secrets to switch CMS storage to MongoDB.'}
                    </p>
                    {!storageInfo?.mongoConnected && (
                      <div className="mt-2 space-y-2">
                        {storageInfo?.mongoError && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                            Connection note: {storageInfo.mongoError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleReconnectMongo}
                          disabled={reconnectingMongo}
                          className="px-3 py-1.5 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] hover:bg-[#168A45]/10 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${reconnectingMongo ? 'animate-spin' : ''}`} />
                          <span>{reconnectingMongo ? 'Testing Connection...' : 'Retry MongoDB Connection'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#168A45]/10 border border-[#168A45]/30 text-[#168A45] dark:text-[#63D98A]">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                      Media Storage Provider
                    </div>
                    <div className="text-sm font-semibold">
                      {storageInfo?.cloudinaryConfigured
                        ? `Cloudinary CDN (${storageInfo.cloudinaryFolder})`
                        : 'Local Media Folder (Cloudinary Ready)'}
                    </div>
                    <p className="text-[11px] opacity-65 mt-0.5">
                      {storageInfo?.cloudinaryConfigured
                        ? 'Image uploads automatically upload to Cloudinary CDN and catalog in DB.'
                        : 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY & CLOUDINARY_API_SECRET in secrets.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup / Import / Reset */}
              <div className={`p-6 space-y-4 ${cardCls}`}>
                <h3 className="font-serif-luxury text-xl font-medium">
                  Content Backup & Factory Reset
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#63D98A]" />
                    <span>Export Backup</span>
                  </button>

                  <label
                    className={`px-4 py-2.5 border text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
                      isLight
                        ? 'bg-white border-gray-300 hover:border-[#168A45]'
                        : 'bg-white/5 border-white/15 hover:border-[#63D98A]'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-[#168A45]" />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => handleImportJson(e.target.files?.[0])}
                    />
                  </label>

                  {!confirmReset ? (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="px-4 py-2.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer ml-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset to Defaults</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-red-500 font-medium">Confirm factory reset?</span>
                      <button
                        onClick={async () => {
                          const res = await resetAllContent();
                          setConfirmReset(false);
                          if (res.ok) showToast('success', 'CMS reset to initial defaults.');
                          else showToast('error', res.error || 'Reset failed.');
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold uppercase cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="px-3 py-1.5 border border-gray-400 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. PROFILE & BIO ==================== */}
          {activeTab === 'profile' && (
            <div className={`p-6 space-y-6 ${cardCls}`}>
              <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-medium">
                    Ministry Identity, Biography & Core Tenets
                  </h2>
                  <p className="text-xs opacity-60">Powers Hero headline, About Page, Footer, and Give Page</p>
                </div>
                <button
                  onClick={() => handleSaveMultiple(['profile', 'coreTenets'], 'Profile & Tenets')}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#63D98A]" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    className={inputCls}
                    value={draft.profile.name}
                    onChange={(e) =>
                      setDraft({ ...draft, profile: { ...draft.profile, name: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Short Name</label>
                  <input
                    className={inputCls}
                    value={draft.profile.shortName}
                    onChange={(e) =>
                      setDraft({ ...draft, profile: { ...draft.profile, shortName: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Honorific</label>
                  <input
                    className={inputCls}
                    value={draft.profile.honorific}
                    onChange={(e) =>
                      setDraft({ ...draft, profile: { ...draft.profile, honorific: e.target.value } })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Main Tagline</label>
                  <input
                    className={inputCls}
                    value={draft.profile.tagline}
                    onChange={(e) =>
                      setDraft({ ...draft, profile: { ...draft.profile, tagline: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Sub-Tagline</label>
                  <input
                    className={inputCls}
                    value={draft.profile.subTagline}
                    onChange={(e) =>
                      setDraft({ ...draft, profile: { ...draft.profile, subTagline: e.target.value } })
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Editorial Introduction</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={draft.profile.introduction}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, introduction: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className={labelCls}>Full Biography (Separate paragraphs with blank line)</label>
                <textarea
                  rows={10}
                  className={inputCls}
                  value={draft.profile.biography}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, biography: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['calling', 'vision', 'mission', 'ministry'] as const).map((subKey) => (
                  <div key={subKey}>
                    <label className={labelCls}>Home Card · {subKey}</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={draft.profile.subsections[subKey]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          profile: {
                            ...draft.profile,
                            subsections: {
                              ...draft.profile.subsections,
                              [subKey]: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Footer Ministry Description</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={draft.profile.ministryDescription}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profile: { ...draft.profile, ministryDescription: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Giving Scripture / Message</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={draft.profile.givingMessage}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profile: { ...draft.profile, givingMessage: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Portraits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-white/10">
                <div className="space-y-2">
                  <label className={labelCls}>Official Portrait (Hero / Primary)</label>
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      value={draft.profile.officialPortrait}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          profile: {
                            ...draft.profile,
                            officialPortrait: e.target.value,
                            officialPortraitUrl: e.target.value,
                          },
                        })
                      }
                    />
                    <label className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadHelper(e.target.files?.[0], (url) =>
                            setDraft((prev: CMSContent) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                officialPortrait: url,
                                officialPortraitUrl: url,
                              },
                            }))
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Secondary Portrait (About Section)</label>
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      value={draft.profile.secondPortrait}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          profile: {
                            ...draft.profile,
                            secondPortrait: e.target.value,
                            secondPortraitUrl: e.target.value,
                          },
                        })
                      }
                    />
                    <label className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadHelper(e.target.files?.[0], (url) =>
                            setDraft((prev: CMSContent) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                secondPortrait: url,
                                secondPortraitUrl: url,
                              },
                            }))
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Core Tenets */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Core Tenets of Leadership</label>
                  <button
                    onClick={() =>
                      setDraft({ ...draft, coreTenets: [...draft.coreTenets, 'New Ministerial Tenet'] })
                    }
                    className="px-2.5 py-1 bg-[#168A45] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Tenet
                  </button>
                </div>
                {draft.coreTenets.map((tenet, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className={inputCls}
                      value={tenet}
                      onChange={(e) => {
                        const next = [...draft.coreTenets];
                        next[idx] = e.target.value;
                        setDraft({ ...draft, coreTenets: next });
                      }}
                    />
                    <button
                      onClick={() =>
                        setDraft({
                          ...draft,
                          coreTenets: draft.coreTenets.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-2 text-red-500 border border-red-500/30 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 3. HERO SLIDESHOW ==================== */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              {/* Hero Timing, Piece Animation & Image Fit Controls */}
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">
                      Hero Timing, Animation &amp; Framing
                    </h2>
                    <p className="text-xs opacity-60">
                      Control how often hero photos rotate, how they cut into pieces &amp; join, and how they fit the hero canvas.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSaveMultiple(
                        ['heroSlides', 'heroSettings'],
                        'Hero Slideshow & Timing'
                      )
                    }
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#63D98A]" />
                    <span>{isSaving ? 'Saving...' : 'Save Hero Settings & Slides'}</span>
                  </button>
                </div>

                {(() => {
                  const hs = draft.heroSettings || {
                    intervalSeconds: 180,
                    animationDurationMs: 2600,
                    transitionAnimation: 'mosaic-tiles' as HeroTransitionAnimation,
                    imageFitMode: 'fill-stretch' as HeroImageFitMode,
                  };
                  const currentSeconds = Math.max(3, Number(hs.intervalSeconds) || 180);
                  const mins = Math.floor(currentSeconds / 60);
                  const secs = currentSeconds % 60;
                  const animMs = Math.min(8000, Math.max(600, Number(hs.animationDurationMs) || 2600));
                  const animSecondsLabel = (animMs / 1000).toFixed(1);
                  const speedLabel =
                    animMs <= 1200
                      ? 'Fast'
                      : animMs <= 2100
                        ? 'Moderate'
                        : animMs <= 3400
                          ? 'Slow & Graceful'
                          : 'Very Slow & Majestic';

                  const presets = [
                    { label: '10s (Test)', value: 10 },
                    { label: '30s', value: 30 },
                    { label: '1 min', value: 60 },
                    { label: '3 min (Default)', value: 180 },
                    { label: '5 min', value: 300 },
                  ];

                  const speedPresets = [
                    { label: 'Fast (1.0s)', value: 1000 },
                    { label: 'Medium (1.8s)', value: 1800 },
                    { label: 'Slow (2.6s)', value: 2600 },
                    { label: 'Very Slow (4.0s)', value: 4000 },
                    { label: 'Majestic (5.5s)', value: 5500 },
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Timing Control */}
                      <div className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className={`${labelCls} mb-0 flex items-center gap-1.5`}>
                            <Clock className="w-3.5 h-3.5 text-[#168A45]" />
                            <span>Slide Change Timing</span>
                          </label>
                          <span className="text-[11px] font-mono text-[#168A45] dark:text-[#63D98A] font-semibold">
                            {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] opacity-60 mb-1">Minutes</label>
                            <input
                              type="number"
                              min={0}
                              max={60}
                              className={inputCls}
                              value={mins}
                              onChange={(e) => {
                                const nextMins = Math.max(0, Number(e.target.value) || 0);
                                const total = Math.max(3, nextMins * 60 + secs);
                                setDraft({
                                  ...draft,
                                  heroSettings: { ...hs, intervalSeconds: total },
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] opacity-60 mb-1">Seconds</label>
                            <input
                              type="number"
                              min={0}
                              max={59}
                              className={inputCls}
                              value={secs}
                              onChange={(e) => {
                                const nextSecs = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                                const total = Math.max(3, mins * 60 + nextSecs);
                                setDraft({
                                  ...draft,
                                  heroSettings: { ...hs, intervalSeconds: total },
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {presets.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  heroSettings: { ...hs, intervalSeconds: p.value },
                                })
                              }
                              className={`px-2 py-1 text-[10px] font-mono border cursor-pointer transition-colors ${
                                currentSeconds === p.value
                                  ? 'bg-[#168A45] text-white border-[#168A45]'
                                  : 'border-gray-300 dark:border-white/15 opacity-75 hover:opacity-100'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Animation Speed Control (Fast <-> Slow) */}
                      <div className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className={`${labelCls} mb-0 flex items-center gap-1.5`}>
                            <Sparkles className="w-3.5 h-3.5 text-[#168A45]" />
                            <span>Animation Speed (Fast ↔ Slow)</span>
                          </label>
                          <span className="text-[11px] font-mono text-[#168A45] dark:text-[#63D98A] font-semibold">
                            {animSecondsLabel}s · {speedLabel}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <input
                            type="range"
                            min={800}
                            max={6000}
                            step={200}
                            value={animMs}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                heroSettings: {
                                  ...hs,
                                  animationDurationMs: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full accent-[#168A45] cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] font-mono opacity-55">
                            <span>0.8s (Fast)</span>
                            <span>2.6s (Default Slow)</span>
                            <span>6.0s (Ultra Slow)</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {speedPresets.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  heroSettings: { ...hs, animationDurationMs: p.value },
                                })
                              }
                              className={`px-2 py-1 text-[10px] font-mono border cursor-pointer transition-colors ${
                                animMs === p.value
                                  ? 'bg-[#168A45] text-white border-[#168A45]'
                                  : 'border-gray-300 dark:border-white/15 opacity-75 hover:opacity-100'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cut-Piece Animation Selector */}
                      <div className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                        <label className={labelCls}>Incoming Image Animation</label>
                        <select
                          className={inputCls}
                          value={hs.transitionAnimation}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              heroSettings: {
                                ...hs,
                                transitionAnimation: e.target.value as HeroTransitionAnimation,
                              },
                            })
                          }
                        >
                          <option value="mosaic-tiles">
                            Cut into Pieces &amp; Join (15 Mosaic Tiles)
                          </option>
                          <option value="vertical-blinds">
                            Vertical Strips Join (8 Columns)
                          </option>
                          <option value="diagonal-slices">
                            Horizontal Ribbons Join (6 Bands)
                          </option>
                          <option value="cinematic-fade">
                            Smooth Cinematic Fade
                          </option>
                        </select>
                        <p className="text-[11px] opacity-65 leading-relaxed">
                          Each incoming slide splits cleanly and glides together at the selected speed to form one seamless portrait.
                        </p>
                      </div>

                      {/* Image Fit / Framing Selector */}
                      <div className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                        <label className={labelCls}>Hero Image Fit &amp; Framing</label>
                        <select
                          className={inputCls}
                          value={hs.imageFitMode || 'fill-stretch'}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              heroSettings: {
                                ...hs,
                                imageFitMode: e.target.value as HeroImageFitMode,
                              },
                            })
                          }
                        >
                          <option value="fill-stretch">
                            Auto-Stretch Full Hero Fit (Fits Any Image — Default)
                          </option>
                          <option value="cover-upper">
                            Smart Portrait Fit (Upper Focus)
                          </option>
                          <option value="cover-top">
                            Top Aligned Full-Bleed Fit
                          </option>
                          <option value="cover-center">
                            Center Full-Bleed Fit
                          </option>
                          <option value="contain-backdrop">
                            Full Uncropped Image + Blurred Backdrop
                          </option>
                        </select>
                        <p className="text-[11px] opacity-65 leading-relaxed">
                          Any image size or aspect ratio automatically stretches edge-to-edge to fill the entire hero section cleanly.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Hero Slides List */}
              <div className={`p-6 space-y-6 ${cardCls}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">
                      Hero Background Photos ({draft.heroSlides.length})
                    </h2>
                    <p className="text-xs opacity-60">
                      Photos cycle full-bleed across the hero section without caption boxes obstructing the portrait.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newSlide: HeroSlideItem = {
                          id: `slide-${Date.now()}`,
                          src: '/images/prophet-john-lord.jpg',
                          remoteUrl: '',
                          title: `Hero Slide ${draft.heroSlides.length + 1}`,
                          subtitle: 'Prophetic & Apostolic Mandate',
                          scripture: 'Jeremiah 1:10',
                        };
                        setDraft({ ...draft, heroSlides: [...draft.heroSlides, newSlide] });
                      }}
                      className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Slide
                    </button>
                    <button
                      onClick={() =>
                        handleSaveMultiple(
                          ['heroSlides', 'heroSettings'],
                          'Hero Slideshow & Timing'
                        )
                      }
                      disabled={isSaving}
                      className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#63D98A]" />
                      <span>{isSaving ? 'Saving...' : 'Save Slides'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {draft.heroSlides.map((slide, idx) => {
                    const previewSrc =
                      BUNDLED_ASSET_MAP[slide.src] || slide.src || slide.remoteUrl;
                    const fitMode = draft.heroSettings?.imageFitMode || 'fill-stretch';
                    const previewFitCls =
                      fitMode === 'fill-stretch'
                        ? 'object-fill'
                        : fitMode === 'cover-top'
                          ? 'object-cover object-top'
                          : fitMode === 'cover-center'
                            ? 'object-cover object-center'
                            : fitMode === 'contain-backdrop'
                              ? 'object-contain object-center'
                              : 'object-cover object-[center_18%]';

                    return (
                      <div
                        key={slide.id}
                        className="p-4 border border-gray-200 dark:border-white/10 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-[#168A45] dark:text-[#63D98A] font-semibold">
                            SLIDE #{idx + 1} {slide.title ? `· ${slide.title}` : ''}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                const next = [...draft.heroSlides];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                setDraft({ ...draft, heroSlides: next });
                              }}
                              className="p-1.5 border border-gray-300 dark:border-white/15 disabled:opacity-30 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === draft.heroSlides.length - 1}
                              onClick={() => {
                                const next = [...draft.heroSlides];
                                [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                                setDraft({ ...draft, heroSlides: next });
                              }}
                              className="p-1.5 border border-gray-300 dark:border-white/15 disabled:opacity-30 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  heroSlides: draft.heroSlides.filter((_, i) => i !== idx),
                                })
                              }
                              className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Live Hero Framing Preview */}
                          <div className="md:col-span-4 aspect-video bg-[#040B07] border border-white/10 relative overflow-hidden">
                            {fitMode === 'contain-backdrop' && previewSrc && (
                              <img
                                src={previewSrc}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-45"
                              />
                            )}
                            {previewSrc ? (
                              <img
                                src={previewSrc}
                                alt={slide.title || `Slide ${idx + 1}`}
                                className={`relative w-full h-full ${previewFitCls}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[11px] opacity-50">
                                No image selected
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
                          </div>

                          {/* Upload & Labeling Fields */}
                          <div className="md:col-span-8 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>Internal Label / Alt Text</label>
                                <input
                                  className={inputCls}
                                  value={slide.title}
                                  onChange={(e) => {
                                    const next = [...draft.heroSlides];
                                    next[idx] = { ...slide, title: e.target.value };
                                    setDraft({ ...draft, heroSlides: next });
                                  }}
                                />
                              </div>
                              <div>
                                <label className={labelCls}>Fallback Remote URL</label>
                                <input
                                  className={inputCls}
                                  value={slide.remoteUrl}
                                  onChange={(e) => {
                                    const next = [...draft.heroSlides];
                                    next[idx] = { ...slide, remoteUrl: e.target.value };
                                    setDraft({ ...draft, heroSlides: next });
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <label className={labelCls}>Primary Image URL / Upload to Cloudinary</label>
                              <div className="flex gap-2">
                                <input
                                  className={inputCls}
                                  value={slide.src}
                                  onChange={(e) => {
                                    const next = [...draft.heroSlides];
                                    next[idx] = { ...slide, src: e.target.value };
                                    setDraft({ ...draft, heroSlides: next });
                                  }}
                                />
                                <label className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleUploadHelper(e.target.files?.[0], (url) =>
                                        setDraft((prev: CMSContent) => {
                                          const next = [...prev.heroSlides];
                                          next[idx] = { ...next[idx], src: url, remoteUrl: url };
                                          return { ...prev, heroSlides: next };
                                        })
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 4. MANDATES & PILLARS ==================== */}
          {activeTab === 'mandates' && (
            <div className="space-y-6">
              {/* Core Mandates */}
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">
                      Foundational Mandates (01–04)
                    </h2>
                    <p className="text-xs opacity-60">My Calling, Our Vision, Our Mission, Our Ministry Scope</p>
                  </div>
                  <button
                    onClick={() => handleSaveSection('coreMandates', 'Core Mandates')}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#63D98A]" />
                    <span>Save Mandates</span>
                  </button>
                </div>

                {draft.coreMandates.map((m, idx) => (
                  <div key={m.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Title ({m.number})</label>
                        <input
                          className={inputCls}
                          value={m.title}
                          onChange={(e) => {
                            const next = [...draft.coreMandates];
                            next[idx] = { ...m, title: e.target.value };
                            setDraft({ ...draft, coreMandates: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Badge</label>
                        <input
                          className={inputCls}
                          value={m.badge}
                          onChange={(e) => {
                            const next = [...draft.coreMandates];
                            next[idx] = { ...m, badge: e.target.value };
                            setDraft({ ...draft, coreMandates: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Scripture Anchor</label>
                        <input
                          className={inputCls}
                          value={m.scriptureReference}
                          onChange={(e) => {
                            const next = [...draft.coreMandates];
                            next[idx] = { ...m, scriptureReference: e.target.value };
                            setDraft({ ...draft, coreMandates: next });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Summary</label>
                      <input
                        className={inputCls}
                        value={m.summary}
                        onChange={(e) => {
                          const next = [...draft.coreMandates];
                          next[idx] = { ...m, summary: e.target.value };
                          setDraft({ ...draft, coreMandates: next });
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Detailed Paragraphs (separated by blank line)</label>
                      <textarea
                        rows={4}
                        className={inputCls}
                        value={m.paragraphs.join('\n\n')}
                        onChange={(e) => {
                          const next = [...draft.coreMandates];
                          next[idx] = {
                            ...m,
                            paragraphs: e.target.value.split('\n\n').map((p) => p.trim()).filter(Boolean),
                          };
                          setDraft({ ...draft, coreMandates: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Ministry Pillars */}
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">Ministry Pillars</h2>
                    <p className="text-xs opacity-60">Displayed on Home Page and The Ministry page</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const num = String(draft.pillars.length + 1).padStart(2, '0');
                        const nextPillar: MinistryPillar = {
                          id: `pillar-${Date.now()}`,
                          number: num,
                          title: 'New Pillar',
                          subtitle: 'Ministry Expression',
                          description: 'Description of this ministry pillar.',
                          scriptureReference: 'Matthew 28:19',
                          keyInitiatives: ['Global Outreach', 'Prayer Network'],
                        };
                        setDraft({ ...draft, pillars: [...draft.pillars, nextPillar] });
                      }}
                      className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Pillar
                    </button>
                    <button
                      onClick={() => handleSaveSection('pillars', 'Ministry Pillars')}
                      disabled={isSaving}
                      className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#63D98A]" />
                      <span>Save Pillars</span>
                    </button>
                  </div>
                </div>

                {draft.pillars.map((p, idx) => (
                  <div key={p.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-[#168A45] font-semibold">
                        PILLAR {p.number}
                      </span>
                      <button
                        onClick={() =>
                          setDraft({ ...draft, pillars: draft.pillars.filter((_, i) => i !== idx) })
                        }
                        className="p-1.5 text-red-500 border border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className={labelCls}>Number</label>
                        <input
                          className={inputCls}
                          value={p.number}
                          onChange={(e) => {
                            const next = [...draft.pillars];
                            next[idx] = { ...p, number: e.target.value };
                            setDraft({ ...draft, pillars: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          className={inputCls}
                          value={p.title}
                          onChange={(e) => {
                            const next = [...draft.pillars];
                            next[idx] = { ...p, title: e.target.value };
                            setDraft({ ...draft, pillars: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Subtitle</label>
                        <input
                          className={inputCls}
                          value={p.subtitle}
                          onChange={(e) => {
                            const next = [...draft.pillars];
                            next[idx] = { ...p, subtitle: e.target.value };
                            setDraft({ ...draft, pillars: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Scripture</label>
                        <input
                          className={inputCls}
                          value={p.scriptureReference}
                          onChange={(e) => {
                            const next = [...draft.pillars];
                            next[idx] = { ...p, scriptureReference: e.target.value };
                            setDraft({ ...draft, pillars: next });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={p.description}
                        onChange={(e) => {
                          const next = [...draft.pillars];
                          next[idx] = { ...p, description: e.target.value };
                          setDraft({ ...draft, pillars: next });
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Key Initiatives (comma-separated)</label>
                      <input
                        className={inputCls}
                        value={p.keyInitiatives.join(', ')}
                        onChange={(e) => {
                          const next = [...draft.pillars];
                          next[idx] = {
                            ...p,
                            keyInitiatives: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          };
                          setDraft({ ...draft, pillars: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 5. SERMONS & VIDEOS ==================== */}
          {activeTab === 'sermons' && (
            <div className={`p-6 space-y-6 ${cardCls}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-medium">Sermons & YouTube Broadcasts</h2>
                  <p className="text-xs opacity-60">Paste a YouTube link to auto-extract video ID & thumbnail</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const next: SermonItem = {
                        id: `sermon-${Date.now()}`,
                        title: 'New Prophetic Broadcast',
                        description: 'Teachings and prophetic revelation from Prophet John Lord.',
                        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                        videoUrl: 'https://www.youtube.com/watch?v=',
                        youtubeId: '',
                        date: 'Recent Broadcast',
                        category: 'Prophetic Direction',
                        duration: 'Prophetic Word',
                        scripture: 'Jeremiah 1:10',
                      };
                      setDraft({ ...draft, sermons: [next, ...draft.sermons] });
                    }}
                    className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Sermon
                  </button>
                  <button
                    onClick={() => handleSaveSection('sermons', 'Sermons')}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#63D98A]" />
                    <span>{isSaving ? 'Saving...' : 'Save Sermons'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {draft.sermons.map((s, idx) => (
                  <div key={s.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#168A45] font-semibold">
                        SERMON #{idx + 1} {idx === 0 ? '(FEATURED HERO VIDEO)' : ''}
                      </span>
                      <button
                        onClick={() =>
                          setDraft({ ...draft, sermons: draft.sermons.filter((_, i) => i !== idx) })
                        }
                        className="p-1.5 text-red-500 border border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          className={inputCls}
                          value={s.title}
                          onChange={(e) => {
                            const next = [...draft.sermons];
                            next[idx] = { ...s, title: e.target.value };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>YouTube Watch URL or Video ID</label>
                        <input
                          className={inputCls}
                          value={s.videoUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            const ytId = extractYouTubeId(url);
                            const next = [...draft.sermons];
                            next[idx] = {
                              ...s,
                              videoUrl: url,
                              youtubeId: ytId || s.youtubeId,
                              thumbnail: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : s.thumbnail,
                            };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className={labelCls}>Category</label>
                        <input
                          className={inputCls}
                          value={s.category}
                          onChange={(e) => {
                            const next = [...draft.sermons];
                            next[idx] = { ...s, category: e.target.value };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Date Label</label>
                        <input
                          className={inputCls}
                          value={s.date}
                          onChange={(e) => {
                            const next = [...draft.sermons];
                            next[idx] = { ...s, date: e.target.value };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Duration / Label</label>
                        <input
                          className={inputCls}
                          value={s.duration}
                          onChange={(e) => {
                            const next = [...draft.sermons];
                            next[idx] = { ...s, duration: e.target.value };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Scripture</label>
                        <input
                          className={inputCls}
                          value={s.scripture || ''}
                          onChange={(e) => {
                            const next = [...draft.sermons];
                            next[idx] = { ...s, scripture: e.target.value };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Thumbnail URL / Upload</label>
                        <div className="flex gap-2">
                          <input
                            className={inputCls}
                            value={s.thumbnail}
                            onChange={(e) => {
                              const next = [...draft.sermons];
                              next[idx] = { ...s, thumbnail: e.target.value };
                              setDraft({ ...draft, sermons: next });
                            }}
                          />
                          <label className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleUploadHelper(e.target.files?.[0], (url) =>
                                  setDraft((prev: CMSContent) => {
                                    const next = [...prev.sermons];
                                    next[idx] = { ...next[idx], thumbnail: url };
                                    return { ...prev, sermons: next };
                                  })
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>YouTube Video ID</label>
                        <input
                          className={inputCls}
                          value={s.youtubeId || ''}
                          onChange={(e) => {
                            const next = [...draft.sermons];
                            next[idx] = { ...s, youtubeId: e.target.value };
                            setDraft({ ...draft, sermons: next });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={s.description}
                        onChange={(e) => {
                          const next = [...draft.sermons];
                          next[idx] = { ...s, description: e.target.value };
                          setDraft({ ...draft, sermons: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 6. EVENTS ==================== */}
          {activeTab === 'events' && (
            <div className={`p-6 space-y-6 ${cardCls}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-medium">Events & Gatherings</h2>
                  <p className="text-xs opacity-60">Publish new crusades, prayer summits, and upload event flyers</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const nextEvt: EventItem = {
                        id: `evt-${Date.now()}`,
                        title: 'New Ministry Convocation',
                        date: 'Upcoming Date',
                        time: '6:00 PM GMT',
                        location: 'Accra, Ghana',
                        description: 'Join Prophet John Lord for a supernatural encounter.',
                        category: 'Prophetic Convocation',
                        registrationOpen: true,
                        speaker: 'Prophet John Lord',
                        image: '/images/prophet-portrait.png',
                      };
                      setDraft({ ...draft, events: [nextEvt, ...draft.events] });
                    }}
                    className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Event
                  </button>
                  <button
                    onClick={() => handleSaveSection('events', 'Events')}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#63D98A]" />
                    <span>{isSaving ? 'Saving...' : 'Save Events'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {draft.events.map((evt, idx) => (
                  <div key={evt.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#168A45] font-semibold">
                        EVENT #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={evt.registrationOpen}
                            onChange={(e) => {
                              const next = [...draft.events];
                              next[idx] = { ...evt, registrationOpen: e.target.checked };
                              setDraft({ ...draft, events: next });
                            }}
                          />
                          <span>Registration Open</span>
                        </label>
                        <button
                          onClick={() =>
                            setDraft({ ...draft, events: draft.events.filter((_, i) => i !== idx) })
                          }
                          className="p-1.5 text-red-500 border border-red-500/30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Event Title</label>
                        <input
                          className={inputCls}
                          value={evt.title}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, title: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <input
                          className={inputCls}
                          value={evt.category}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, category: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Date</label>
                        <input
                          className={inputCls}
                          value={evt.date}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, date: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Time</label>
                        <input
                          className={inputCls}
                          value={evt.time}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, time: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input
                          className={inputCls}
                          value={evt.location}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, location: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Speaker / Minister</label>
                        <input
                          className={inputCls}
                          value={evt.speaker || ''}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, speaker: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Theme / Scripture</label>
                        <input
                          className={inputCls}
                          value={evt.themeOrScripture || ''}
                          onChange={(e) => {
                            const next = [...draft.events];
                            next[idx] = { ...evt, themeOrScripture: e.target.value };
                            setDraft({ ...draft, events: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Flyer Image / Upload</label>
                        <div className="flex gap-2">
                          <input
                            className={inputCls}
                            value={evt.image || ''}
                            onChange={(e) => {
                              const next = [...draft.events];
                              next[idx] = { ...evt, image: e.target.value };
                              setDraft({ ...draft, events: next });
                            }}
                          />
                          <label className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleUploadHelper(e.target.files?.[0], (url) =>
                                  setDraft((prev: CMSContent) => {
                                    const next = [...prev.events];
                                    next[idx] = { ...next[idx], image: url };
                                    return { ...prev, events: next };
                                  })
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Venue Access Details</label>
                      <input
                        className={inputCls}
                        value={evt.venueDetails || ''}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...evt, venueDetails: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Event Description</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={evt.description}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...evt, description: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 7. RESOURCES ==================== */}
          {activeTab === 'resources' && (
            <div className={`p-6 space-y-6 ${cardCls}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-medium">Ministry Resources & Books</h2>
                  <p className="text-xs opacity-60">Books, Devotionals, Audio Series, and Study Guides</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const nextRes: ResourceItem = {
                        id: `res-${Date.now()}`,
                        title: 'New Kingdom Resource',
                        type: 'Book',
                        description: 'Anointed teaching and spiritual study material.',
                        format: 'Hardcover & Digital PDF',
                        author: 'Prophet John Lord',
                        pagesOrDuration: '180 Pages',
                        coverImage: '/images/prophet-portrait.png',
                      };
                      setDraft({ ...draft, resources: [...draft.resources, nextRes] });
                    }}
                    className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Resource
                  </button>
                  <button
                    onClick={() => handleSaveSection('resources', 'Resources')}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#63D98A]" />
                    <span>{isSaving ? 'Saving...' : 'Save Resources'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {draft.resources.map((res, idx) => (
                  <div key={res.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#168A45] font-semibold">
                        RESOURCE #{idx + 1}
                      </span>
                      <button
                        onClick={() =>
                          setDraft({ ...draft, resources: draft.resources.filter((_, i) => i !== idx) })
                        }
                        className="p-1.5 text-red-500 border border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          className={inputCls}
                          value={res.title}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, title: e.target.value };
                            setDraft({ ...draft, resources: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Type</label>
                        <select
                          className={inputCls}
                          value={res.type}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, type: e.target.value as ResourceItem['type'] };
                            setDraft({ ...draft, resources: next });
                          }}
                        >
                          <option value="Book">Book</option>
                          <option value="Devotional">Devotional</option>
                          <option value="Audio Series">Audio Series</option>
                          <option value="Study Guide">Study Guide</option>
                          <option value="Teaching">Teaching</option>
                          <option value="Article">Article</option>
                          <option value="Download">Download</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Author</label>
                        <input
                          className={inputCls}
                          value={res.author}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, author: e.target.value };
                            setDraft({ ...draft, resources: next });
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Format</label>
                        <input
                          className={inputCls}
                          value={res.format}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, format: e.target.value };
                            setDraft({ ...draft, resources: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Pages / Duration</label>
                        <input
                          className={inputCls}
                          value={res.pagesOrDuration || ''}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, pagesOrDuration: e.target.value };
                            setDraft({ ...draft, resources: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Download URL</label>
                        <input
                          className={inputCls}
                          value={res.downloadUrl || ''}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, downloadUrl: e.target.value };
                            setDraft({ ...draft, resources: next });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Cover Image URL / Upload</label>
                      <div className="flex gap-2">
                        <input
                          className={inputCls}
                          value={res.coverImage || ''}
                          onChange={(e) => {
                            const next = [...draft.resources];
                            next[idx] = { ...res, coverImage: e.target.value };
                            setDraft({ ...draft, resources: next });
                          }}
                        />
                        <label className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleUploadHelper(e.target.files?.[0], (url) =>
                                setDraft((prev: CMSContent) => {
                                  const next = [...prev.resources];
                                  next[idx] = { ...next[idx], coverImage: url };
                                  return { ...prev, resources: next };
                                })
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={res.description}
                        onChange={(e) => {
                          const next = [...draft.resources];
                          next[idx] = { ...res, description: e.target.value };
                          setDraft({ ...draft, resources: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 8. TESTIMONIES & GIVING ==================== */}
          {activeTab === 'testimonies' && (
            <div className="space-y-6">
              {/* Testimonials */}
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">Testimonies</h2>
                    <p className="text-xs opacity-60">Displayed in the Home Page testimony carousel</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const next: TestimonialItem = {
                          id: `t-${Date.now()}`,
                          quote: 'God intervened miraculously during prayer.',
                          name: 'Partner Name',
                          location: 'Accra, Ghana',
                          category: 'Healing & Restoration',
                        };
                        setDraft({ ...draft, testimonials: [...draft.testimonials, next] });
                      }}
                      className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Testimony
                    </button>
                    <button
                      onClick={() => handleSaveSection('testimonials', 'Testimonies')}
                      disabled={isSaving}
                      className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#63D98A]" />
                      <span>Save Testimonies</span>
                    </button>
                  </div>
                </div>

                {draft.testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-[#168A45] font-semibold flex items-center gap-1">
                        <MessageSquareQuote className="w-3.5 h-3.5" /> TESTIMONY #{idx + 1}
                      </span>
                      <button
                        onClick={() =>
                          setDraft({
                            ...draft,
                            testimonials: draft.testimonials.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1.5 text-red-500 border border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Name</label>
                        <input
                          className={inputCls}
                          value={t.name}
                          onChange={(e) => {
                            const next = [...draft.testimonials];
                            next[idx] = { ...t, name: e.target.value };
                            setDraft({ ...draft, testimonials: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input
                          className={inputCls}
                          value={t.location}
                          onChange={(e) => {
                            const next = [...draft.testimonials];
                            next[idx] = { ...t, location: e.target.value };
                            setDraft({ ...draft, testimonials: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <input
                          className={inputCls}
                          value={t.category}
                          onChange={(e) => {
                            const next = [...draft.testimonials];
                            next[idx] = { ...t, category: e.target.value };
                            setDraft({ ...draft, testimonials: next });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Quote</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={t.quote}
                        onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[idx] = { ...t, quote: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Giving Initiatives & MTN MoMo */}
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">
                      Giving Initiatives & MTN MoMo Settings
                    </h2>
                    <p className="text-xs opacity-60">Controls Give Page cards and Partner Modal giving options</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const nextInit: GivingInitiative = {
                          id: `fund-${Date.now()}`,
                          title: 'New Kingdom Initiative',
                          badge: 'KINGDOM SEED',
                          description: 'Supporting ministry expansion and outreach.',
                        };
                        setDraft({
                          ...draft,
                          givingInitiatives: [...draft.givingInitiatives, nextInit],
                        });
                      }}
                      className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Fund
                    </button>
                    <button
                      onClick={() =>
                        handleSaveMultiple(
                          ['givingInitiatives', 'mobileMoneyDetails'],
                          'Giving & MoMo Settings'
                        )
                      }
                      disabled={isSaving}
                      className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#63D98A]" />
                      <span>Save Giving & MoMo</span>
                    </button>
                  </div>
                </div>

                {draft.givingInitiatives.map((item, idx) => (
                  <div key={item.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-[#168A45] font-semibold">
                        FUND #{idx + 1}
                      </span>
                      <button
                        onClick={() =>
                          setDraft({
                            ...draft,
                            givingInitiatives: draft.givingInitiatives.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1.5 text-red-500 border border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          className={inputCls}
                          value={item.title}
                          onChange={(e) => {
                            const next = [...draft.givingInitiatives];
                            next[idx] = { ...item, title: e.target.value };
                            setDraft({ ...draft, givingInitiatives: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Badge</label>
                        <input
                          className={inputCls}
                          value={item.badge}
                          onChange={(e) => {
                            const next = [...draft.givingInitiatives];
                            next[idx] = { ...item, badge: e.target.value };
                            setDraft({ ...draft, givingInitiatives: next });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={item.description}
                        onChange={(e) => {
                          const next = [...draft.givingInitiatives];
                          next[idx] = { ...item, description: e.target.value };
                          setDraft({ ...draft, givingInitiatives: next });
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Mobile Money Details */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#168A45] font-semibold">
                    Direct MTN Mobile Money Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Network Label</label>
                      <input
                        className={inputCls}
                        value={draft.mobileMoneyDetails.network}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            mobileMoneyDetails: {
                              ...draft.mobileMoneyDetails,
                              network: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Display Number</label>
                      <input
                        className={inputCls}
                        value={draft.mobileMoneyDetails.displayNumber}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            mobileMoneyDetails: {
                              ...draft.mobileMoneyDetails,
                              displayNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Account Name</label>
                      <input
                        className={inputCls}
                        value={draft.mobileMoneyDetails.accountName}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            mobileMoneyDetails: {
                              ...draft.mobileMoneyDetails,
                              accountName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Raw Digits</label>
                      <input
                        className={inputCls}
                        value={draft.mobileMoneyDetails.rawNumber}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            mobileMoneyDetails: {
                              ...draft.mobileMoneyDetails,
                              rawNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>International Number</label>
                      <input
                        className={inputCls}
                        value={draft.mobileMoneyDetails.internationalNumber}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            mobileMoneyDetails: {
                              ...draft.mobileMoneyDetails,
                              internationalNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>WhatsApp Link</label>
                      <input
                        className={inputCls}
                        value={draft.mobileMoneyDetails.whatsappLink}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            mobileMoneyDetails: {
                              ...draft.mobileMoneyDetails,
                              whatsappLink: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 9. CONTACT, SOCIALS & WHATSAPP ==================== */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">
                      Contact Channels, Socials & WhatsApp Desk
                    </h2>
                    <p className="text-xs opacity-60">Updates Contact Page, Footer, Social Grids, and Floating WhatsApp Widget</p>
                  </div>
                  <button
                    onClick={() =>
                      handleSaveMultiple(
                        ['contactInfo', 'socialLinks', 'whatsappConfig', 'formspreeEndpoint'],
                        'Contact & Channels'
                      )
                    }
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#63D98A]" />
                    <span>Save All Contact Settings</span>
                  </button>
                </div>

                {/* Official Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input
                      className={inputCls}
                      value={draft.contactInfo.email}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contactInfo: { ...draft.contactInfo, email: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input
                      className={inputCls}
                      value={draft.contactInfo.phone}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contactInfo: { ...draft.contactInfo, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Location / Headquarters</label>
                    <input
                      className={inputCls}
                      value={draft.contactInfo.location}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contactInfo: { ...draft.contactInfo, location: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Optional Formspree Endpoint URL</label>
                    <input
                      className={inputCls}
                      value={draft.formspreeEndpoint}
                      onChange={(e) => setDraft({ ...draft, formspreeEndpoint: e.target.value })}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#168A45] font-semibold">
                      Social Media Channels
                    </span>
                    <button
                      onClick={() => {
                        const next: SocialLink = {
                          name: 'YouTube',
                          platform: 'YouTube',
                          url: 'https://youtube.com',
                          handle: '@ProphetJohnLord',
                        };
                        setDraft({ ...draft, socialLinks: [...draft.socialLinks, next] });
                      }}
                      className="px-2.5 py-1 bg-[#168A45] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Channel
                    </button>
                  </div>
                  {draft.socialLinks.map((soc, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        className={`${inputCls} sm:col-span-3`}
                        value={soc.name}
                        placeholder="Name"
                        onChange={(e) => {
                          const next = [...draft.socialLinks];
                          next[idx] = { ...soc, name: e.target.value };
                          setDraft({ ...draft, socialLinks: next });
                        }}
                      />
                      <select
                        className={`${inputCls} sm:col-span-2`}
                        value={soc.platform}
                        onChange={(e) => {
                          const next = [...draft.socialLinks];
                          next[idx] = {
                            ...soc,
                            platform: e.target.value as SocialLink['platform'],
                          };
                          setDraft({ ...draft, socialLinks: next });
                        }}
                      >
                        <option value="YouTube">YouTube</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="TikTok">TikTok</option>
                        <option value="X">X</option>
                      </select>
                      <input
                        className={`${inputCls} sm:col-span-3`}
                        value={soc.handle}
                        placeholder="Handle"
                        onChange={(e) => {
                          const next = [...draft.socialLinks];
                          next[idx] = { ...soc, handle: e.target.value };
                          setDraft({ ...draft, socialLinks: next });
                        }}
                      />
                      <input
                        className={`${inputCls} sm:col-span-3`}
                        value={soc.url}
                        placeholder="URL"
                        onChange={(e) => {
                          const next = [...draft.socialLinks];
                          next[idx] = { ...soc, url: e.target.value };
                          setDraft({ ...draft, socialLinks: next });
                        }}
                      />
                      <button
                        onClick={() =>
                          setDraft({
                            ...draft,
                            socialLinks: draft.socialLinks.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-2 text-red-500 border border-red-500/30 sm:col-span-1 flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Desk */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#168A45] font-semibold block">
                    Floating WhatsApp Desk Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>WhatsApp Phone Number</label>
                      <input
                        className={inputCls}
                        value={draft.whatsappConfig.phoneNumber}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            whatsappConfig: {
                              ...draft.whatsappConfig,
                              phoneNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Display Number</label>
                      <input
                        className={inputCls}
                        value={draft.whatsappConfig.displayNumber}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            whatsappConfig: {
                              ...draft.whatsappConfig,
                              displayNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Welcome Greeting Message</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={draft.whatsappConfig.welcomeMessage}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          whatsappConfig: {
                            ...draft.whatsappConfig,
                            welcomeMessage: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 10. MEDIA LIBRARY (CLOUDINARY) ==================== */}
          {activeTab === 'media' && (
            <div className={`p-6 space-y-6 ${cardCls}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-medium">
                    Cloudinary Media Library
                  </h2>
                  <p className="text-xs opacity-60">
                    Upload images to {storageInfo?.cloudinaryConfigured ? 'Cloudinary CDN' : 'CMS media storage'} and copy URLs for slides, flyers, books, or portraits.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshMediaAssets}
                    className="px-3.5 py-2 border border-gray-300 dark:border-white/15 text-xs font-semibold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                  <label className="px-4 py-2 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#63D98A]" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadHelper(e.target.files?.[0], () => {})}
                    />
                  </label>
                </div>
              </div>

              {mediaAssets.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-gray-300 dark:border-white/15 space-y-2">
                  <CloudUpload className="w-8 h-8 mx-auto text-[#168A45] opacity-70" />
                  <p className="text-sm font-medium">No uploaded media assets yet.</p>
                  <p className="text-xs opacity-60">
                    Upload an image here or from any section editor to host it in {storageInfo?.cloudinaryConfigured ? 'Cloudinary' : 'CMS uploads'} and catalog it in your database.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-video bg-black relative overflow-hidden">
                        <img
                          src={asset.secureUrl}
                          alt={asset.filename}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-[9px] font-mono uppercase text-[#63D98A]">
                          {asset.provider}
                        </span>
                      </div>
                      <div className="p-3 space-y-2 text-xs">
                        <div className="font-medium truncate" title={asset.filename}>
                          {asset.filename}
                        </div>
                        <div className="text-[10px] font-mono opacity-60">
                          {asset.width && asset.height ? `${asset.width}x${asset.height} · ` : ''}
                          {asset.format ? asset.format.toUpperCase() : 'IMG'}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleCopy(asset.id, asset.secureUrl)}
                            className="flex-1 py-1.5 bg-[#168A45] text-white text-[11px] font-semibold uppercase flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {copiedKey === asset.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedKey === asset.id ? 'Copied URL' : 'Copy URL'}</span>
                          </button>
                          <button
                            onClick={async () => {
                              const res = await deleteMediaAsset(asset.id);
                              if (res.ok) showToast('success', 'Media asset deleted.');
                              else showToast('error', res.error || 'Failed to delete asset.');
                            }}
                            className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title="Delete asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 11. SUBMISSIONS INBOX ==================== */}
          {activeTab === 'inbox' && (
            <div className="space-y-6">
              <div className={`p-6 space-y-6 ${cardCls}`}>
                <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-white/10">
                  <div>
                    <h2 className="font-serif-luxury text-2xl font-medium">
                      Ministry Secretariat Submissions Inbox
                    </h2>
                    <p className="text-xs opacity-60">
                      Contact messages, event seat reservations, and newsletter subscribers
                    </p>
                  </div>
                  <button
                    onClick={fetchSubmissions}
                    className="px-3.5 py-2 border border-[#168A45] text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Contact Messages */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#168A45] font-semibold flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Contact Petitions & Inquiries ({submissions.contactSubmissions.length})</span>
                  </h3>
                  {submissions.contactSubmissions.length === 0 ? (
                    <p className="text-xs opacity-60 italic">No contact messages yet.</p>
                  ) : (
                    submissions.contactSubmissions.map((m) => (
                      <div key={m.id} className="p-4 border border-gray-200 dark:border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold">
                            {m.name} &lt;{m.email}&gt; {m.phone ? `· ${m.phone}` : ''}
                          </div>
                          <button
                            onClick={() => handleDeleteSubmission('contact', m.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] font-mono text-[#168A45]">{m.subject}</div>
                        <p className="text-xs opacity-80 leading-relaxed">{m.message}</p>
                        <div className="text-[10px] opacity-40 font-mono">
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Event RSVPs */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#168A45] font-semibold flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Event Seat Reservations ({submissions.eventRegistrations.length})</span>
                  </h3>
                  {submissions.eventRegistrations.length === 0 ? (
                    <p className="text-xs opacity-60 italic">No event reservations yet.</p>
                  ) : (
                    submissions.eventRegistrations.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 border border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold">
                            {r.name} ({r.attendeeCount} attendee{r.attendeeCount === '1' ? '' : 's'})
                          </div>
                          <div className="opacity-70">
                            {r.email} {r.phone ? `· ${r.phone}` : ''} — Event: {r.eventTitle}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSubmission('rsvp', r.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Newsletter Subscribers */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#168A45] font-semibold flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    <span>Newsletter Subscribers ({submissions.newsletterSubscribers.length})</span>
                  </h3>
                  {submissions.newsletterSubscribers.length === 0 ? (
                    <p className="text-xs opacity-60 italic">No subscribers yet.</p>
                  ) : (
                    submissions.newsletterSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 border border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold">{sub.name}</span> —{' '}
                          <span className="opacity-75">{sub.email}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteSubmission('newsletter', sub.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 12. SECURITY ==================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className={`p-6 space-y-5 ${cardCls}`}>
                <div className="border-b pb-4 border-gray-200 dark:border-white/10">
                  <h2 className="font-serif-luxury text-2xl font-medium">
                    Admin Portal URL & Secrets Configuration
                  </h2>
                  <p className="text-xs opacity-60">
                    Share or bookmark your private CMS URL and manage credentials via AI Studio Secrets or the form below.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Private Admin Studio URL (Hash Route)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${origin}/#admin`}
                        className={`${inputCls} font-mono text-xs`}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy('admin-hash-url', `${origin}/#admin`)}
                        className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'admin-hash-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'admin-hash-url' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Private Admin Studio URL (Path Route)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${origin}/admin`}
                        className={`${inputCls} font-mono text-xs`}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy('admin-path-url', `${origin}/admin`)}
                        className="px-3 py-2 bg-[#168A45] text-white text-xs font-semibold uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'admin-path-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'admin-path-url' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-[#168A45]/30 bg-[#168A45]/5 space-y-1.5 text-xs">
                  <div className="font-semibold flex items-center gap-2 text-[#168A45] dark:text-[#63D98A]">
                    <Shield className="w-4 h-4" />
                    <span>
                      {storageInfo?.adminSecretsConfigured
                        ? 'AI Studio Secrets Override Active (ADMIN_EMAIL / ADMIN_PASSCODE)'
                        : 'AI Studio Secrets Ready (ADMIN_EMAIL / ADMIN_PASSCODE)'}
                    </span>
                  </div>
                  <p className="opacity-75 leading-relaxed">
                    Add or update <code className="font-mono font-semibold">ADMIN_EMAIL</code> and{' '}
                    <code className="font-mono font-semibold">ADMIN_PASSCODE</code> in AI Studio Secrets at any time—the CMS automatically syncs those credentials on restart.
                  </p>
                </div>
              </div>

              <div className={`p-6 space-y-6 ${cardCls}`}>
                <div className="border-b pb-4 border-gray-200 dark:border-white/10">
                  <h2 className="font-serif-luxury text-2xl font-medium">
                    Administrator Credentials & Security
                  </h2>
                  <p className="text-xs opacity-60">
                    Update your CMS admin email address and passcode directly here. Passcodes are salted and hashed using scrypt.
                  </p>
                </div>

                {secStatus && (
                  <div
                    className={`p-3 border text-xs flex items-center gap-2 ${
                      secStatus.type === 'success'
                        ? 'border-[#168A45] bg-[#168A45]/10 text-[#168A45] dark:text-[#63D98A]'
                        : 'border-red-500/40 bg-red-500/10 text-red-500'
                    }`}
                  >
                    {secStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{secStatus.msg}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className={labelCls}>Admin Email</label>
                    <input
                      type="email"
                      required
                      className={inputCls}
                      value={secNewEmail}
                      onChange={(e) => setSecNewEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Current Passcode *</label>
                    <div className="relative">
                      <input
                        type={showSecPass ? 'text' : 'password'}
                        required
                        className={`${inputCls} pr-10`}
                        value={secCurrentPass}
                        onChange={(e) => setSecCurrentPass(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecPass((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer"
                        aria-label={showSecPass ? 'Hide passcodes' : 'Show passcodes'}
                      >
                        {showSecPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>New Passcode (leave blank to keep current)</label>
                    <input
                      type={showSecPass ? 'text' : 'password'}
                      minLength={6}
                      className={inputCls}
                      value={secNewPass}
                      onChange={(e) => setSecNewPass(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-[#63D98A]" />
                    <span>Update Credentials</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
