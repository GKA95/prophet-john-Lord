export type PageId = 
  | 'home' 
  | 'about' 
  | 'ministry' 
  | 'sermons' 
  | 'events' 
  | 'resources' 
  | 'contact' 
  | 'give';

export interface HeroSlideItem {
  id: string;
  src: string;
  remoteUrl: string;
  title: string;
  subtitle: string;
  scripture: string;
}

export interface MinistryProfileData {
  name: string;
  shortName: string;
  honorific: string;
  tagline: string;
  subTagline: string;
  introduction: string;
  biography: string;
  subsections: {
    calling: string;
    vision: string;
    mission: string;
    ministry: string;
    background: string;
  };
  ministryDescription: string;
  givingMessage: string;
  heroImagePlaceholderNote: string;
  portraitPlaceholderNote: string;
  officialPortrait: string;
  officialPortraitUrl: string;
  secondPortrait: string;
  secondPortraitUrl: string;
}

export interface ContactInfoData {
  email: string;
  phone: string;
  location: string;
  officeHours: string;
  prayerLine: string;
  partnershipEmail: string;
  whatsappNumber: string;
}

export interface MobileMoneyDetails {
  network: string;
  networkShort: string;
  number: string;
  displayNumber: string;
  rawNumber: string;
  internationalNumber: string;
  accountName: string;
  country: string;
  referenceNote: string;
  ussdCode: string;
  ussdSteps: string[];
  whatsappNumber: string;
  whatsappLink: string;
}

export interface WhatsAppQuickOption {
  label: string;
  message: string;
}

export interface WhatsAppConfig {
  phoneNumber: string;
  displayNumber: string;
  officialTitle: string;
  statusSubtitle: string;
  welcomeMessage: string;
  defaultMessage: string;
  quickOptions: WhatsAppQuickOption[];
}

export interface GivingInitiative {
  id: string;
  title: string;
  description: string;
  badge: string;
}

export interface SermonItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  youtubeId?: string;
  date: string;
  category: string;
  duration: string;
  scripture?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  registrationOpen: boolean;
  venueDetails?: string;
  image?: string;
  themeOrScripture?: string;
  speaker?: string;
  createdAt?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'Book' | 'Devotional' | 'Teaching' | 'Article' | 'Download' | 'Audio Series' | 'Study Guide';
  description: string;
  format: string;
  author: string;
  downloadUrl?: string;
  pagesOrDuration?: string;
  coverImage?: string;
}

export interface MinistryPillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  scriptureReference: string;
  keyInitiatives: string[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  location: string;
  category: string;
}

export interface SocialLink {
  name: string;
  platform: 'YouTube' | 'Instagram' | 'Facebook' | 'TikTok' | 'X';
  url: string;
  handle: string;
}

export interface MinistryCoreMandate {
  id: string;
  number: string;
  title: string;
  badge: string;
  scriptureReference: string;
  summary: string;
  paragraphs: string[];
}

export type HeroTransitionAnimation =
  | 'mosaic-tiles'
  | 'vertical-blinds'
  | 'diagonal-slices'
  | 'cinematic-fade';

export type HeroImageFitMode =
  | 'fill-stretch'
  | 'cover-upper'
  | 'cover-top'
  | 'cover-center'
  | 'contain-backdrop';

export interface HeroSlideshowSettings {
  intervalSeconds: number;
  animationDurationMs: number;
  transitionAnimation: HeroTransitionAnimation;
  imageFitMode: HeroImageFitMode;
}

export interface CMSContent {
  profile: MinistryProfileData;
  heroSlides: HeroSlideItem[];
  heroSettings: HeroSlideshowSettings;
  coreMandates: MinistryCoreMandate[];
  pillars: MinistryPillar[];
  sermons: SermonItem[];
  events: EventItem[];
  resources: ResourceItem[];
  testimonials: TestimonialItem[];
  givingInitiatives: GivingInitiative[];
  mobileMoneyDetails: MobileMoneyDetails;
  contactInfo: ContactInfoData;
  socialLinks: SocialLink[];
  whatsappConfig: WhatsAppConfig;
  formspreeEndpoint: string;
  coreTenets: string[];
}

export interface CMSPayload {
  version: string;
  updatedAt: string;
  content: CMSContent;
}

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  phone?: string;
  attendeeCount: string;
  createdAt: string;
}

export interface CMSSubmissions {
  newsletterSubscribers: NewsletterSubscriber[];
  contactSubmissions: ContactSubmission[];
  eventRegistrations: EventRegistration[];
}

export interface MediaAssetRecord {
  id: string;
  publicId?: string;
  url: string;
  secureUrl: string;
  filename: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  provider: 'cloudinary' | 'local';
  createdAt: string;
}

export interface StorageBackendInfo {
  database: 'mongodb' | 'json';
  databaseName: string;
  mongoConnected: boolean;
  mongoError?: string;
  mediaHost: 'cloudinary' | 'local';
  cloudinaryConfigured: boolean;
  cloudinaryFolder: string;
  cloudinaryCloudName?: string;
  adminSecretsConfigured?: boolean;
}

export type PaystackCurrency = 'GHS' | 'USD' | 'GBP' | 'EUR' | 'NGN' | 'KES' | 'ZAR';

export interface PaystackTransactionResult {
  reference: string;
  trans?: string;
  status: 'success' | 'failed';
  message: string;
  transaction?: string;
  amount: number;
  currency: PaystackCurrency;
  donorName: string;
  email: string;
  phone?: string;
  fund: string;
  frequency: 'one-time' | 'monthly';
  prayerRequest?: string;
  paidAt: string;
}
