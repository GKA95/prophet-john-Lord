import type { SermonItem, EventItem, ResourceItem, MinistryPillar, TestimonialItem, SocialLink, MinistryCoreMandate } from '../types/index.ts';

/**
 * FORMSPREE CONTACT FORM CONFIGURATION
 * Replace "YOUR_FORMSPREE_ENDPOINT" with your real Formspree endpoint ID or full URL later.
 */
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT";

/**
 * HERO SLIDESHOW IMAGES CONFIGURATION
 * High quality ministerial portraits with remote Imgur fallbacks
 */
export const heroSlideshowImages = [
  {
    id: "hero-1",
    src: "/images/prophet-john-lord.jpg",
    remoteUrl: "https://i.imgur.com/pH2YsEI.jpeg",
    title: "Prophet John Lord",
    subtitle: "Apostolic & Prophetic Mandate",
    scripture: "Jeremiah 1:10",
  },
  {
    id: "hero-2",
    src: "/images/prophet-hero-RhBIWRI.jpg",
    remoteUrl: "https://i.imgur.com/RhBIWRI.jpg",
    title: "Prophetic Voice",
    subtitle: "Divine Direction & Kingdom Power",
    scripture: "Jeremiah 1:10",
  },
  {
    id: "hero-3",
    src: "/images/prophet-hero-U4nkCjx.jpg",
    remoteUrl: "https://i.imgur.com/U4nkCjx.jpg",
    title: "Altar of Intercession",
    subtitle: "Raising Generations for God's Kingdom",
    scripture: "Jeremiah 1:10",
  },
  {
    id: "hero-4",
    src: "/images/prophet-hero-Et2i5bm.jpg",
    remoteUrl: "https://i.imgur.com/Et2i5bm.jpg",
    title: "Healing & Deliverance",
    subtitle: "Demonstrating God's Love & Power",
    scripture: "Jeremiah 1:10",
  },
  {
    id: "hero-5",
    src: "/images/prophet-hero-28KrSAc.jpg",
    remoteUrl: "https://i.imgur.com/28KrSAc.jpg",
    title: "Global Outreach",
    subtitle: "United Conquers Church • The Lord Builders",
    scripture: "Jeremiah 1:10",
  },
];

/**
 * CORE MINISTERIAL MANDATES
 * 01 — MY CALLING, OUR VISION, OUR MISSION, OUR MINISTRY SCOPE
 */
export const coreMandates: MinistryCoreMandate[] = [
  {
    id: "calling",
    number: "01",
    title: "MY CALLING",
    badge: "Divine Calling",
    scriptureReference: "Jeremiah 1:10",
    summary: "Called by God to proclaim His Word, reveal His purposes, and bring hope, healing, and restoration to lives through the power of Jesus Christ.",
    paragraphs: [
      "Called by God to proclaim His Word, reveal His purposes, and bring hope, healing, and restoration to lives through the power of Jesus Christ.",
      "Inspired by Jeremiah 1:10, my prophetic assignment is to uproot what destroys, tear down spiritual strongholds, build lives through God's Word, and plant generations in righteousness.",
      "My calling is not only to speak prophetically but also to lead souls to Christ, strengthen believers, and prepare generations for God's Kingdom."
    ]
  },
  {
    id: "vision",
    number: "02",
    title: "OUR VISION",
    badge: "Kingdom Vision",
    scriptureReference: "Jeremiah 1:10",
    summary: "To raise a generation of believers who know God, walk in His power, and fulfill their divine purpose.",
    paragraphs: [
      "To raise a generation of believers who know God, walk in His power, and fulfill their divine purpose.",
      "Guided by Jeremiah 1:10, our vision is to see lives delivered from spiritual bondage, broken destinies restored, strong believers established, and nations transformed through the Gospel of Jesus Christ.",
      "We envision a global prophetic and prayer movement that builds God's Kingdom, raises spiritual leaders, and prepares generations to become vessels of His glory."
    ]
  },
  {
    id: "mission",
    number: "03",
    title: "OUR MISSION",
    badge: "Global Mission",
    scriptureReference: "Jeremiah 1:10",
    summary: "To proclaim the Gospel of Jesus Christ to all nations through prophetic ministry, powerful intercession, healing prayers, deliverance, and the teaching of God's Word.",
    paragraphs: [
      "To proclaim the Gospel of Jesus Christ to all nations through prophetic ministry, powerful intercession, healing prayers, deliverance, and the teaching of God's Word.",
      "Inspired by Jeremiah 1:10, our mission is to uproot spiritual strongholds, break destructive patterns, restore broken lives, and build a generation firmly established in Christ.",
      "We are committed to winning souls, raising prayer warriors, equipping spiritual leaders, strengthening families, and establishing Christ-centered communities across nations."
    ]
  },
  {
    id: "scope",
    number: "04",
    title: "OUR MINISTRY SCOPE",
    badge: "Territorial Scope",
    scriptureReference: "Jeremiah 1:10",
    summary: "Prophet John Lord's ministry is committed to reaching nations with the Gospel of Jesus Christ through prophetic ministry, intercessory prayer, healing, deliverance, evangelism, and spiritual leadership.",
    paragraphs: [
      "Prophet John Lord's ministry is committed to reaching nations with the Gospel of Jesus Christ through prophetic ministry, intercessory prayer, healing, deliverance, evangelism, and spiritual leadership.",
      "Through United Conquers Church and The Lord Builders Global Intercessors, the ministry seeks to raise strong believers, equip prayer warriors, restore lives, and establish Christ-centered communities.",
      "With a growing vision for international outreach, the ministry is dedicated to impacting generations, transforming communities, and bringing people from different nations together as one family in Christ."
    ]
  }
];

/**
 * BRAND & PASTOR PROFILE
 * All fields are centralized and easily editable.
 */
export const ministryProfile = {
  name: "PROPHET JOHN LORD",
  shortName: "Prophet John Lord",
  honorific: "Prophet",
  tagline: "Prophetic Voice. Kingdom Impact. Transforming Lives.",
  subTagline: "Equipping people to discover purpose, walk in faith and make kingdom impact across the nations.",
  
  // Official biography & ministerial identity
  introduction: "Prophet John Lord is a Ghanaian prophetic minister, founder of United Conquers Church, and President of The Lord Builders Global Intercessors. Dedicated to preaching the Gospel of Jesus Christ, demonstrating God's love through prayer, and raising generations for God's Kingdom.",
  biography: `Prophet John Lord is a Ghanaian prophetic minister, founder of United Conquers Church, and President of The Lord Builders Global Intercessors. His ministry is dedicated to preaching the Gospel of Jesus Christ, demonstrating God's love through prayer, and raising generations for God's Kingdom.

His journey into ministry began at the tender age of 12, when he developed a passion for preaching the Word of God. Inspired by his grandmother and the Children of Light, he began sharing the Gospel through community broadcasting and evangelism.

In 2012, he entered a new dimension of ministry, becoming actively involved in prophetic ministry, prayer, and spiritual revelations.

In 2013, he established the Revelation Prayer Center, a non-denominational prayer gathering where people from different Christian backgrounds came together to seek God. The ministry became a place of intercession, prophetic ministry, healing prayers, and deliverance. Among the testimonies shared from these gatherings are accounts of remarkable healings, freedom from spiritual oppression, and a person reportedly being restored to life through prayer.

Since 2016, Prophet John Lord has publicly shared prophecies concerning national and international events, including presidential elections in Ghana and Uganda, the FIFA World Cup, and events involving Lionel Messi. He regards these experiences as part of his prophetic calling.

His ministry is founded on Jeremiah 1:10, with a divine assignment to uproot what destroys lives, establish people in God's truth, and build generations that will stand for Jesus Christ.

Through United Conquers Church and The Lord Builders Global Intercessors, he continues to pursue a vision of reaching nations, raising prayer warriors, equipping believers, and bringing people into a deeper relationship with God.

His message is simple: Jesus Christ is the hope of the nations, and every generation must encounter His love, truth, and transforming power.`,
  
  subsections: {
    calling: "Called by God to proclaim His Word, reveal His purposes, and bring hope, healing, and restoration. Inspired by Jeremiah 1:10, to uproot what destroys, tear down spiritual strongholds, build lives through God's Word, and plant generations in righteousness.",
    vision: "To raise a generation of believers who know God, walk in His power, and fulfill their divine purpose. Guided by Jeremiah 1:10, delivering souls from spiritual bondage, restoring broken destinies, and transforming nations through Jesus Christ.",
    mission: "To proclaim the Gospel of Jesus Christ to all nations through prophetic ministry, powerful intercession, healing prayers, deliverance, winning souls, raising prayer warriors, and equipping spiritual leaders.",
    ministry: "Prophet John Lord's ministry reaches nations through United Conquers Church and The Lord Builders Global Intercessors, dedicated to prophetic ministry, intercessory prayer, healing, deliverance, evangelism, and international outreach.",
    background: "His journey into ministry began at age 12 with a passion for preaching the Word of God. Inspired by his grandmother and the Children of Light, he shared the Gospel through community broadcasting and evangelism, stepping into prophetic ministry and spiritual revelations in 2012.",
  },
  
  ministryDescription: "A prophetic and apostolic ministry founded on Jeremiah 1:10, raising prayer warriors, delivering prophetic truth, and equipping believers across the nations for Jesus Christ.",
  givingMessage: "Your generous partnership empowers United Conquers Church and The Lord Builders Global Intercessors to expand the Gospel, host prayer conferences, and minister to souls worldwide.",
  
  heroImagePlaceholderNote: "PROPHET JOHN LORD MINISTERIAL PORTRAIT",
  portraitPlaceholderNote: "PROPHET JOHN LORD BIOGRAPHICAL PORTRAIT",
  officialPortrait: "/images/prophet-john-lord.jpg",
  officialPortraitUrl: "https://i.imgur.com/pH2YsEI.jpeg",
  secondPortrait: "/images/prophet-john-lord-2.jpg",
  secondPortraitUrl: "https://i.imgur.com/KrrtDEz.jpg",
};

/**
 * CONTACT DETAILS
 */
export const contactInfo = {
  email: "contact@prophetjohnlord.org",
  phone: "+233 24 070 0800",
  location: "Accra, Ghana",
  officeHours: "Monday – Friday: 9:00 AM – 5:00 PM (GMT)",
  prayerLine: "+233 24 070 0800",
  partnershipEmail: "partner@prophetjohnlord.org",
  whatsappNumber: "+233240700800",
};

/**
 * OFFICIAL MTN MOBILE MONEY (MoMo) DETAILS
 * Direct giving and partnership account
 */
export const mobileMoneyDetails = {
  network: "MTN Mobile Money",
  networkShort: "MTN MoMo",
  number: "+233 24 070 0800",
  displayNumber: "024 070 0800",
  rawNumber: "0240700800",
  internationalNumber: "+233240700800",
  accountName: "John Lord",
  country: "Ghana",
  referenceNote: "Use your Name or Seed Purpose as Reference",
  ussdCode: "*170#",
  ussdSteps: [
    "Dial *170# on your MTN phone",
    "Select 1 (Transfer Money) -> 1 (MoMo User)",
    "Enter Mobile Number: 0240700800",
    "Confirm Recipient Name: John Lord",
    "Enter Amount and Reference (e.g. Your Name / Seed Purpose)",
    "Enter your MoMo PIN to authorize"
  ],
  whatsappNumber: "+233240700800",
  whatsappLink: "https://wa.me/233240700800?text=Praise%20God%20Prophet%20John%20Lord,%20I%20have%20sent%20my%20Covenant%20Seed%20via%20MTN%20Mobile%20Money.%20Kindly%20lift%20me%20in%20prayer."
};

/**
 * WHATSAPP CHAT INTEGRATION CONFIGURATION
 * Direct click-to-chat with Prophet John Lord Ministry Desk
 */
export const whatsappConfig = {
  phoneNumber: "233240700800",
  displayNumber: "+233 24 070 0800",
  officialTitle: "Prophet John Lord Ministries",
  statusSubtitle: "Online • Ministry Desk",
  welcomeMessage: "Shalom! Welcome to Prophet John Lord Ministries. How may our team pray with or assist you today?",
  defaultMessage: "Shalom Prophet John Lord Ministries, I am connecting from the official website.",
  quickOptions: [
    { label: "🙏 Urgent Prayer Request", message: "Shalom Prophet John Lord, I would like to submit an urgent prayer request for:" },
    { label: "🤝 Ministry Partnership", message: "Shalom, I would like to partner with Prophet John Lord Ministries." },
    { label: "📖 Prophetic Guidance & Counseling", message: "Shalom, I am seeking prophetic guidance and pastoral counseling." },
    { label: "👋 Send Warm Greetings", message: "Shalom Prophet John Lord, sending warm blessings and greetings!" },
  ],
};

/**
 * SOCIAL MEDIA CHANNELS
 */
export const socialLinks: SocialLink[] = [
  {
    name: "YouTube",
    platform: "YouTube",
    url: "https://www.youtube.com/@prophetjohnlord",
    handle: "@prophetjohnlord",
  },
  {
    name: "Instagram",
    platform: "Instagram",
    url: "https://instagram.com",
    handle: "@prophetjohnlord",
  },
  {
    name: "Facebook",
    platform: "Facebook",
    url: "https://facebook.com",
    handle: "ProphetJohnLordMinistry",
  },
  {
    name: "TikTok",
    platform: "TikTok",
    url: "https://tiktok.com",
    handle: "@prophetjohnlord",
  },
  {
    name: "X",
    platform: "X",
    url: "https://x.com",
    handle: "@prophetjohnlord",
  },
];

/**
 * MINISTRY PILLARS
 * The six core mandates of Prophet John Lord's ministry.
 */
export const ministryPillars: MinistryPillar[] = [
  {
    id: "prophecy",
    number: "01",
    title: "PROPHECY",
    subtitle: "Divine Direction & Supernatural Clarity",
    description: "Releasing timely prophetic words that align hearts with heaven's agenda, bringing precision, breakthrough, and spiritual alignment to individuals and territories.",
    scriptureReference: "Amos 3:7 · 1 Corinthians 14:3",
    keyInitiatives: [
      "Prophetic Consultation & Prayer",
      "Territorial Intercession Assemblies",
      "Prophetic School of Ministry"
    ]
  },
  {
    id: "teaching",
    number: "02",
    title: "TEACHING",
    subtitle: "Doctrinal Depth & Biblical Revelation",
    description: "Unfolding the uncompromised Word of God with revelation depth to build firm faith, establish spiritual maturity, and destroy doctrinal error in the body of Christ.",
    scriptureReference: "2 Timothy 2:15 · Ephesians 4:11-13",
    keyInitiatives: [
      "Kingdom Wisdom Masterclasses",
      "Weekly Revelation Expositions",
      "Leadership Discipleship Track"
    ]
  },
  {
    id: "prayer",
    number: "03",
    title: "PRAYER",
    subtitle: "Apostolic Altar & Intercession",
    description: "Cultivating unceasing prayer altars that birth revival, dismantle strongholds, heal the brokenhearted, and provoke supernatural encounters across continents.",
    scriptureReference: "James 5:16 · Luke 18:1",
    keyInitiatives: [
      "Midnight Watch Intercessory Network",
      "Global Virtual Prayer Altars",
      "Healing & Deliverance Clinics"
    ]
  },
  {
    id: "evangelism",
    number: "04",
    title: "EVANGELISM",
    subtitle: "Harvesting Souls for Jesus Christ",
    description: "Taking the authentic gospel of Jesus Christ to every village, city, and nation with demonstration of the Holy Spirit's power and compassionate soul winning.",
    scriptureReference: "Mark 16:15 · Acts 1:8",
    keyInitiatives: [
      "Frontier Gospel Crusades",
      "Campus & Youth Revival Outreaches",
      "Community Gospel Missions"
    ]
  },
  {
    id: "leadership",
    number: "05",
    title: "LEADERSHIP",
    subtitle: "Mentoring Next-Generation Pioneers",
    description: "Mentoring emerging ministers, marketplace leaders, and spiritual stewards to lead with uncompromised integrity, spiritual discernment, and excellence.",
    scriptureReference: "Proverbs 27:17 · Titus 1:5",
    keyInitiatives: [
      "Prophetic Ministers Roundtable",
      "Marketplace Kingdom Ambassadors",
      "Youth Leadership Mentorship"
    ]
  },
  {
    id: "kingdom-impact",
    number: "06",
    title: "KINGDOM IMPACT",
    subtitle: "Transforming Society & Humanitarian Relief",
    description: "Demonstrating the love of Christ tangibly through community empowerment, humanitarian outreach, youth education initiatives, and social upliftment.",
    scriptureReference: "Matthew 25:35-40 · Micah 6:8",
    keyInitiatives: [
      "Kingdom Hope Foundation Initiatives",
      "Education & Student Scholarships",
      "Emergency Relief & Compassion Drives"
    ]
  }
];

/**
 * SERMON MESSAGES & TEACHINGS
 */
export const placeholderSermons: SermonItem[] = [
  {
    id: "sermon-1",
    title: "THE MYSTERY OF THE TWO TREES: ANGEL & MAKANDIWA",
    description: "A profound prophetic and spiritual exposition by Prophet John Lord uncovering deep kingdom secrets, spiritual fatherhood, mantles, and apostolic mysteries.",
    thumbnail: "https://i.ytimg.com/vi/7QJ-mgMFx9Q/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=7QJ-mgMFx9Q",
    youtubeId: "7QJ-mgMFx9Q",
    date: "Recent Prophetic Release",
    category: "Prophetic Direction",
    duration: "52m",
    scripture: "Genesis 2:9 · Revelation 22:2"
  },
  {
    id: "sermon-2",
    title: "CAN WE STOP THE DISASTER? A PROPHETIC CALL",
    description: "An urgent apostolic and prophetic warning to nations, calling the body of Christ to intense intercessory prayer, repentance, and spiritual alignment.",
    thumbnail: "https://i.ytimg.com/vi/kcIsE388rMQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=kcIsE388rMQ",
    youtubeId: "kcIsE388rMQ",
    date: "Apostolic Altar",
    category: "Spiritual Warfare",
    duration: "1h 08m",
    scripture: "Ezekiel 22:30 · Jeremiah 1:10"
  },
  {
    id: "sermon-3",
    title: "LIONEL MESSI SHOCKING PROPHECY FULFILLED",
    description: "Documented testimony of prophetic foreknowledge concerning international events and sovereign divine guidance in human affairs.",
    thumbnail: "https://i.ytimg.com/vi/gYCQcGJz7MA/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=gYCQcGJz7MA",
    youtubeId: "gYCQcGJz7MA",
    date: "Prophetic Sign",
    category: "Supernatural Encounters",
    duration: "34m",
    scripture: "Amos 3:7 · Luke 1:45"
  },
  {
    id: "sermon-4",
    title: "STRONG WARNING BY PROPHET JOHN LORD",
    description: "Prophetic counsel and spiritual instructions for believers, families, and leaders to navigate turbulent seasons with supernatural clarity.",
    thumbnail: "https://i.ytimg.com/vi/9VBg5CRfA7k/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=9VBg5CRfA7k",
    youtubeId: "9VBg5CRfA7k",
    date: "Prophetic Warning",
    category: "Prophetic Direction",
    duration: "48m",
    scripture: "2 Chronicles 20:20 · Isaiah 46:10"
  },
  {
    id: "sermon-5",
    title: "WHAT THE PROPHET WARNED ABOUT GHANA & NATIONS",
    description: "Spiritual discernment and apostolic instructions addressing national occurrences, territorial prayer altars, and righteous leadership.",
    thumbnail: "https://i.ytimg.com/vi/eSbeDxTTYYY/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=eSbeDxTTYYY",
    youtubeId: "eSbeDxTTYYY",
    date: "Prophetic Broadcast",
    category: "Spiritual Warfare",
    duration: "1h 15m",
    scripture: "Jeremiah 1:10 · Luke 10:19"
  },
  {
    id: "sermon-6",
    title: "A POWERFUL REVELATION & PROPHETIC KEYS",
    description: "Unlocking divine timing, hearing God's voice with precision, and walking into doors of kingdom favor, breakthrough, and destiny acceleration.",
    thumbnail: "https://i.ytimg.com/vi/0qOvbLyPHL8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=0qOvbLyPHL8",
    youtubeId: "0qOvbLyPHL8",
    date: "Kingdom Dominion",
    category: "Faith & Dominion",
    duration: "42m",
    scripture: "Proverbs 3:5-6 · Revelation 3:8"
  }
];

/**
 * UPCOMING EVENTS (Editable Placeholders)
 * Clearly marked as placeholder schedules ready to update.
 */
export const placeholderEvents: EventItem[] = [
  {
    id: "event-1",
    title: "Annual Prophetic Convocation",
    date: "November 14 - 17, 2026",
    time: "6:00 PM Daily (GMT)",
    location: "[Insert official venue / International Auditorium]",
    venueDetails: "Main Sanctuary & Worldwide Live Stream",
    description: "A consecrated four-day encounter of intense worship, apostolic decree, and divine instructions for the upcoming season.",
    category: "Conference",
    registrationOpen: true
  },
  {
    id: "event-2",
    title: "Global Ministers & Leaders Summit",
    date: "December 05, 2026",
    time: "9:00 AM - 4:00 PM (GMT)",
    location: "[Insert official venue / Executive Hall]",
    venueDetails: "Executive Ministry Center (In-person & VIP Webcast)",
    description: "A specialized intensive equipping session for pastors, apostles, evangelists, and marketplace leaders seeking supernatural leverage.",
    category: "Leadership",
    registrationOpen: true
  },
  {
    id: "event-3",
    title: "All-Night Prophetic Breakthrough Vigil",
    date: "December 31, 2026",
    time: "8:00 PM till Dawn",
    location: "[Insert official venue / Cross-over Arena]",
    venueDetails: "Main Stadium & Global Broadcast",
    description: "Crossing over into the new year under an open heaven with prophetic declarations, breakthrough prayer, and prophetic impartation.",
    category: "Revival Night",
    registrationOpen: true
  },
  {
    id: "event-4",
    title: "School of the Prophets Intensive",
    date: "January 22 - 24, 2027",
    time: "5:00 PM Daily",
    location: "[Insert official venue / Ministry Center]",
    venueDetails: "Classroom Block A & Online Portal",
    description: "Rigorous biblical training on hearing God accurately, discerning spiritual voices, and moving in clean prophetic ministry.",
    category: "Training",
    registrationOpen: true
  }
];

/**
 * EDITORIAL RESOURCES (Placeholders)
 */
export const placeholderResources: ResourceItem[] = [
  {
    id: "res-1",
    title: "The Voice of the Seer: Discerning Divine Frequency",
    type: "Book",
    author: "Prophet John Lord",
    description: "An in-depth literary exploration of biblical prophetic ministry, spiritual senses, and maintaining pure motives before God's altar.",
    format: "Hardcover & Digital eBook",
    pagesOrDuration: "248 Pages",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "res-2",
    title: "21 Days Prophetic Decree Devotional",
    type: "Devotional",
    author: "Prophet John Lord",
    description: "A daily prayer and scriptural guide designed to calibrate your spiritual focus, command your morning, and unlock breakthroughs.",
    format: "Print & Downloadable PDF",
    pagesOrDuration: "112 Pages",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "res-3",
    title: "Dimensions of Apostolic Authority",
    type: "Audio Series",
    author: "Prophet John Lord",
    description: "A 6-part audio masterclass systematically examining spiritual warfare, territorial gates, and the believer's legal right in Christ.",
    format: "Digital Audio Bundle (MP3)",
    pagesOrDuration: "7.5 Hours Audio",
    coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "res-4",
    title: "Foundations of Spiritual Discernment",
    type: "Study Guide",
    author: "Prophet John Lord",
    description: "Comprehensive curriculum workbook designed for personal study groups, church leadership tracks, and Bible institutes.",
    format: "Downloadable PDF Workbook",
    pagesOrDuration: "84 Pages",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
  }
];

/**
 * TESTIMONIALS
 */
export const placeholderTestimonials: TestimonialItem[] = [
  {
    id: "test-1",
    quote: "During the prophetic impartation service, God gave Prophet John Lord an accurate word of wisdom concerning my career and health. That night brought supernatural peace and an instant breakthrough.",
    name: "Brother Emmanuel A.",
    location: "Accra, Ghana",
    category: "Divine Direction & Healing"
  },
  {
    id: "test-2",
    quote: "Through the deep expository teachings on spiritual authority and kingdom covenant, our family experienced total deliverance and financial restoration after years of stagnation.",
    name: "Sister Grace M.",
    location: "London, UK",
    category: "Financial Breakthrough"
  },
  {
    id: "test-3",
    quote: "The prophetic insights and systematic biblical guidance shared by Prophet John Lord restored my home and strengthened my walk with Jesus Christ beyond measure.",
    name: "Elder David K.",
    location: "Dallas, USA",
    category: "Family Restoration & Deliverance"
  }
];

/**
 * GIVING INITIATIVES (Placeholders ready for payment gateway integration)
 */
export const givingInitiatives = [
  {
    id: "general",
    title: "Kingdom Advancement Fund",
    description: "Supports global gospel crusades, media broadcast outreach, and worldwide prophetic gatherings.",
    badge: "Primary Mandate"
  },
  {
    id: "media",
    title: "Media & Television Broadcast",
    description: "Funding satellite, streaming, and studio equipment to broadcast the uncompromised Word to nations.",
    badge: "Media Outreach"
  },
  {
    id: "compassion",
    title: "Compassion & Humanitarian Relief",
    description: "Providing food relief, educational support for underprivileged youths, and community aid.",
    badge: "Humanitarian Impact"
  },
  {
    id: "church-planting",
    title: "Prophetic Centers & Mission Hubs",
    description: "Establishing prayer altars, missionary training centers, and regional hubs for revival.",
    badge: "Apostolic Expansion"
  }
];
