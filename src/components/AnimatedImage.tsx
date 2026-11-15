import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import type { HeroTransitionAnimation } from '../types';

interface AnimatedImageProps {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  animationStyle?: HeroTransitionAnimation;
  durationMs?: number;
  intrinsicSize?: boolean;
  onError?: () => void;
  threshold?: number;
}

/**
 * Strip positioning/sizing tokens from className so cut-piece tile <img>s
 * keep object-fit, object-position, filter, and hover scale while letting
 * inline tile offsets place every fragment pixel-accurately.
 */
function getTileImageClasses(rawClassName: string): string {
  return rawClassName
    .split(/\s+/)
    .filter(
      (token) =>
        token &&
        token !== 'absolute' &&
        token !== 'relative' &&
        token !== 'inset-0' &&
        token !== 'w-full' &&
        token !== 'h-full' &&
        token !== 'w-auto' &&
        token !== 'mx-auto'
    )
    .join(' ');
}

export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  animationStyle,
  durationMs,
  intrinsicSize = false,
  onError,
  threshold = 0.08,
}) => {
  const { content } = useCMS();
  const heroSettings = content.heroSettings;

  const resolvedAnimation: HeroTransitionAnimation =
    animationStyle || heroSettings?.transitionAnimation || 'mosaic-tiles';

  const resolvedDurationMs = useMemo(() => {
    const base =
      typeof durationMs === 'number'
        ? durationMs
        : Number(heroSettings?.animationDurationMs) || 2600;
    return Math.min(6500, Math.max(600, base));
  }, [durationMs, heroSettings?.animationDurationMs]);

  const pieceDurationMs = Math.round(resolvedDurationMs * 0.72);
  const staggerBudgetMs = Math.round(resolvedDurationMs * 0.28);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animCycle, setAnimCycle] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const [failedCompletely, setFailedCompletely] = useState(false);

  const activeSrc = usedFallback ? fallbackSrc : src || fallbackSrc;
  const tileImgClass = useMemo(() => getTileImageClasses(className), [className]);

  // Reset error state whenever src changes
  useEffect(() => {
    setUsedFallback(false);
    setFailedCompletely(false);
  }, [src, fallbackSrc]);

  // Observe intersection with viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: '40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  // Trigger piece-join animation on viewport entry or source change
  useEffect(() => {
    if (!hasEnteredView || !activeSrc) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setAnimCycle((c) => c + 1);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, resolvedDurationMs + 180);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasEnteredView, activeSrc, resolvedDurationMs, resolvedAnimation]);

  const handleImgError = () => {
    onError?.();
    if (!usedFallback && fallbackSrc && fallbackSrc !== activeSrc) {
      setUsedFallback(true);
    } else {
      setFailedCompletely(true);
    }
  };

  const renderAnimatedPieces = () => {
    if (!activeSrc) return null;

    if (resolvedAnimation === 'cinematic-fade') {
      return (
        <div
          key={`img-fade-${animCycle}`}
          className="absolute inset-0 w-full h-full z-10 animate-fade-in pointer-events-none"
          style={{ animationDuration: `${resolvedDurationMs}ms` }}
        >
          <img
            src={activeSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={handleImgError}
            className={`w-full h-full ${tileImgClass}`}
          />
        </div>
      );
    }

    if (resolvedAnimation === 'vertical-blinds') {
      const cols = 6;
      const delayStep = Math.round(staggerBudgetMs / Math.max(cols - 1, 1));
      return (
        <div
          key={`img-blinds-${animCycle}`}
          className="absolute inset-0 w-full h-full z-10 grid grid-cols-6 pointer-events-none"
          aria-hidden="true"
        >
          {Array.from({ length: cols }).map((_, col) => {
            const ty = col % 2 === 0 ? '-34%' : '34%';
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
                <img
                  src={activeSrc}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{
                    position: 'absolute',
                    width: `${cols * 100}%`,
                    height: '100%',
                    maxWidth: 'none',
                    left: `${-col * 100}%`,
                    top: 0,
                  }}
                  className={tileImgClass}
                />
              </div>
            );
          })}
        </div>
      );
    }

    if (resolvedAnimation === 'diagonal-slices') {
      const rows = 5;
      const delayStep = Math.round(staggerBudgetMs / Math.max(rows - 1, 1));
      return (
        <div
          key={`img-slices-${animCycle}`}
          className="absolute inset-0 w-full h-full z-10 grid grid-rows-5 pointer-events-none"
          aria-hidden="true"
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
                <img
                  src={activeSrc}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: `${rows * 100}%`,
                    maxWidth: 'none',
                    left: 0,
                    top: `${-row * 100}%`,
                  }}
                  className={tileImgClass}
                />
              </div>
            );
          })}
        </div>
      );
    }

    // Default: 'mosaic-tiles' (4x3 = 12 cut pieces flying smoothly together)
    const cols = 4;
    const rows = 3;
    const maxDistance = (cols - 1) + (rows - 1);
    return (
      <div
        key={`img-mosaic-${animCycle}`}
        className="absolute inset-0 w-full h-full z-10 grid grid-cols-4 grid-rows-3 pointer-events-none"
        aria-hidden="true"
      >
        {Array.from({ length: cols * rows }).map((_, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const dx = (col - 1.5) * 28;
          const dy = row === 1 && (col === 1 || col === 2) ? -28 : (row - 1) * 34;
          const rot = (col + row) % 2 === 0 ? -3 : 3;
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
                  '--scl': '0.82',
                  animationDuration: `${pieceDurationMs}ms`,
                  animationDelay: `${delay}ms`,
                } as React.CSSProperties
              }
            >
              <img
                src={activeSrc}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  position: 'absolute',
                  width: `${cols * 100}%`,
                  height: `${rows * 100}%`,
                  maxWidth: 'none',
                  left: `${-col * 100}%`,
                  top: `${-row * 100}%`,
                }}
                className={tileImgClass}
              />
            </div>
          );
        })}
      </div>
    );
  };

  if (failedCompletely || !activeSrc) {
    return (
      <div
        ref={containerRef}
        className={`relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0B2418] via-[#06140D] to-[#040B07] text-[#63D98A]/80 p-4 text-center ${
          intrinsicSize ? 'min-h-[200px] w-full' : 'w-full h-full'
        } ${containerClassName}`}
      >
        <ImageIcon className="w-7 h-7 opacity-60" />
        <span className="text-[11px] font-medium line-clamp-2 max-w-[200px] opacity-80">
          {alt}
        </span>
      </div>
    );
  }

  if (intrinsicSize) {
    return (
      <div
        ref={containerRef}
        className={`relative inline-block overflow-hidden ${containerClassName}`}
      >
        {/* Solid image anchors exact dimensions & becomes crisp once pieces join */}
        <img
          src={activeSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={handleImgError}
          className={`${className} transition-opacity duration-200 ${
            !hasEnteredView || isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {hasEnteredView && isAnimating && renderAnimatedPieces()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${containerClassName}`}
    >
      {/* Solid base image (hidden until piece animation settles so pieces assemble onto canvas cleanly) */}
      <img
        src={activeSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={handleImgError}
        className={`${className} transition-opacity duration-200 ${
          !hasEnteredView || isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {hasEnteredView && isAnimating && renderAnimatedPieces()}
    </div>
  );
};
