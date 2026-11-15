import React, { useState, useEffect, useRef } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  CheckCheck, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const WhatsAppChat: React.FC = () => {
  const { theme } = useTheme();
  const { content } = useCMS();
  const whatsappConfig = content.whatsappConfig;
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subtle prompt bubble after 4s
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      setShowNotificationBadge(false);
    }
  }, [isOpen]);

  const getWhatsAppUrl = (text?: string) => {
    const textToSend = text || whatsappConfig.defaultMessage;
    const cleanPhone = whatsappConfig.phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(textToSend);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || message.trim() || whatsappConfig.defaultMessage;
    const waUrl = getWhatsAppUrl(textToSend);
    
    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // In restricted iframe environments, link navigation might be constrained; ignore silently
    }
    setMessage('');
    setIsOpen(false);
  };

  return (
    <aside 
      aria-label="WhatsApp Ministry Contact"
      className="fixed bottom-3.5 right-3.5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end print:hidden pointer-events-none"
    >
      {/* Speech Prompt Bubble (compact, unobtrusive) */}
      {!isOpen && hasPrompted && (
        <div 
          onClick={() => setIsOpen(true)}
          className={`pointer-events-auto mb-2 max-w-[220px] p-2.5 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-102 flex items-center gap-2.5 border animate-fade-in-up ${
            theme === 'light'
              ? 'bg-white text-gray-900 border-[#168A45]/20 shadow-emerald-950/10'
              : 'bg-[#0B1A12]/95 backdrop-blur-md text-[#F5F7F5] border-[#168A45]/30 shadow-black/80'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[#168A45] text-white flex items-center justify-center shrink-0 font-serif-luxury font-bold text-[10px] shadow-xs">
            JL
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-[#168A45] text-[11px] truncate">Ministry Desk</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setHasPrompted(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5"
                aria-label="Dismiss chat prompt"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className={`text-[10px] leading-tight truncate ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              Chat on WhatsApp for prayer & info
            </p>
          </div>
        </div>
      )}

      {/* Expanded WhatsApp Chat Window */}
      {isOpen && (
        <div 
          className={`pointer-events-auto w-[calc(100vw-1.75rem)] max-w-[340px] sm:w-[320px] rounded-2xl shadow-2xl border overflow-hidden flex flex-col mb-3 transition-all duration-300 animate-fade-in-up ${
            theme === 'light'
              ? 'bg-[#F9FAF9] text-gray-900 border-gray-200 shadow-xl shadow-emerald-900/15'
              : 'bg-[#080E0B] text-[#F5F7F5] border-[#168A45]/30 shadow-2xl shadow-black/90'
          }`}
          style={{ maxHeight: '72svh' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0B2418] via-[#103E24] to-[#168A45] p-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-black/40 border border-[#63D98A]/40 flex items-center justify-center font-serif-luxury font-bold text-xs text-[#63D98A] shadow-inner">
                  JL
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#63D98A] border-2 border-[#0B2418] rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-medium text-xs tracking-wide text-white">
                    Prophet John Lord
                  </h3>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#63D98A]" />
                </div>
                <p className="text-[10px] text-[#A7F3D0] flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#63D98A]" />
                  Online • WhatsApp Desk
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversation Body */}
          <div className={`p-3 overflow-y-auto space-y-2.5 text-xs ${
            theme === 'light' ? 'bg-[#F0F4F1]' : 'bg-[#050906]'
          }`}>
            {/* Inbound Welcome Bubble */}
            <div className="flex flex-col items-start max-w-[92%]">
              <div className={`p-2.5 rounded-xl rounded-tl-xs shadow-xs border ${
                theme === 'light' 
                  ? 'bg-white text-gray-800 border-gray-200/70' 
                  : 'bg-[#101F17] text-gray-100 border-[#168A45]/30'
              }`}>
                <p className="text-[11px] leading-relaxed font-sans-clean">
                  {whatsappConfig.welcomeMessage}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-400">
                  <span>Just now</span>
                  <CheckCheck className="w-3 h-3 text-[#168A45]" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1 pt-0.5">
              <p className={`text-[10px] font-medium tracking-wide flex items-center gap-1 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <Sparkles className="w-3 h-3 text-[#168A45]" />
                Quick Options:
              </p>
              <div className="flex flex-col gap-1">
                {whatsappConfig.quickOptions.map((opt, idx) => (
                  <a
                    key={idx}
                    href={getWhatsAppUrl(opt.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] transition-all flex items-center justify-between group border ${
                      theme === 'light'
                        ? 'bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#0B3B20] border-gray-200 shadow-2xs'
                        : 'bg-[#0D1812] hover:bg-[#12241B] text-gray-200 hover:text-white border-white/5'
                    }`}
                  >
                    <span className="truncate mr-1">{opt.label}</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#168A45] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Input Footer */}
          <div className={`p-2.5 border-t ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#080E0B] border-white/10'
          }`}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 min-w-0 text-base sm:text-[11px] px-2.5 py-2 sm:py-1.5 rounded-lg border focus:outline-none transition-all min-h-[40px] sm:min-h-[34px] ${
                  theme === 'light'
                    ? 'bg-gray-50 text-gray-900 border-gray-300 focus:border-[#168A45] focus:bg-white'
                    : 'bg-[#0D1812] text-white border-white/10 focus:border-[#168A45] focus:bg-[#112018]'
                }`}
              />
              <button
                type="submit"
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-[#168A45] hover:bg-[#107036] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#168A45]/30 shrink-0 cursor-pointer"
                aria-label="Send message on WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-1.5 px-0.5 text-[9px] text-gray-400">
              <span className="flex items-center gap-1">
                <ExternalLink className="w-2.5 h-2.5 text-[#168A45]" />
                WhatsApp
              </span>
              <span className="font-mono text-[#168A45] font-semibold">{whatsappConfig.displayNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Refined & Compact) */}
      <div className="pointer-events-auto relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close WhatsApp Chat" : "Open WhatsApp Chat with Prophet John Lord Ministry (+233240700800)"}
          className={`relative group w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#168A45]/40 cursor-pointer ${
            isOpen
              ? 'bg-neutral-900 border-2 border-[#168A45]'
              : 'bg-gradient-to-tr from-[#0F5A2E] via-[#168A45] to-[#25D366] shadow-[0_4px_20px_rgba(22,138,69,0.45)]'
          }`}
        >
          {isOpen ? (
            <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <>
              {/* Compact WhatsApp icon */}
              <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-white/10 stroke-[2.2]" />
              
              {/* Active Online Dot */}
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-[#63D98A] border-2 border-[#050505] rounded-full" />
              
              {/* Unread / Notification Pill */}
              {showNotificationBadge && !isOpen && (
                <span className="absolute -top-1 -left-1 px-1.5 py-0.2 rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs">
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
