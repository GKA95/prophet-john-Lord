import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageId, SermonItem, EventItem, ResourceItem } from '../types';
import {
  PortraitPlaceholder,
  BUNDLED_ASSET_MAP,
  REMOTE_HERO_FALLBACK,
} from '../components/PortraitPlaceholder';
import { AnimatedImage } from '../components/AnimatedImage';
import { NewsletterSection } from '../components/NewsletterSection';
import { useEvents } from '../context/EventsContext';
import { useCMS } from '../context/CMSContext';
import { 
  Play, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Download, 
  Flame, 
  Sparkles, 
  Quote, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenVideo: (sermon: SermonItem) => void;
  onOpenEvent: (event: EventItem) => void;
  onOpenResource: (resource: ResourceItem) => void;
  onOpenGiveModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenVideo,
  onOpenEvent,
  onOpenResource,
  onOpenGiveModal,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { events } = useEvents();
  const { content } = useCMS();
  const ministryProfile = content.profile;
  const ministryPillars = content.pillars;
  const placeholderSermons = content.sermons;
  const placeholderResources = content.resources;
  const placeholderTestimonials = content.testimonials;
  const socialLinks = content.socialLinks;

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  // Full-bleed Hero Slideshow State (CMS-driven timing, animation & fit)
  const heroSlides = (
    content.heroSlides && content.heroSlides.length > 0
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
    title: slide.title,
  }));

  const heroSettings = content.heroSettings || {
    intervalSeconds: 180,
    animationDurationMs: 2600,
    transitionAnimation: 'mosaic-tiles' as const,
    imageFitMode: 'fill-stretch' as const,
  };
  const intervalMs = Math.max(3, Number(heroSettings.intervalSeconds) || 180) * 1000;
  const animationDurationMs = Math.min(
    8000,
    Math.max(600, Number(heroSettings.animationDurationMs) || 2600)
  );
  const pieceDurationMs = Math.round(animationDurationMs * 0.72);
  const staggerBudgetMs = Math.round(animationDurationMs * 0.28);
  const transitionAnimation = heroSettings.transitionAnimation || 'mosaic-tiles';
  const imageFitMode = heroSettings.imageFitMode || 'fill-stretch';

  const heroObjectFitClass =
    imageFitMode === 'cover-upper'
      ? 'object-cover object-[center_18%]'
      : imageFitMode === 'cover-top'
        ? 'object-cover object-top'
        : imageFitMode === 'cover-center'
          ? 'object-cover object-center'
          : imageFitMode === 'contain-backdrop'
            ? 'object-contain object-center'
            : 'object-fill';

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState(0);
  const [transitionKey, setTransitionKey] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [slideErrors, setSlideErrors] = useState<Record<number, boolean>>({});
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heroSlidesCount = heroSlides.length;
  const safeSlideIdx = activeSlideIndex < heroSlidesCount ? activeSlideIndex : 0;
  const safePrevIdx = prevSlideIndex < heroSlidesCount ? prevSlideIndex : safeSlideIdx;

  useEffect(() => {
    if (activeSlideIndex >= heroSlidesCount) {
      setActiveSlideIndex(0);
      setPrevSlideIndex(0);
    }
  }, [activeSlideIndex, heroSlidesCount]);

  // Run initial piece-join entrance on mount
  useEffect(() => {
    const t = setTimeout(() => setIsTransitioning(false), animationDurationMs + 250);
    return () => clearTimeout(t);
  }, [animationDurationMs]);

  const advanceHeroSlide = useCallback(() => {
    if (heroSlidesCount <= 1) return;
    setActiveSlideIndex((current) => {
      const next = (current + 1) % heroSlidesCount;
      setPrevSlideIndex(current);
      setTransitionKey((k) => k + 1);
      setIsTransitioning(true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, animationDurationMs + 250);
      return next;
    });
  }, [heroSlidesCount, animationDurationMs]);

  useEffect(() => {
    if (heroSlidesCount <= 1) return;
    const timer = setInterval(() => {
      advanceHeroSlide();
    }, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [heroSlidesCount, intervalMs, advanceHeroSlide]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const currentHeroSlide = heroSlides[safeSlideIdx];
  const prevHeroSlide = heroSlides[safePrevIdx];
  const currentHeroSrc = slideErrors[safeSlideIdx]
    ? currentHeroSlide.fallback
    : currentHeroSlide.src;
  const prevHeroSrc = slideErrors[safePrevIdx]
    ? prevHeroSlide.fallback
    : prevHeroSlide.src;

  const featuredSermon = placeholderSermons[0];

  const handleNextTestimonial = () => {
    if (placeholderTestimonials.length === 0) return;
    setActiveTestimonialIndex((prev) => 
      (prev + 1) % placeholderTestimonials.length
    );
  };

  const handlePrevTestimonial = () => {
    if (placeholderTestimonials.length === 0) return;
    setActiveTestimonialIndex((prev) => 
      prev === 0 ? placeholderTestimonials.length - 1 : prev - 1
    );
  };

  const safeTestimonialIndex =
    placeholderTestimonials.length > 0
      ? activeTestimonialIndex % placeholderTestimonials.length
      : 0;
  const currentTestimony = placeholderTestimonials[safeTestimonialIndex];

  const renderAnimatedIncomingSlide = () => {
    if (transitionAnimation === 'cinematic-fade') {
      return (
        <div
          key={`fade-${transitionKey}`}
          className="absolute inset-0 w-full h-full z-10 animate-fade-in"
          style={{ animationDuration: `${animationDurationMs}ms` }}
        >
          {imageFitMode === 'contain-backdrop' && (
            <img
              src={currentHeroSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-45"
            />
          )}
          <img
            src={currentHeroSrc}
            alt={`Prophet John Lord - ${currentHeroSlide.title}`}
            onError={() =>
              setSlideErrors((prev) => ({ ...prev, [safeSlideIdx]: true }))
            }
            className={`relative w-full h-full ${heroObjectFitClass}`}
          />
        </div>
      );
    }

    if (transitionAnimation === 'vertical-blinds') {
      const cols = 8;
      const delayStep = Math.round(staggerBudgetMs / Math.max(cols - 1, 1));
      return (
        <div
          key={`blinds-${transitionKey}`}
          className="absolute inset-0 w-full h-full z-10 grid grid-cols-8 pointer-events-none"
        >
          {Array.from({ length: cols }).map((_, col) => {
            const ty = col % 2 === 0 ? '-38%' : '38%';
            return (
              <div
                key={col}
                className="relative w-full h-full overflow-hidden animate-hero-blind-join"
                style={
                  {
                    '--ty': ty,
                    animationDuration: `${pieceDurationMs}ms`,
                    animationDelay: `${col * delayStep}ms`,
                  } as React.CSSProperties
                }
              >
                {imageFitMode === 'contain-backdrop' && (
                  <img
                    src={currentHeroSrc}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      width: `${cols * 100}%`,
                      height: '100%',
                      maxWidth: 'none',
                      left: `${-col * 100}%`,
                      top: 0,
                    }}
                    className="object-cover blur-2xl scale-110 opacity-45"
                  />
                )}
                <img
                  src={currentHeroSrc}
                  alt=""
                  onError={() =>
                    setSlideErrors((prev) => ({ ...prev, [safeSlideIdx]: true }))
                  }
                  style={{
                    position: 'absolute',
                    width: `${cols * 100}%`,
                    height: '100%',
                    maxWidth: 'none',
                    left: `${-col * 100}%`,
                    top: 0,
                  }}
                  className={heroObjectFitClass}
                />
              </div>
            );
          })}
        </div>
      );
    }

    if (transitionAnimation === 'diagonal-slices') {
      const rows = 6;
      const delayStep = Math.round(staggerBudgetMs / Math.max(rows - 1, 1));
      return (
        <div
          key={`slices-${transitionKey}`}
          className="absolute inset-0 w-full h-full z-10 grid grid-rows-6 pointer-events-none"
        >
          {Array.from({ length: rows }).map((_, row) => {
            const tx = row % 2 === 0 ? '-18%' : '18%';
            return (
              <div
                key={row}
                className="relative w-full h-full overflow-hidden animate-hero-slice-join"
                style={
                  {
                    '--tx': tx,
                    animationDuration: `${pieceDurationMs}ms`,
                    animationDelay: `${row * delayStep}ms`,
                  } as React.CSSProperties
                }
              >
                {imageFitMode === 'contain-backdrop' && (
                  <img
                    src={currentHeroSrc}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: `${rows * 100}%`,
                      maxWidth: 'none',
                      left: 0,
                      top: `${-row * 100}%`,
                    }}
                    className="object-cover blur-2xl scale-110 opacity-45"
                  />
                )}
                <img
                  src={currentHeroSrc}
                  alt=""
                  onError={() =>
                    setSlideErrors((prev) => ({ ...prev, [safeSlideIdx]: true }))
                  }
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: `${rows * 100}%`,
                    maxWidth: 'none',
                    left: 0,
                    top: `${-row * 100}%`,
                  }}
                  className={heroObjectFitClass}
                />
              </div>
            );
          })}
        </div>
      );
    }

    // Default: 'mosaic-tiles' (cut into 5x3 = 15 pieces that fly in and join seamlessly)
    const cols = 5;
    const rows = 3;
    const maxDistance = (cols - 1) + (rows - 1);
    return (
      <div
        key={`mosaic-${transitionKey}`}
        className="absolute inset-0 w-full h-full z-10 grid grid-cols-5 grid-rows-3 pointer-events-none"
      >
        {Array.from({ length: cols * rows }).map((_, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const dx = (col - 2) * 36;
          const dy = row === 1 && col === 2 ? -34 : (row - 1) * 46;
          const rot = (col + row) % 2 === 0 ? -3.5 : 3.5;
          const delay = Math.round(((col + row) / maxDistance) * staggerBudgetMs);
          return (
            <div
              key={idx}
              className="relative w-full h-full overflow-hidden animate-hero-tile-join"
              style={
                {
                  '--tx': `${dx}px`,
                  '--ty': `${dy}px`,
                  '--rot': `${rot}deg`,
                  '--scl': '0.8',
                  animationDuration: `${pieceDurationMs}ms`,
                  animationDelay: `${delay}ms`,
                } as React.CSSProperties
              }
            >
              {imageFitMode === 'contain-backdrop' && (
                <img
                  src={currentHeroSrc}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    width: `${cols * 100}%`,
                    height: `${rows * 100}%`,
                    maxWidth: 'none',
                    left: `${-col * 100}%`,
                    top: `${-row * 100}%`,
                  }}
                  className="object-cover blur-2xl scale-110 opacity-45"
                />
              )}
              <img
                src={currentHeroSrc}
                alt=""
                onError={() =>
                  setSlideErrors((prev) => ({ ...prev, [safeSlideIdx]: true }))
                }
                style={{
                  position: 'absolute',
                  width: `${cols * 100}%`,
                  height: `${rows * 100}%`,
                  maxWidth: 'none',
                  left: `${-col * 100}%`,
                  top: `${-row * 100}%`,
                }}
                className={heroObjectFitClass}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden transition-colors duration-400 ${
      isLight ? 'bg-[#F8FAF8] text-[#080D0A]' : 'bg-[#050505] text-[#F5F7F5]'
    }`}>
      
      {/* ========================================================
          1. HERO SECTION (Full-Bleed Cut-Piece Animated Image + Crisp Text)
         ======================================================== */}
      <section className="relative min-h-[88svh] sm:min-h-screen w-full flex items-end lg:items-center pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#040B07]">
        {/* Full-Bleed Edge-to-Edge Background Slideshow */}
        <div className="absolute inset-0 w-full h-full z-0">
          {/* Base Layer: Previous slide during transition, or solid current slide once joined */}
          <div className="absolute inset-0 w-full h-full z-0">
            {imageFitMode === 'contain-backdrop' && (
              <img
                src={isTransitioning ? prevHeroSrc : currentHeroSrc}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-45"
              />
            )}
            <img
              src={isTransitioning ? prevHeroSrc : currentHeroSrc}
              alt={`Prophet John Lord - ${currentHeroSlide.title}`}
              onError={() =>
                setSlideErrors((prev) => ({ ...prev, [safeSlideIdx]: true }))
              }
              className={`relative w-full h-full ${heroObjectFitClass}`}
            />
          </div>

          {/* Incoming Animated Pieces Layer */}
          {isTransitioning && renderAnimatedIncomingSlide()}
        </div>

        {/* Directional Gradient Scrims: Left & bottom darkened for crisp text, right & upper center clear so the photo shines */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-t from-[#030A06]/95 via-[#030A06]/55 via-48% to-[#030A06]/25 lg:bg-gradient-to-r lg:from-[#030A06]/88 lg:via-[#030A06]/48 lg:via-50% lg:to-transparent"
        />
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-0 z-15 pointer-events-none bg-gradient-to-t from-[#030A06]/75 via-transparent via-35% to-[#030A06]/30"
        />

        {/* Slide Interval Progress Bar along bottom edge */}
        {heroSlidesCount > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10 overflow-hidden">
            <div
              key={`progress-${safeSlideIdx}-${intervalMs}`}
              className="h-full bg-gradient-to-r from-[#168A45] to-[#63D98A] animate-progress-fill"
              style={{
                animationDuration: `${intervalMs}ms`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
              }}
            />
          </div>
        )}

        {/* Foreground Content Container */}
        <div className="max-w-7xl w-full mx-auto relative z-20 flex flex-col items-start">
          <div className="max-w-2xl w-full space-y-4 sm:space-y-6 text-left animate-fade-in-up">
            <div className="space-y-2.5 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#04140B]/75 backdrop-blur-md border border-[#63D98A]/45 text-[10px] sm:text-xs font-semibold tracking-[0.16em] sm:tracking-[0.25em] uppercase text-[#63D98A] shadow-lg max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63D98A] animate-pulse shrink-0" />
                <span className="truncate">APOSTOLIC &amp; PROPHETIC MANDATE</span>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-normal tracking-tight leading-[1.03] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.85)]">
                PROPHET <br />
                <span className="italic font-light text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.9)]">
                  JOHN LORD
                </span>
              </h1>

              <p className="font-serif-luxury text-base sm:text-2xl md:text-[1.7rem] italic tracking-wide text-[#7EE8A2] [text-shadow:0_2px_18px_rgba(0,0,0,0.95)]">
                &ldquo;{ministryProfile.tagline}&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-base max-w-xl font-normal leading-relaxed text-white/95 [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">
              {ministryProfile.subTagline}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              {featuredSermon && (
                <button
                  onClick={() => onOpenVideo(featuredSermon)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_6px_30px_rgba(22,138,69,0.55)] hover:shadow-[0_6px_35px_rgba(99,217,138,0.6)] group min-h-[48px] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current text-[#63D98A] group-hover:scale-110 transition-transform" />
                  </div>
                  <span>WATCH MESSAGES</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('ministry')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-300 border flex items-center justify-center gap-2 group min-h-[48px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-[#041009]/65 hover:bg-[#041009]/85 backdrop-blur-md text-white border-white/35 hover:border-[#63D98A]"
              >
                <span>DISCOVER THE MINISTRY</span>
                <ArrowRight className="w-4 h-4 text-[#63D98A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quiet metadata line */}
            <div className="pt-4 sm:pt-5 border-t border-white/25 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono text-white/85 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
              <span>GLOBAL REVELATION</span>
              <span>·</span>
              <span>SUPERNATURAL REALMS</span>
              <span>·</span>
              <span>KINGDOM DISCIPLES</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator with bounce */}
        <div className="hidden lg:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1 text-[10px] tracking-widest uppercase pointer-events-none text-white/75 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#63D98A]" />
        </div>
      </section>


      {/* ========================================================
          2. INTRODUCTION SECTION (Large Editorial Statement)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'
      }`}>
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10 text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#168A45] dark:text-[#63D98A] font-semibold">
            EDITORIAL STATEMENT
          </span>

          <h2 className={`font-serif-luxury text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-wide ${
            isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
          }`}>
            A VOICE OF FAITH. <br />
            <span className="italic text-[#168A45] dark:text-[#63D98A]">A LIFE OF PURPOSE.</span> <br />
            A MANDATE FOR IMPACT.
          </h2>

          <div className="max-w-2xl mx-auto text-sm sm:text-lg font-light leading-relaxed space-y-3 sm:space-y-4">
            <p className={`italic font-serif-luxury text-base sm:text-xl ${
              isLight ? 'text-neutral-800' : 'text-white/90'
            }`}>
              &ldquo;{ministryProfile.introduction}&rdquo;
            </p>
          </div>

          <div className="pt-2 sm:pt-4">
            <button
              onClick={() => onNavigate('about')}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 sm:px-8 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all group min-h-[48px] cursor-pointer hover:scale-[1.02] ${
                isLight
                  ? 'bg-gray-100 hover:bg-[#168A45] text-gray-900 hover:text-white border border-gray-300 hover:border-[#168A45]'
                  : 'bg-white/5 hover:bg-[#168A45]/20 text-white border border-white/15 hover:border-[#63D98A]'
              }`}
            >
              <span>LEARN MORE ABOUT PROPHET JOHN LORD</span>
              <ArrowRight className="w-4 h-4 text-[#168A45] dark:text-[#63D98A] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </section>


      {/* ========================================================
          3. ABOUT PROPHET JOHN LORD (Sophisticated Split Screen)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight
          ? 'bg-[#F4F7F4] border-gray-200'
          : 'bg-gradient-to-b from-[#050505] via-[#0B2418]/20 to-[#050505] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left: Portrait Placeholder */}
          <div className="lg:col-span-5 order-2 lg:order-1 max-w-sm sm:max-w-md lg:max-w-none mx-auto w-full">
            <PortraitPlaceholder
              variant="about"
              className="w-full aspect-[3/4] shadow-2xl"
            />
          </div>

          {/* Right: Editorial Bio & Mandate */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
                ABOUT THE PROPHET
              </span>
              <h2 className={`font-serif-luxury text-2xl sm:text-5xl md:text-6xl font-normal leading-tight ${
                isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
              }`}>
                CALLED TO IMPACT GENERATIONS
              </h2>
            </div>

            <div className={`p-5 sm:p-6 border space-y-3.5 ${
              isLight
                ? 'bg-white border-gray-200 text-neutral-800 shadow-sm'
                : 'bg-white/5 border-white/10 text-white/80'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-[#168A45] dark:text-[#63D98A] font-medium">
                  Official Biography Excerpt
                </span>
              </div>
              <div className="space-y-3">
                {ministryProfile.biography.split('\n\n').slice(0, 2).map((para, i) => (
                  <p key={i} className={`text-xs sm:text-sm font-light leading-relaxed ${
                    i === 0
                      ? 'font-serif-luxury italic text-sm sm:text-base ' + (isLight ? 'text-neutral-900' : 'text-[#F5F7F5]')
                      : isLight ? 'text-neutral-700' : 'text-white/75'
                  }`}>
                    {para}
                  </p>
                ))}
              </div>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#168A45] dark:text-[#63D98A] hover:underline cursor-pointer group"
                >
                  <span>Read Full Ministerial Biography</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Editable Subsections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
              <div className={`p-4 border space-y-1.5 transition-all hover:scale-[1.01] ${
                isLight ? 'bg-white border-gray-200 shadow-xs' : 'bg-[#050505] border-white/10'
              }`}>
                <span className="text-[10px] uppercase tracking-widest text-[#168A45] font-semibold">
                  01 · Calling
                </span>
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  {ministryProfile.subsections.calling}
                </p>
              </div>

              <div className={`p-4 border space-y-1.5 transition-all hover:scale-[1.01] ${
                isLight ? 'bg-white border-gray-200 shadow-xs' : 'bg-[#050505] border-white/10'
              }`}>
                <span className="text-[10px] uppercase tracking-widest text-[#168A45] font-semibold">
                  02 · Vision
                </span>
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  {ministryProfile.subsections.vision}
                </p>
              </div>

              <div className={`p-4 border space-y-1.5 transition-all hover:scale-[1.01] ${
                isLight ? 'bg-white border-gray-200 shadow-xs' : 'bg-[#050505] border-white/10'
              }`}>
                <span className="text-[10px] uppercase tracking-widest text-[#168A45] font-semibold">
                  03 · Mission
                </span>
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  {ministryProfile.subsections.mission}
                </p>
              </div>

              <div className={`p-4 border space-y-1.5 transition-all hover:scale-[1.01] ${
                isLight ? 'bg-white border-gray-200 shadow-xs' : 'bg-[#050505] border-white/10'
              }`}>
                <span className="text-[10px] uppercase tracking-widest text-[#168A45] font-semibold">
                  04 · Ministry Scope
                </span>
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  {ministryProfile.subsections.ministry}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(22,138,69,0.3)] min-h-[48px] cursor-pointer hover:scale-[1.02]"
              >
                <span>READ FULL STORY</span>
                <ArrowRight className="w-4 h-4 text-[#63D98A]" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================
          4. THE MINISTRY (6 Core Pillars)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
                APOSTOLIC PILLARS
              </span>
              <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal ${
                isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
              }`}>
                THE MINISTRY
              </h2>
            </div>
            <p className={`text-sm md:text-base max-w-md font-light leading-relaxed ${
              isLight ? 'text-gray-600' : 'text-white/60'
            }`}>
              Equipping people to discover purpose, walk in faith and make kingdom impact across the nations.
            </p>
          </div>

          {/* Cards Grid with lift animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {ministryPillars.map((pillar) => (
              <div
                key={pillar.id}
                onClick={() => onNavigate('ministry')}
                className={`group p-6 sm:p-8 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 sm:space-y-8 relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${
                  isLight
                    ? 'bg-[#F9FAF9] hover:bg-white border-gray-200 hover:border-[#168A45] shadow-emerald-950/5'
                    : 'bg-[#0B2418]/25 hover:bg-[#0B2418]/60 border-white/10 hover:border-[#168A45]'
                }`}
              >
                {/* Subtle top light bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#168A45] transition-all duration-500" />

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-luxury text-2xl font-light text-[#168A45] dark:text-[#63D98A]">
                      {pillar.number}
                    </span>
                    <span className={`text-[10px] tracking-widest uppercase font-mono ${
                      isLight ? 'text-gray-400' : 'text-white/40'
                    }`}>
                      {pillar.scriptureReference.split('·')[0]}
                    </span>
                  </div>

                  <h3 className={`font-serif-luxury text-2xl sm:text-3xl font-medium transition-colors ${
                    isLight 
                      ? 'text-neutral-900 group-hover:text-[#168A45]' 
                      : 'text-white group-hover:text-[#63D98A]'
                  }`}>
                    {pillar.title}
                  </h3>

                  <p className="text-xs uppercase tracking-wider text-[#168A45] font-semibold">
                    {pillar.subtitle}
                  </p>

                  <p className={`text-sm font-light leading-relaxed ${
                    isLight ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    {pillar.description}
                  </p>
                </div>

                <div className={`pt-4 border-t flex items-center justify-between text-xs transition-colors ${
                  isLight 
                    ? 'border-gray-200 text-gray-600 group-hover:text-[#168A45]' 
                    : 'border-white/10 text-white/60 group-hover:text-white'
                }`}>
                  <span className="tracking-widest uppercase font-semibold text-[10px]">
                    EXPLORE MANDATE
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#168A45] group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================
          5. FEATURED MESSAGE (Dramatic Full-Width Video Section)
         ======================================================== */}
      {featuredSermon && (
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-gradient-to-b from-[#0B2418] to-[#050E09] text-white border-gray-300' : 'bg-cinematic-dark border-white/10'
      }`}>
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-2 sm:space-y-3">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#63D98A] font-semibold">
              FEATURED BROADCAST
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal text-white">
              LATEST MESSAGE
            </h2>
          </div>

          {/* Large Video Section Card */}
          <div className="relative min-h-[340px] sm:min-h-0 sm:aspect-[16/9] w-full max-w-5xl mx-auto bg-black border border-white/15 overflow-hidden group shadow-2xl flex flex-col justify-between rounded-sm">
            <AnimatedImage
              src={featuredSermon.thumbnail}
              alt={featuredSermon.title}
              containerClassName="absolute inset-0"
              className="w-full h-full object-cover filter brightness-70 group-hover:scale-105 transition-all duration-700"
            />
            
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/50 to-black/30" />

            {/* Top Bar */}
            <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between text-xs text-white/60">
              <span className="px-2.5 py-1 bg-black/60 border border-white/10 text-[#63D98A] font-mono text-[10px] uppercase">
                {featuredSermon.category}
              </span>
              <span className="text-[11px] font-mono text-white/70">{featuredSermon.duration}</span>
            </div>

            {/* Centered Play Button with radar pulse animation */}
            <div className="relative z-20 my-auto flex justify-center py-4">
              <div className="relative">
                <span className="absolute -inset-3 rounded-full bg-[#168A45]/40 animate-ping opacity-75" />
                <button
                  onClick={() => onOpenVideo(featuredSermon)}
                  className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-[#168A45]/90 hover:bg-[#168A45] text-white flex items-center justify-center transition-all duration-300 shadow-[0_0_50px_rgba(22,138,69,0.7)] group-hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#63D98A] cursor-pointer"
                  aria-label={`Play sermon: ${featuredSermon.title}`}
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-white translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="relative z-20 p-4 sm:p-8 md:p-10 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                <h3 className="font-serif-luxury text-lg sm:text-3xl md:text-4xl font-medium text-white leading-snug">
                  &ldquo;{featuredSermon.title}&rdquo;
                </h3>
                <p className="text-xs md:text-sm text-white/70 line-clamp-2 font-light">
                  {featuredSermon.description}
                </p>
              </div>

              <button
                onClick={() => onOpenVideo(featuredSermon)}
                className="w-full sm:w-auto px-6 py-3 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all shrink-0 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer hover:scale-105"
              >
                <span>WATCH MESSAGE</span>
                <Play className="w-3.5 h-3.5 fill-current text-[#63D98A]" />
              </button>
            </div>
          </div>
        </div>
      </section>
      )}


      {/* ========================================================
          6. SERMONS (Latest Messages Grid)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAF8] border-gray-200' : 'bg-[#050505] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
                APOSTOLIC RELEASES
              </span>
              <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal ${
                isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
              }`}>
                LATEST MESSAGES
              </h2>
            </div>
            
            <button
              onClick={() => onNavigate('sermons')}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#168A45] dark:text-[#63D98A] hover:underline self-start sm:self-auto py-1 cursor-pointer"
            >
              <span>VIEW ALL MESSAGES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {placeholderSermons.slice(0, 3).map((sermon) => (
              <div
                key={sermon.id}
                className={`group border overflow-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white border-gray-200 hover:border-[#168A45] shadow-xs hover:shadow-lg'
                    : 'bg-[#0B2418]/20 border-white/10 hover:border-[#168A45]'
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <AnimatedImage
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 z-10 pointer-events-none bg-black/35 group-hover:bg-black/20 transition-colors" />
                    
                    <button
                      onClick={() => onOpenVideo(sermon)}
                      className="absolute inset-0 z-20 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity sm:bg-black/50 cursor-pointer"
                      aria-label={`Watch ${sermon.title}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#168A45]/95 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </button>

                    <div className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 bg-black/80 text-[10px] text-white/90 font-mono">
                      {sermon.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className={`flex items-center justify-between text-[11px] ${
                      isLight ? 'text-gray-500' : 'text-white/50'
                    }`}>
                      <span className="text-[#168A45] font-semibold">{sermon.category}</span>
                      <span>{sermon.date}</span>
                    </div>

                    <h3 className={`font-serif-luxury text-xl sm:text-2xl font-medium transition-colors leading-snug ${
                      isLight ? 'text-neutral-900 group-hover:text-[#168A45]' : 'text-white group-hover:text-[#63D98A]'
                    }`}>
                      {sermon.title}
                    </h3>

                    <p className={`text-xs font-light leading-relaxed line-clamp-3 ${
                      isLight ? 'text-gray-600' : 'text-white/60'
                    }`}>
                      {sermon.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <button
                    onClick={() => onOpenVideo(sermon)}
                    className={`w-full py-3 text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 border min-h-[44px] cursor-pointer ${
                      isLight
                        ? 'bg-gray-50 hover:bg-[#168A45] text-neutral-900 hover:text-white border-gray-200 hover:border-[#168A45]'
                        : 'bg-white/5 hover:bg-[#168A45] text-white border-white/10 group-hover:border-[#168A45]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#168A45] group-hover:text-white" />
                    <span>WATCH BROADCAST</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================
          7. EVENTS (Upcoming Gatherings)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight
          ? 'bg-white border-gray-200'
          : 'bg-gradient-to-b from-[#050505] via-[#0B2418]/25 to-[#050505] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
                HOLY CONVOCATIONS
              </span>
              <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal ${
                isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
              }`}>
                UPCOMING EVENTS
              </h2>
            </div>

            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#168A45] dark:text-[#63D98A] hover:underline self-start sm:self-auto py-1 cursor-pointer"
            >
              <span>VIEW FULL ITINERARY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {events.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className={`border transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-1 ${
                  isLight
                    ? 'bg-[#F9FAF9] hover:bg-white border-gray-200 hover:border-[#168A45] shadow-xs hover:shadow-md'
                    : 'bg-[#050505] border-white/10 hover:border-[#168A45]'
                }`}
              >
                {/* Event Flyer Banner */}
                {evt.image && (
                  <div className="relative aspect-[16/7] w-full overflow-hidden bg-neutral-900 border-b border-white/10">
                    <AnimatedImage
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                <div className="p-4 sm:p-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#168A45] uppercase tracking-wider font-semibold font-mono">
                      {evt.category}
                    </span>
                    <span className={`px-2.5 py-1 border text-[10px] tracking-wider uppercase ${
                      isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/10 text-white/70'
                    }`}>
                      {evt.registrationOpen ? 'Seat Reservation Open' : 'Walk-in'}
                    </span>
                  </div>

                  <h3 className={`font-serif-luxury text-xl sm:text-3xl font-medium transition-colors ${
                    isLight ? 'text-neutral-900 group-hover:text-[#168A45]' : 'text-white group-hover:text-[#63D98A]'
                  }`}>
                    {evt.title}
                  </h3>

                  <div className={`space-y-2 text-xs ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#168A45] shrink-0" />
                      <span className={`font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#168A45] shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-[#168A45] shrink-0" />
                      <span className="truncate min-w-0 flex-1">{evt.location}</span>
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                    isLight ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    {evt.description}
                  </p>
                </div>

                <div className={`pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                  <button
                    onClick={() => onOpenEvent(evt)}
                    className="w-full py-3.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[44px] cursor-pointer"
                  >
                    <span>LEARN MORE & RESERVE SEAT</span>
                    <ArrowRight className="w-4 h-4 text-[#63D98A]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================
          8. RESOURCES (Books, Devotionals, Teachings)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAF8] border-gray-200' : 'bg-[#050505] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
                KINGDOM CURRICULUM
              </span>
              <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal ${
                isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
              }`}>
                MINISTRY RESOURCES
              </h2>
            </div>

            <button
              onClick={() => onNavigate('resources')}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#168A45] dark:text-[#63D98A] hover:underline self-start sm:self-auto py-1 cursor-pointer"
            >
              <span>EXPLORE ALL RESOURCES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {placeholderResources.map((res) => (
              <div
                key={res.id}
                className={`group border p-5 flex flex-col justify-between space-y-5 transition-all hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white border-gray-200 hover:border-[#168A45] shadow-xs hover:shadow-lg'
                    : 'bg-[#0B2418]/20 border-white/10 hover:border-[#168A45]'
                }`}
              >
                <div className="space-y-4">
                  {/* Cover */}
                  <div className="aspect-[3/4] w-full bg-[#0B2418] border border-white/10 overflow-hidden relative shadow-lg">
                    <AnimatedImage
                      src={res.coverImage}
                      alt={res.title}
                      className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-black/80 text-[9px] uppercase tracking-wider text-[#63D98A] font-mono">
                      {res.type}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className={`font-serif-luxury text-xl font-medium transition-colors leading-snug ${
                      isLight ? 'text-neutral-900 group-hover:text-[#168A45]' : 'text-white group-hover:text-[#63D98A]'
                    }`}>
                      {res.title}
                    </h3>
                    <p className={`text-[11px] ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{res.format}</p>
                  </div>

                  <p className={`text-xs font-light line-clamp-3 ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                    {res.description}
                  </p>
                </div>

                <button
                  onClick={() => onOpenResource(res)}
                  className={`w-full py-3 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border min-h-[44px] cursor-pointer ${
                    isLight
                      ? 'bg-gray-50 hover:bg-[#168A45] text-neutral-900 hover:text-white border-gray-200 hover:border-[#168A45]'
                      : 'bg-white/5 hover:bg-[#168A45] text-white border-white/10'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#168A45]" />
                  <span>ACCESS ASSET</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================
          9. TESTIMONIALS (Elegant Slider / Carousel)
         ======================================================== */}
      {currentTestimony && (
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t overflow-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-[#EFF5F0] border-gray-200'
          : 'bg-gradient-to-b from-[#050505] via-[#0B2418]/30 to-[#050505] border-white/10'
      }`}>
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 text-center relative z-10">
          <div className="space-y-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
              EVIDENCE OF GRACE
            </span>
            <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal ${
              isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
            }`}>
              TESTIMONIES
            </h2>
          </div>

          <div className={`relative p-6 sm:p-10 md:p-14 border shadow-2xl space-y-5 sm:space-y-6 ${
            isLight ? 'bg-white border-gray-200 text-neutral-900' : 'bg-[#050505] border-white/10 text-white'
          }`}>
            <Quote className="w-8 h-8 sm:w-12 sm:h-12 text-[#168A45]/40 mx-auto" />
            
            <p className={`font-serif-luxury italic text-lg sm:text-2xl md:text-3xl leading-relaxed max-w-2xl mx-auto ${
              isLight ? 'text-neutral-900' : 'text-white/90'
            }`}>
              &ldquo;{currentTestimony.quote}&rdquo;
            </p>

            <div className={`space-y-1 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <span className={`text-xs sm:text-sm font-semibold tracking-wider uppercase block ${
                isLight ? 'text-neutral-900' : 'text-white'
              }`}>
                {currentTestimony.name}
              </span>
              <span className="text-xs text-[#168A45] font-light">
                {currentTestimony.location} · {currentTestimony.category}
              </span>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center justify-center gap-4 pt-2 sm:pt-4">
              <button
                onClick={handlePrevTestimonial}
                className={`p-2 sm:p-2.5 border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
                  isLight
                    ? 'border-gray-300 hover:border-[#168A45] hover:bg-gray-100 text-neutral-800'
                    : 'border-white/15 hover:border-[#63D98A] hover:bg-white/5 text-white/70 hover:text-white'
                }`}
                aria-label="Previous testimony"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className={`text-xs font-mono ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                {String(safeTestimonialIndex + 1).padStart(2, '0')} / {String(placeholderTestimonials.length).padStart(2, '0')}
              </div>

              <button
                onClick={handleNextTestimonial}
                className={`p-2 sm:p-2.5 border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
                  isLight
                    ? 'border-gray-300 hover:border-[#168A45] hover:bg-gray-100 text-neutral-800'
                    : 'border-white/15 hover:border-[#63D98A] hover:bg-white/5 text-white/70 hover:text-white'
                }`}
                aria-label="Next testimony"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`text-[11px] sm:text-xs italic ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
            * Verified testimonies shared by partners and worshipers.
          </div>
        </div>
      </section>
      )}


      {/* ========================================================
          10. SOCIAL MEDIA (Connect With The Ministry)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-t transition-colors duration-300 ${
        isLight ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 text-center">
          <div className="space-y-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
              GLOBAL BROADCAST NETWORK
            </span>
            <h2 className={`font-serif-luxury text-3xl sm:text-5xl font-normal ${
              isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
            }`}>
              CONNECT WITH THE MINISTRY
            </h2>
            <p className={`text-xs md:text-sm max-w-lg mx-auto font-light ${
              isLight ? 'text-gray-600' : 'text-white/60'
            }`}>
              Follow official channels for live prophetic transmissions, apostolic declarations, and media updates.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 sm:p-6 border transition-all group flex flex-col items-center justify-center space-y-2 sm:space-y-3 min-h-[104px] hover:-translate-y-1 last:col-span-2 sm:last:col-span-1 ${
                  isLight
                    ? 'bg-[#F9FAF9] hover:bg-emerald-50 border-gray-200 hover:border-[#168A45] text-neutral-900 shadow-xs'
                    : 'bg-white/5 hover:bg-[#0B2418] border-white/10 hover:border-[#63D98A] text-white'
                }`}
              >
                <span className={`font-serif-luxury text-base sm:text-xl font-medium transition-colors ${
                  isLight ? 'text-neutral-900 group-hover:text-[#168A45]' : 'text-white group-hover:text-[#63D98A]'
                }`}>
                  {social.name}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-mono truncate max-w-full ${
                  isLight ? 'text-gray-400' : 'text-white/40'
                }`}>
                  {social.handle}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#168A45]" />
              </a>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================
          11. GIVING (Partner With The Vision)
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 border-t text-center transition-colors duration-300 ${
        isLight
          ? 'bg-gradient-to-b from-[#EBF5EE] via-[#F8FAF8] to-white border-gray-200'
          : 'bg-cinematic-glow border-white/10'
      }`}>
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-[#168A45] dark:text-[#63D98A]">
            <Flame className="w-4 h-4" />
            <span>COVENANT PARTNERSHIP</span>
          </div>

          <h2 className={`font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal ${
            isLight ? 'text-neutral-950' : 'text-[#F5F7F5]'
          }`}>
            PARTNER WITH THE VISION
          </h2>

          <div className={`p-4 sm:p-6 border max-w-2xl mx-auto shadow-xs ${
            isLight ? 'bg-white border-gray-200 text-neutral-800' : 'bg-white/5 border-white/10 text-white/80'
          }`}>
            <p className="text-sm md:text-base font-light italic font-serif-luxury leading-relaxed">
              &ldquo;{ministryProfile.givingMessage}&rdquo;
            </p>
          </div>

          <div>
            <button
              onClick={onOpenGiveModal}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_30px_rgba(22,138,69,0.4)] hover:shadow-[0_4px_45px_rgba(99,217,138,0.5)] inline-flex items-center justify-center gap-3 min-h-[48px] cursor-pointer hover:scale-105 active:scale-95"
            >
              <Flame className="w-4 h-4 text-[#63D98A]" />
              <span>GIVE NOW</span>
            </button>
          </div>

          <p className={`text-xs max-w-md mx-auto font-light ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
            Empower worldwide missions, crusades, humanitarian compassion drives, and television broadcasts.
          </p>
        </div>
      </section>


      {/* ========================================================
          12. NEWSLETTER (Stay Connected)
         ======================================================== */}
      <NewsletterSection />


      {/* ========================================================
          13. CONTACT CTA
         ======================================================== */}
      <section className={`relative py-16 sm:py-24 px-4 sm:px-6 md:px-12 text-center border-t transition-colors duration-300 ${
        isLight ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'
      }`}>
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#168A45] dark:text-[#63D98A] font-semibold">
            DIRECT MINISTERIAL INQUIRIES
          </span>
          <h2 className={`font-serif-luxury text-2xl sm:text-5xl font-normal leading-tight ${
            isLight ? 'text-neutral-950' : 'text-white'
          }`}>
            SEEKING PROPHETIC COUNSEL OR MINISTRY ENGAGEMENT?
          </h2>
          <p className={`text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto ${
            isLight ? 'text-gray-600' : 'text-white/70'
          }`}>
            Reach the official office of Prophet John Lord for speaking invitations, prayer requests, or partnership inquiries.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('contact')}
              className={`w-full sm:w-auto px-8 py-3.5 border text-xs font-semibold tracking-widest uppercase transition-all inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer hover:scale-105 ${
                isLight
                  ? 'bg-neutral-950 hover:bg-[#168A45] text-white border-neutral-950 hover:border-[#168A45]'
                  : 'bg-transparent hover:bg-white/5 border-[#168A45] hover:border-[#63D98A] text-white'
              }`}
            >
              <span>ACCESS CONTACT PORTAL</span>
              <ArrowRight className="w-4 h-4 text-[#63D98A]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
