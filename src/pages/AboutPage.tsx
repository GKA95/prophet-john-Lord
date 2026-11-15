import React, { useState } from 'react';
import { PageId } from '../types';
import { useCMS } from '../context/CMSContext';
import { PortraitPlaceholder } from '../components/PortraitPlaceholder';
import { ArrowRight, Compass, Shield, Sparkles, CheckCircle, Flame, Globe2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { content } = useCMS();
  const ministryProfile = content.profile;
  const coreMandates = content.coreMandates;
  const coreTenets = content.coreTenets;
  const [activeMandateId, setActiveMandateId] = useState<string>(coreMandates[0]?.id || 'calling');

  const mandateIcons: Record<string, React.ReactNode> = {
    calling: <Sparkles className="w-5 h-5 text-[#168A45] dark:text-[#63D98A]" />,
    vision: <Compass className="w-5 h-5 text-[#168A45] dark:text-[#63D98A]" />,
    mission: <Shield className="w-5 h-5 text-[#168A45] dark:text-[#63D98A]" />,
    scope: <Globe2 className="w-5 h-5 text-[#168A45] dark:text-[#63D98A]" />,
  };

  return (
    <div className={`pt-24 sm:pt-28 pb-16 sm:pb-20 transition-colors duration-400 ${
      isLight ? 'bg-[#F8FAF8] text-[#080D0A]' : 'bg-[#050505] text-[#F5F7F5]'
    }`}>
      {/* Hero Header */}
      <section className="px-4 sm:px-6 md:px-12 py-12 sm:py-16 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#168A45] dark:text-[#63D98A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#168A45]" />
          <span>BIOGRAPHICAL PORTRAIT</span>
        </div>
        <h1 className={`font-serif-luxury text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-tight ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}>
          ABOUT PROPHET <br />
          <span className="italic text-[#168A45] dark:text-[#63D98A]">JOHN LORD</span>
        </h1>
        <p className={`font-serif-luxury text-lg sm:text-2xl italic max-w-2xl ${
          isLight ? 'text-gray-700' : 'text-white/80'
        }`}>
          &ldquo;{ministryProfile.tagline}&rdquo;
        </p>
      </section>

      {/* Main Split Section: Portrait & Official Biography */}
      <section className={`px-4 sm:px-6 md:px-12 py-8 sm:py-12 max-w-7xl mx-auto border-t ${
        isLight ? 'border-gray-200' : 'border-white/10'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Portrait Column */}
          <div className="lg:col-span-5 space-y-6 max-w-sm sm:max-w-md lg:max-w-none mx-auto w-full">
            <PortraitPlaceholder variant="about" className="w-full aspect-[3/4] shadow-2xl" />
            
            <div className={`p-5 sm:p-6 border space-y-3 ${
              isLight 
                ? 'bg-white border-gray-200 shadow-sm' 
                : 'bg-[#0B2418]/30 border-[#168A45]/30'
            }`}>
              <span className="text-[10px] tracking-widest uppercase text-[#168A45] dark:text-[#63D98A] font-semibold block">
                MINISTERIAL IDENTITY
              </span>
              <h4 className={`font-serif-luxury text-2xl font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Prophet John Lord
              </h4>
              <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                Anointed vessel dedicated to the proclamation of the Gospel of Jesus Christ, demonstrating God's love through prayer, and raising generations for God's Kingdom.
              </p>
              <div className={`pt-2 border-t text-xs space-y-1 ${
                isLight ? 'border-gray-200 text-gray-500' : 'border-white/10 text-white/50'
              }`}>
                <div>Office: <span className={isLight ? 'text-neutral-900 font-medium' : 'text-white'}>Prophetic & Apostolic Mandate</span></div>
                <div>Church: <span className={isLight ? 'text-neutral-900 font-medium' : 'text-white'}>United Conquers Church</span></div>
                <div>Movement: <span className={isLight ? 'text-neutral-900 font-medium' : 'text-white'}>The Lord Builders Global Intercessors</span></div>
                <div>Biblical Foundation: <span className="font-mono text-[#168A45] dark:text-[#63D98A] font-semibold">Jeremiah 1:10</span></div>
              </div>
            </div>
          </div>

          {/* Biography Content Column */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-10">
            <div className="space-y-4">
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#168A45] dark:text-[#63D98A] font-semibold">
                BIOGRAPHICAL STATEMENT
              </span>
              <h2 className={`font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-medium ${
                isLight ? 'text-neutral-950' : 'text-white'
              }`}>
                A VOICE FOR THIS GENERATION
              </h2>
              <div className={`p-6 sm:p-8 border space-y-5 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
                  <span className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-[#168A45] dark:text-[#63D98A] font-medium">
                    Official Ministry Biography
                  </span>
                </div>
                {ministryProfile.biography.split('\n\n').map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`leading-relaxed text-sm sm:text-base font-light ${
                      idx === 0
                        ? 'font-serif-luxury italic text-base sm:text-lg border-l-2 border-[#168A45] pl-4 sm:pl-5 ' +
                          (isLight ? 'text-neutral-900' : 'text-[#F5F7F5]')
                        : isLight
                        ? 'text-neutral-700'
                        : 'text-white/80'
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Ministerial Tenets */}
            <div className={`space-y-3 sm:space-y-4 pt-4 border-t ${
              isLight ? 'border-gray-200' : 'border-white/10'
            }`}>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#168A45] dark:text-[#63D98A] font-semibold">
                CORE TENETS OF LEADERSHIP
              </span>
              <div className="space-y-2.5 sm:space-y-3">
                {coreTenets.map((tenet, idx) => (
                  <div key={idx} className={`flex items-start sm:items-center gap-3 text-xs sm:text-sm ${
                    isLight ? 'text-neutral-800' : 'text-white/80'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-[#168A45] shrink-0 mt-0.5 sm:mt-0" />
                    <span>{tenet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DEDICATED SECTION: 01 — MY CALLING, OUR VISION, OUR MISSION, OUR MINISTRY SCOPE
         ======================================================== */}
      <section className={`px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto border-t transition-colors duration-300 ${
        isLight ? 'border-gray-200' : 'border-white/10'
      }`}>
        <div className="space-y-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#168A45] dark:text-[#63D98A]">
              <Flame className="w-4 h-4" />
              <span>FOUNDATIONAL MANDATES</span>
            </div>
            <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal leading-tight ${
              isLight ? 'text-neutral-950' : 'text-white'
            }`}>
              CALLING, VISION & MISSION
            </h2>
            <p className={`text-sm sm:text-base font-light ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
              Inspired by Jeremiah 1:10, to uproot what destroys, tear down spiritual strongholds, build lives through God's Word, and plant generations in righteousness.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {coreMandates.map((mandate) => {
              const isSelected = activeMandateId === mandate.id;
              return (
                <button
                  key={mandate.id}
                  onClick={() => setActiveMandateId(mandate.id)}
                  className={`p-3.5 sm:p-5 text-left border transition-all duration-300 cursor-pointer min-w-0 ${
                    isSelected
                      ? isLight
                        ? 'bg-white border-[#168A45] shadow-md ring-1 ring-[#168A45]'
                        : 'bg-[#0B2418]/70 border-[#63D98A] shadow-[0_0_25px_rgba(22,138,69,0.3)]'
                      : isLight
                      ? 'bg-white/60 hover:bg-white border-gray-200 hover:border-gray-300 text-neutral-700'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="font-mono text-xs font-semibold text-[#168A45] dark:text-[#63D98A]">
                      {mandate.number}
                    </span>
                    {mandateIcons[mandate.id]}
                  </div>
                  <h3 className={`font-serif-luxury text-sm sm:text-lg font-medium leading-snug ${
                    isSelected
                      ? isLight ? 'text-neutral-950 font-semibold' : 'text-white'
                      : isLight ? 'text-neutral-800' : 'text-white/80'
                  }`}>
                    {mandate.title}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 dark:text-white/40 block mt-1 truncate">
                    {mandate.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Mandate Detailed Card */}
          {coreMandates.length > 0 && (() => {
            const currentMandate = coreMandates.find((m) => m.id === activeMandateId) || coreMandates[0];
            return (
              <div
                key={currentMandate.id}
                className={`p-5 sm:p-10 md:p-12 border shadow-xl transition-all duration-500 animate-fade-in ${
                  isLight
                    ? 'bg-white border-[#168A45]/30'
                    : 'bg-gradient-to-br from-[#0B2418]/40 via-[#050505] to-[#050505] border-[#168A45]/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 sm:pb-6 mb-5 sm:mb-6 border-gray-200 dark:border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#168A45] dark:text-[#63D98A]">
                        {currentMandate.number}
                      </span>
                      <span className="text-gray-300 dark:text-white/20">·</span>
                      <span className="text-xs uppercase tracking-widest text-[#168A45] dark:text-[#63D98A] font-semibold">
                        {currentMandate.badge}
                      </span>
                    </div>
                    <h3 className={`font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal ${
                      isLight ? 'text-neutral-950' : 'text-white'
                    }`}>
                      {currentMandate.title}
                    </h3>
                  </div>

                  <div className={`px-4 py-2 border self-start md:self-auto text-xs font-mono tracking-wider uppercase ${
                    isLight
                      ? 'bg-emerald-50 text-[#0B3B20] border-emerald-200'
                      : 'bg-[#0B2418]/60 text-[#63D98A] border-[#168A45]/40'
                  }`}>
                    Biblical Anchor: {currentMandate.scriptureReference}
                  </div>
                </div>

                {/* Mandate Paragraphs */}
                <div className="space-y-6 max-w-4xl">
                  {currentMandate.paragraphs.map((para, i) => (
                    <div
                      key={i}
                      className={`relative pl-5 sm:pl-6 border-l-2 transition-all ${
                        i === 0
                          ? 'border-[#168A45]'
                          : 'border-gray-200 dark:border-white/15'
                      }`}
                    >
                      <p className={`text-base sm:text-lg leading-relaxed font-light ${
                        i === 0
                          ? 'font-serif-luxury text-lg sm:text-xl italic ' +
                            (isLight ? 'text-neutral-950' : 'text-white')
                          : isLight
                          ? 'text-neutral-700'
                          : 'text-white/80'
                      }`}>
                        {para}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* All 4 Mandates Quick Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {coreMandates.map((m) => (
              <div
                key={m.id}
                className={`p-6 sm:p-7 border space-y-3 transition-all duration-300 ${
                  isLight
                    ? 'bg-white border-gray-200 hover:border-[#168A45]/50 shadow-xs'
                    : 'bg-white/5 border-white/10 hover:border-[#168A45]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#168A45] dark:text-[#63D98A]">
                    <span className="font-mono text-xs font-semibold">{m.number}</span>
                    <span className="text-xs uppercase tracking-widest font-semibold">{m.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 dark:text-white/40">
                    {m.scriptureReference}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                  isLight ? 'text-gray-700' : 'text-white/75'
                }`}>
                  {m.summary}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
            <button
              onClick={() => onNavigate('ministry')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(22,138,69,0.3)] min-h-[48px] cursor-pointer hover:scale-105"
            >
              <span>EXPLORE THE MINISTRY PILLARS</span>
              <ArrowRight className="w-4 h-4 text-[#63D98A]" />
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className={`w-full sm:w-auto px-8 py-3.5 border text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center min-h-[48px] cursor-pointer hover:scale-105 ${
                isLight
                  ? 'bg-white hover:bg-gray-100 text-neutral-900 border-gray-300'
                  : 'bg-transparent hover:bg-white/5 border-white/20 text-white'
              }`}
            >
              <span>MINISTERIAL INVITATIONS & PRAYER</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
