import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCMS } from '../context/CMSContext';
import { AnimatedImage } from './AnimatedImage';
import defaultHeroPortrait from '../assets/images/prophet-john-lord.jpg';
import defaultAboutPortrait from '../assets/images/prophet-john-lord-2.jpg';
import hero2 from '../assets/images/prophet-hero-RhBIWRI.jpg';
import hero3 from '../assets/images/prophet-hero-U4nkCjx.jpg';
import hero4 from '../assets/images/prophet-hero-Et2i5bm.jpg';
import hero5 from '../assets/images/prophet-hero-28KrSAc.jpg';

export const BUNDLED_ASSET_MAP: Record<string, string> = {
  '/images/prophet-john-lord.jpg': defaultHeroPortrait,
  '/images/prophet-john-lord-2.jpg': defaultAboutPortrait,
  '/images/prophet-hero-RhBIWRI.jpg': hero2,
  '/images/prophet-hero-U4nkCjx.jpg': hero3,
  '/images/prophet-hero-Et2i5bm.jpg': hero4,
  '/images/prophet-hero-28KrSAc.jpg': hero5,
};

export const REMOTE_HERO_FALLBACK = 'https://i.imgur.com/pH2YsEI.jpeg';
const REMOTE_ABOUT_FALLBACK = 'https://i.imgur.com/KrrtDEz.jpg';

interface SlideItem {
  id: string;
  src: string;
  fallback: string;
  caption: string;
  tagline: string;
  scripture: string;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 'hero-1',
    src: defaultHeroPortrait,
    fallback: REMOTE_HERO_FALLBACK,
    caption: 'Prophet John Lord',
    tagline: 'Apostolic & Prophetic Mandate',
    scripture: 'Jeremiah 1:10',
  },
  {
    id: 'hero-2',
    src: hero2,
    fallback: 'https://i.imgur.com/RhBIWRI.jpg',
    caption: 'Prophetic Demonstration',
    tagline: 'Divine Direction & Kingdom Authority',
    scripture: 'Jeremiah 1:10',
  },
  {
    id: 'hero-3',
    src: hero3,
    fallback: 'https://i.imgur.com/U4nkCjx.jpg',
    caption: 'Altar of Intercession',
    tagline: 'Raising Generations for God’s Kingdom',
    scripture: 'Jeremiah 1:10',
  },
  {
    id: 'hero-4',
    src: hero4,
    fallback: 'https://i.imgur.com/Et2i5bm.jpg',
    caption: 'Supernatural Power & Healing',
    tagline: 'Uprooting Strongholds & Planting Truth',
    scripture: 'Jeremiah 1:10',
  },
  {
    id: 'hero-5',
    src: hero5,
    fallback: 'https://i.imgur.com/28KrSAc.jpg',
    caption: 'Global Outreach & Impact',
    tagline: 'United Conquers Church • The Lord Builders',
    scripture: 'Jeremiah 1:10',
  },
];

interface PortraitPlaceholderProps {
  className?: string;
  variant?: 'hero' | 'about' | 'card' | 'compact';
  customImage?: string;
}

export const PortraitPlaceholder: React.FC<PortraitPlaceholderProps> = ({
  className = '',
  variant = 'about',
  customImage,
}) => {
  const { theme } = useTheme();
  const { content } = useCMS();
  const isLight = theme === 'light';
  const isHero = variant === 'hero';

  const HERO_SLIDES: SlideItem[] = (content.heroSlides && content.heroSlides.length > 0
    ? content.heroSlides
    : [
        {
          id: 'hero-1',
          src: '/images/prophet-john-lord.jpg',
          remoteUrl: REMOTE_HERO_FALLBACK,
          title: 'Prophet John Lord',
          subtitle: 'Apostolic & Prophetic Mandate',
          scripture: 'Jeremiah 1:10',
        },
      ]
  ).map((slide) => ({
    id: slide.id,
    src: BUNDLED_ASSET_MAP[slide.src] || slide.src,
    fallback: slide.remoteUrl || REMOTE_HERO_FALLBACK,
    caption: slide.title,
    tagline: slide.subtitle,
    scripture: slide.scripture || 'Jeremiah 1:10',
  }));

  // State for hero slideshow
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [slideErrors, setSlideErrors] = useState<Record<number, boolean>>({});

  // Single image state (for 'about', 'card', or custom override)
  const cmsSingleSrc = isHero
    ? content.profile.officialPortrait
    : content.profile.secondPortrait;
  const resolvedSingleSrc =
    customImage ||
    BUNDLED_ASSET_MAP[cmsSingleSrc] ||
    cmsSingleSrc ||
    (isHero ? defaultHeroPortrait : defaultAboutPortrait);
  const singleRemoteFallback = isHero
    ? content.profile.officialPortraitUrl || REMOTE_HERO_FALLBACK
    : content.profile.secondPortraitUrl || REMOTE_ABOUT_FALLBACK;

  const [singleImageError, setSingleImageError] = useState(false);
  const currentSingleImage = singleImageError ? singleRemoteFallback : resolvedSingleSrc;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const SLIDE_DURATION_MS = 5500;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slidesCount = HERO_SLIDES.length;

  useEffect(() => {
    if (activeSlideIndex >= slidesCount) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, slidesCount]);

  const nextSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev + 1) % Math.max(slidesCount, 1));
  }, [slidesCount]);

  const prevSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev === 0 ? Math.max(slidesCount - 1, 0) : prev - 1));
  }, [slidesCount]);

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isHero || !isPlaying || isHovered || slidesCount <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHero, isPlaying, isHovered, nextSlide, slidesCount]);

  const handleSlideImageError = (index: number) => {
    setSlideErrors((prev) => ({ ...prev, [index]: true }));
  };

  const handleSingleImageError = () => {
    if (!singleImageError && currentSingleImage !== singleRemoteFallback) {
      setSingleImageError(true);
    }
  };

  const safeSlideIdx = activeSlideIndex < HERO_SLIDES.length ? activeSlideIndex : 0;
  const activeHeroSlide = HERO_SLIDES[safeSlideIdx];
  const activeSlideImageSrc = slideErrors[safeSlideIdx]
    ? activeHeroSlide.fallback
    : activeHeroSlide.src;

  const currentLightboxImage = isHero
    ? customImage || activeSlideImageSrc
    : currentSingleImage;

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden group select-none transition-all duration-500 border ${
          isLight
            ? 'bg-gradient-to-b from-[#EBF5EE] via-[#F4F9F5] to-white border-[#168A45]/30 shadow-xl'
            : 'bg-gradient-to-b from-[#0B2418]/60 via-[#050505] to-[#050505] border-[#168A45]/30 shadow-2xl'
        } ${className}`}
        style={{
          boxShadow: isLight
            ? '0 20px 45px rgba(11,36,24,0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
            : '0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {isHero && !customImage ? (
          /* ========================================================
             HERO SLIDESHOW WITH PROFESSIONAL ANIMATION
             ======================================================== */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Animated Progress Bar at Top */}
            <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-black/40 overflow-hidden">
              <div
                key={`${activeSlideIndex}-${isPlaying && !isHovered}`}
                className={`h-full bg-gradient-to-r from-[#168A45] to-[#63D98A] transition-all ${
                  isPlaying && !isHovered ? 'animate-progress-fill' : ''
                }`}
                style={{
                  animationDuration: `${SLIDE_DURATION_MS}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                }}
              />
            </div>

            {/* Slides Container with Crossfade & Ken-Burns Zoom */}
            <div className="absolute inset-0 w-full h-full">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                const imgSrc = slideErrors[idx] ? slide.fallback : slide.src;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                      isActive
                        ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  >
                    <AnimatedImage
                      src={imgSrc}
                      fallbackSrc={slide.fallback}
                      alt={`Prophet John Lord - ${slide.caption}`}
                      onError={() => handleSlideImageError(idx)}
                      containerClassName="absolute inset-0"
                      className="w-full h-full object-cover object-[center_20%] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  </div>
                );
              })}
            </div>

            {/* Subtle luxury vignette & gradient overlays */}
            <div
              className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${
                isLight
                  ? 'bg-gradient-to-t from-black/90 via-black/15 to-black/40'
                  : 'bg-gradient-to-t from-[#050505]/95 via-[#050505]/20 to-[#050505]/50'
              }`}
            />

            {/* Top Bar: Clean Slide Indicator & Quick Controls */}
            <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between gap-2">
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-md transition-all ${
                  isLight
                    ? 'bg-white/90 text-[#0B3B20] border-[#168A45]/30'
                    : 'bg-[#050505]/85 text-[#63D98A] border-white/15'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#168A45] animate-pulse shrink-0" />
                <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-white/90">
                  0{activeSlideIndex + 1} / 0{HERO_SLIDES.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  title={isPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
                  className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white/85 hover:bg-white text-gray-800 hover:text-black border-gray-300 shadow-sm'
                      : 'bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border-white/15'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-[#63D98A]" />
                  )}
                </button>

                {/* Lightbox / Zoom view */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Expand Full Portrait"
                  className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white/85 hover:bg-white text-gray-800 hover:text-black border-gray-300 shadow-sm'
                      : 'bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border-white/15'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation Arrows (Prev / Next) */}
            <div className="absolute inset-y-0 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={prevSlide}
                title="Previous Portrait"
                className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all opacity-70 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                title="Next Portrait"
                className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all opacity-70 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Inscription & Ministerial Branding */}
            <div className="relative z-20 p-4 sm:p-6 mt-auto space-y-2 text-white">
              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5 pb-1">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    title={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlideIndex
                        ? 'w-7 bg-[#63D98A] shadow-[0_0_10px_rgba(99,217,138,0.8)]'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="h-[1px] w-6 bg-[#63D98A]" />
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#63D98A]">
                  {activeHeroSlide.caption}
                </span>
              </div>

              <h3 className="font-serif-luxury text-xl sm:text-2xl font-light tracking-wide text-white drop-shadow-md">
                Prophet John Lord
              </h3>

              <p className="text-[11px] sm:text-xs text-white/80 font-light flex items-center justify-between gap-2">
                <span className="truncate">{activeHeroSlide.tagline}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#63D98A]/90 shrink-0">
                  {activeHeroSlide.scripture}
                </span>
              </p>
            </div>
          </div>
        ) : currentSingleImage ? (
          /* ========================================================
             SINGLE PORTRAIT (About Page & Secondary View)
             ======================================================== */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            <AnimatedImage
              src={currentSingleImage}
              fallbackSrc={singleRemoteFallback}
              alt="Prophet John Lord - Ministerial Portrait"
              onError={handleSingleImageError}
              containerClassName="absolute inset-0"
              className="w-full h-full object-cover object-[center_20%] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />

            {/* Vignette & Gradients */}
            <div
              className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${
                isLight
                  ? 'bg-gradient-to-t from-black/85 via-black/10 to-black/35'
                  : 'bg-gradient-to-t from-[#050505]/95 via-[#050505]/15 to-[#050505]/45'
              }`}
            />

            {/* Top Bar */}
            <div className="relative z-20 p-3 sm:p-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                title="Expand Full Portrait"
                className={`p-2 rounded-full backdrop-blur-md border transition-all min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
                  isLight
                    ? 'bg-white/85 hover:bg-white text-gray-800 hover:text-black border-gray-300 shadow-sm'
                    : 'bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border-white/15'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Inscription */}
            <div className="relative z-20 p-4 sm:p-6 mt-auto space-y-1 text-white">
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-6 bg-[#63D98A]" />
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#63D98A]">
                  Founder & President
                </span>
              </div>
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-light tracking-wide text-white drop-shadow-md">
                Prophet John Lord
              </h3>
              <p className="text-[11px] sm:text-xs text-white/80 font-light flex items-center justify-between">
                <span>United Conquers Church • The Lord Builders</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#63D98A]/90">
                  Jeremiah 1:10
                </span>
              </p>
            </div>
          </div>
        ) : (
          /* Fallback view */
          <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[360px] md:min-h-[380px]">
            <div className="relative z-10 flex items-center justify-between text-xs tracking-wider uppercase">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#168A45] animate-pulse shrink-0" />
                <span className={`font-semibold tracking-widest text-[9px] sm:text-[10px] ${
                  isLight ? 'text-[#0B3B20]' : 'text-[#63D98A]'
                }`}>
                  Prophet John Lord
                </span>
              </div>
              <span className={`font-mono text-[9px] sm:text-[10px] text-right ${
                isLight ? 'text-gray-400' : 'text-white/30'
              }`}>
                JEREMIAH 1:10
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4 sm:py-8 text-center animate-float">
              <div
                className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center border transition-all mb-4 sm:mb-6 shrink-0 ${
                  isLight
                    ? 'border-[#168A45]/40 bg-white/80 shadow-[0_0_30px_rgba(22,138,69,0.15)]'
                    : 'border-[#168A45]/40 bg-[#0B2418]/50 shadow-[0_0_40px_rgba(22,138,69,0.25)]'
                }`}
              >
                <div
                  className={`absolute inset-2 rounded-full border flex items-center justify-center ${
                    isLight ? 'border-[#168A45]/15' : 'border-white/5'
                  }`}
                >
                  <span
                    className={`font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-light tracking-widest ${
                      isLight ? 'text-[#050505]' : 'text-[#F5F7F5]'
                    }`}
                  >
                    PJL
                  </span>
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#168A45] opacity-75" />
              </div>

              <div className="max-w-xs space-y-1 px-2">
                <h4 className={`font-serif-luxury text-lg font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Prophet John Lord
                </h4>
                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  United Conquers Church • The Lord Builders
                </p>
              </div>
            </div>

            <div
              className={`relative z-10 pt-3 sm:pt-4 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-gray-200 text-gray-500' : 'border-white/10 text-white/40'
              }`}
            >
              <span className={`font-serif-luxury italic text-xs sm:text-sm ${
                isLight ? 'text-gray-800' : 'text-[#F5F7F5]/80'
              }`}>
                Prophetic Mandate
              </span>
              <span className={`text-[9px] sm:text-[10px] tracking-widest uppercase ${
                isLight ? 'text-[#168A45] font-semibold' : 'text-[#63D98A]/80'
              }`}>
                Jeremiah 1:10
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal with Slideshow browsing */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[95vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation inside Lightbox for Hero Slideshow */}
            {isHero && !customImage && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-black w-full flex flex-col items-center">
              <AnimatedImage
                src={currentLightboxImage}
                alt="Prophet John Lord - Ministerial Portrait"
                intrinsicSize
                className="max-h-[70vh] sm:max-h-[75vh] w-auto object-contain mx-auto block"
              />

              {/* Lightbox Footer */}
              <div className="w-full p-4 bg-neutral-950/95 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <div>
                  <div className="font-serif-luxury text-lg">Prophet John Lord</div>
                  <div className="text-xs text-white/60">
                    {isHero && !customImage ? activeHeroSlide.caption : 'Ministerial Portrait'}
                  </div>
                </div>

                {isHero && !customImage && (
                  <div className="flex items-center gap-1.5">
                    {HERO_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === activeSlideIndex ? 'w-6 bg-[#63D98A]' : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="text-xs text-white/60 text-right">
                  {isHero
                    ? 'Apostolic & Prophetic Mandate • Jeremiah 1:10'
                    : 'United Conquers Church • The Lord Builders'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
