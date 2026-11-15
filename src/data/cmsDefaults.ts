import type { CMSContent, EventItem, HeroSlideshowSettings } from '../types/index.ts';
import {
  FORMSPREE_ENDPOINT,
  heroSlideshowImages,
  coreMandates,
  ministryProfile,
  contactInfo,
  mobileMoneyDetails,
  whatsappConfig,
  socialLinks,
  ministryPillars,
  placeholderSermons,
  placeholderEvents,
  placeholderResources,
  placeholderTestimonials,
  givingInitiatives,
} from './ministryData.ts';

const starterEventImages = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
];

const defaultEvents: EventItem[] = placeholderEvents.map((evt, idx) => ({
  ...evt,
  image: evt.image || starterEventImages[idx % starterEventImages.length],
  themeOrScripture: evt.themeOrScripture || 'Jeremiah 1:10',
  speaker: evt.speaker || 'Prophet John Lord',
}));

export const DEFAULT_CORE_TENETS: string[] = [
  'Biblical Inerrancy & The Uncompromising Word of God',
  'Authentic Prophetic Demonstration Governed by Love & Humility',
  'Kingdom Impact Beyond the Church Walls into Culture & Marketplace',
  'Generational Stewardship, Mentorship, and Leadership Succession',
];

export const DEFAULT_HERO_SETTINGS: HeroSlideshowSettings = {
  intervalSeconds: 180, // 3 minutes
  animationDurationMs: 2600, // 2.6s smooth & graceful assembly
  transitionAnimation: 'mosaic-tiles',
  imageFitMode: 'fill-stretch',
};

export function createDefaultCMSContent(): CMSContent {
  return {
    profile: structuredClone(ministryProfile),
    heroSlides: structuredClone(heroSlideshowImages),
    heroSettings: structuredClone(DEFAULT_HERO_SETTINGS),
    coreMandates: structuredClone(coreMandates),
    pillars: structuredClone(ministryPillars),
    sermons: structuredClone(placeholderSermons),
    events: structuredClone(defaultEvents),
    resources: structuredClone(placeholderResources),
    testimonials: structuredClone(placeholderTestimonials),
    givingInitiatives: structuredClone(givingInitiatives),
    mobileMoneyDetails: structuredClone(mobileMoneyDetails),
    contactInfo: structuredClone(contactInfo),
    socialLinks: structuredClone(socialLinks),
    whatsappConfig: structuredClone(whatsappConfig),
    formspreeEndpoint: FORMSPREE_ENDPOINT,
    coreTenets: structuredClone(DEFAULT_CORE_TENETS),
  };
}
