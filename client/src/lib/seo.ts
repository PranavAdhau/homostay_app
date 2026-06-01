import { resolveCanonicalBaseUrl } from "./apiBaseUrl";

export const SEO_SITE_NAME = "Sacred Homes Varanasi";
export const SEO_DEFAULT_TITLE =
  "Homestays in Varanasi | Best Family & Premium Stays by Sacred Homes";
export const SEO_DEFAULT_DESCRIPTION =
  "Discover Sacred Homes homestays in Varanasi for families, couples, and temple travelers looking for thoughtful stays near ghats, Assi, and Kashi Vishwanath.";
export const SEO_DEFAULT_KEYWORDS =
  "homestays in Varanasi, best homestays in Varanasi, family homestays in Varanasi, premium homestays in Varanasi, places to stay in Varanasi, banaras homestays, stay near Kashi Vishwanath Temple, stay near Assi Ghat, Sacred Homes Varanasi";
export const SEO_THEME_COLOR = "#1F8A84";
export const SEO_AUTHOR = "Sacred Homes Varanasi";
export const SEO_DEFAULT_IMAGE_PATH = "/sacred-homes-logo-circle.svg";
export const SEO_DEFAULT_LOCALE = "en_IN";
export const SEO_TWITTER_HANDLE = "@sacredhomes_in";
export const SEO_ORGANIZATION_ID = "#organization";
export const SEO_WEBSITE_ID = "#website";
export const SEO_LODGING_ID = "#lodging-business";
const SEO_DEBUG_ENABLED = import.meta.env.DEV;

type RouteContent = {
  title: string;
  description: string;
  keywords: string;
  heading: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  sectionHeading: string;
  sectionDescription: string;
  authorityHeading?: string;
  authorityParagraphs?: string[];
  introHeading?: string;
  introParagraphs?: string[];
  faqEntries?: SeoFaqItem[];
  hubLinks?: Array<{ path: string; label: string }>;
  featuredPropertySlugs?: string[];
  featuredBlogTopics?: string[];
};

export type RouteSeoContent = RouteContent;

export const LOCALITY_ROUTE_CONTENT: Record<
  string,
  RouteContent
> = {
  "/": {
    title:
      "Homestays in Varanasi | Best Family & Premium Stays by Sacred Homes",
    description:
      "Discover Sacred Homes homestays in Varanasi for families, couples, and temple travelers looking for thoughtful stays near ghats, Assi, and Kashi Vishwanath.",
    keywords:
      "homestays in Varanasi, best homestays in Varanasi, family homestays in Varanasi, premium homestays in Varanasi, places to stay in Varanasi, banaras homestays, stay near Kashi Vishwanath Temple, stay near Assi Ghat, Sacred Homes Varanasi",
    heading: "Homestays in Varanasi",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi for families, temple trips, and peaceful local stays",
    heroSubtitle:
      "Find the right Banaras stay near ghats, old-city lanes, and Kashi Vishwanath Temple.",
    heroDescription:
      "Sacred Homes brings together premium and family-friendly homestays in Varanasi for guests who want comfort, local guidance, and easy access to Assi Ghat, the old city, and the spiritual heart of Kashi.",
    sectionHeading: "Explore Sacred Homes in Varanasi",
    sectionDescription:
      "Choose from family-friendly, premium, and centrally located Sacred Homes that make it easy to stay near ghats, temple routes, and the neighborhoods that shape a memorable Banaras trip.",
    authorityHeading: "Where to stay in Varanasi",
    authorityParagraphs: [
      "The best place to stay in Varanasi depends on the kind of visit you are planning. Guests looking for sunrise walks and a slower riverside rhythm often prefer the Assi side, while travelers focused on temple access, food streets, and the old city usually benefit from staying closer to Godowlia and Kashi Vishwanath Temple.",
      "Families and small groups often need more than just a central address. They look for space, calm, and easy movement between temple visits, ghat time, and local neighborhoods, while premium travelers often value a more peaceful stay that still keeps Banaras within easy reach.",
      "Sacred Homes is built around these real stay patterns, helping guests choose homestays in Varanasi that feel comfortable, authentic, and well placed for everything from family travel to short spiritual trips.",
    ],
    introHeading: "Plan your stay with the right Varanasi locality",
    introParagraphs: [
      "Use the links below to explore Varanasi homestays by broad stay intent, from family stays and premium Banaras homestays to options near Assi Ghat and Kashi Vishwanath Temple.",
    ],
    faqEntries: [
      {
        question: "What is the best area to stay in Varanasi for first-time visitors?",
        answer:
          "Many first-time visitors choose between the Assi side for a calmer riverside experience and the old-city side for easier access to Kashi Vishwanath Temple, Dashashwamedh Ghat, and central Banaras landmarks.",
      },
      {
        question: "Are Sacred Homes suitable for families visiting Varanasi?",
        answer:
          "Yes. Sacred Homes includes family-friendly homestays in Varanasi with more space, practical amenities, and convenient access to ghats, temples, and local neighborhoods.",
      },
      {
        question: "Can I find premium homestays in Varanasi near the ghats?",
        answer:
          "Yes. Sacred Homes offers premium and comfortable stays near Varanasi's ghats so guests can enjoy local hospitality without giving up convenience or comfort.",
      },
      {
        question: "Is it better to stay near Kashi Vishwanath Temple or Assi Ghat?",
        answer:
          "Temple-focused trips often benefit from a more central old-city base, while guests looking for slower mornings and riverside walks often prefer staying closer to Assi Ghat. The right choice depends on your trip priorities.",
      },
    ],
    hubLinks: [
      { path: "/varanasi-homestays", label: "Explore Varanasi homestays" },
      { path: "/banaras-homestays", label: "Browse Banaras homestays" },
      {
        path: "/family-homestays-varanasi",
        label: "See family homestays in Varanasi",
      },
      {
        path: "/homestays-near-assi-ghat",
        label: "Find stays near Assi Ghat",
      },
      {
        path: "/homestays-near-kashi-vishwanath",
        label: "View stays near Kashi Vishwanath Temple",
      },
    ],
    featuredPropertySlugs: [
      "assi-ghat-courtyard",
      "kashi-family-retreat",
      "old-city-courtyard-stay",
    ],
    featuredBlogTopics: [
      "How to Choose the Right Homestay in Varanasi",
      "What to Pack for a Peaceful Stay in Varanasi",
    ],
  },
  "/homestays": {
    title: "Homestays in Varanasi | Sacred Homes Banaras Stays Near Ghats",
    description:
      "Explore premium and family-friendly homestays in Varanasi with Sacred Homes, close to Assi Ghat, Dashashwamedh Ghat, and Kashi Vishwanath Temple.",
    keywords:
      "homestays in Varanasi, best homestays in Varanasi, stay near ghats in Varanasi, family homestay in Varanasi, Sacred Homes Banaras",
    heading: "Homestays in Varanasi",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi",
    heroSubtitle: "Stay close to the ghats, temples, and timeless spirit of Kashi",
    heroDescription:
      "Discover thoughtfully designed homestays in the heart of Varanasi, blending authentic hospitality with modern comfort for a stay that feels warm, relaxing, and unforgettable.",
    sectionHeading: "Our Homestays in Varanasi",
    sectionDescription:
      "Choose from Sacred Homes stays in Varanasi that balance comfort, locality, and easy access to Banaras landmarks.",
  },
  "/bookings": {
    title: "Book Your Varanasi Homestay | Sacred Homes Near Ghats & Temples",
    description:
      "Reserve your Sacred Homes Varanasi stay with a smooth booking flow for premium Banaras homestays near ghats, temples, and local cultural landmarks.",
    keywords:
      "book homestay in Varanasi, premium homestay in Banaras, stay near Kashi Vishwanath, family stay in Varanasi, Sacred Homes booking",
    heading: "Book a Homestay in Varanasi",
  },
  "/varanasi-homestays": {
    title:
      "Varanasi Homestays | Best Family, Premium & Ghat-Side Stays",
    description:
      "Explore Varanasi homestays for families, temple travelers, and guests looking for premium stays near ghats, Assi, Godowlia, and Kashi Vishwanath Temple.",
    keywords:
      "varanasi homestays, homestays in Varanasi, best homestays in Varanasi, family homestays in Varanasi, premium homestays in Varanasi, places to stay in Varanasi, stay near Ganga Ghat",
    heading: "Varanasi Homestays",
    heroEyebrow: "Varanasi stay guide",
    heroTitle: "Varanasi homestays for family trips, premium stays, and temple access",
    heroSubtitle:
      "Compare broad stay options across Assi, central Banaras, and neighborhoods near Kashi Vishwanath Temple.",
    heroDescription:
      "This pillar page brings together Sacred Homes in Varanasi for guests who want the right mix of comfort, neighborhood fit, and access to ghats, temples, and old-city experiences.",
    sectionHeading: "Compare Varanasi homestays by stay style",
    sectionDescription:
      "From premium family stays to calm ghat-side homes and central Banaras bases, these Varanasi homestays help different travelers find the right fit without losing access to the city's most important landmarks.",
    authorityHeading: "How to choose among Varanasi homestays",
    authorityParagraphs: [
      "Varanasi homestays work best when they match the way you want to experience the city. Some guests want a calmer base near Assi Ghat, while others want to stay closer to temple routes, Dashashwamedh Ghat, or the dense energy of old Banaras.",
      "Families often prioritize room to spread out, smoother transport, and easier movement between neighborhood stops. Premium stays in Varanasi often balance those needs with a more peaceful setting and a stronger sense of local hospitality.",
    ],
    introHeading: "Explore Varanasi stays by travel intent",
    introParagraphs: [
      "Use these routes to compare Banaras homestays by locality and stay style, especially if you are deciding between family-friendly spaces, old-city access, and stays near major ghats or temple routes.",
    ],
    faqEntries: [
      {
        question: "What are the best homestays in Varanasi for families?",
        answer:
          "The best family homestays in Varanasi usually offer more space, practical amenities, and easier access to both local neighborhoods and major landmarks like Assi Ghat or Kashi Vishwanath Temple.",
      },
      {
        question: "Are premium homestays in Varanasi better than staying in a hotel?",
        answer:
          "For many guests, premium homestays in Varanasi offer a more personal and local experience, while still providing the comfort and calm that matter on family, cultural, or temple-focused trips.",
      },
      {
        question: "Which Varanasi locality is best for a short stay?",
        answer:
          "That depends on your itinerary. Assi is often preferred for riverside mornings, while central Banaras and Godowlia work well for guests who want easier access to temples, food streets, and the old city.",
      },
      {
        question: "Can I use this page to compare stays near ghats and temples?",
        answer:
          "Yes. This page is designed as a Varanasi homestay overview that helps guests explore family stays, premium stays, and options near ghats or Kashi Vishwanath Temple.",
      },
    ],
    hubLinks: [
      { path: "/banaras-homestays", label: "Compare Banaras homestays" },
      {
        path: "/family-homestays-varanasi",
        label: "Browse family homestays in Varanasi",
      },
      {
        path: "/homestays-near-assi-ghat",
        label: "Explore homestays near Assi Ghat",
      },
      {
        path: "/homestays-near-kashi-vishwanath",
        label: "Find stays near Kashi Vishwanath Temple",
      },
    ],
  },
  "/banaras-homestays": {
    title:
      "Banaras Homestays | Local Stays Across Ghats, Temples & Old Kashi",
    description:
      "Choose Banaras homestays with Sacred Homes for local stays near ghats, temple routes, and the heritage neighborhoods that shape daily life in Kashi.",
    keywords:
      "banaras homestays, stay in Kashi, premium homestays in Banaras, family stay in Banaras, places to stay in Banaras, homestay near ghats",
    heading: "Banaras Homestays",
    heroEyebrow: "Banaras locality guide",
    heroTitle: "Banaras homestays for guests who want a more local way to stay in Kashi",
    heroSubtitle:
      "Stay near ghats, temple routes, and the neighborhoods that define old and modern Banaras.",
    heroDescription:
      "This page focuses on the Banaras side of the stay experience: local rhythm, neighborhood character, and homestays that help guests stay close to the lived texture of Kashi.",
    sectionHeading: "Stay in Banaras with more locality and context",
    sectionDescription:
      "Banaras homestays are ideal for guests who want more than a room. They offer a grounded way to experience ghats, lanes, temples, and neighborhood life while still choosing the stay style that fits the trip.",
    authorityHeading: "Why Banaras homestays feel different",
    authorityParagraphs: [
      "The word Banaras often points to a more lived, local experience of the city. Guests choosing Banaras homestays are usually looking for a stay that feels close to the texture of Kashi, whether that means ghat-side mornings, temple-focused days, or evenings in the old city.",
      "A Banaras homestay can still be premium, family-friendly, or centrally located. The real difference is that the stay becomes part of the locality experience instead of sitting outside it.",
    ],
    introHeading: "Explore Banaras stays by neighborhood and trip style",
    introParagraphs: [
      "Use these links to move between broad Varanasi stay options, family-focused pages, and locality pages near Assi Ghat or Kashi Vishwanath Temple.",
    ],
    faqEntries: [
      {
        question: "What is the difference between Varanasi homestays and Banaras homestays?",
        answer:
          "They refer to the same city, but Banaras often signals a more local, cultural, and neighborhood-led stay experience rooted in the identity of Kashi.",
      },
      {
        question: "Are Banaras homestays good for family travel?",
        answer:
          "Yes. Many Banaras homestays work well for family trips, especially when guests want space, neighborhood character, and access to ghats, temples, and central attractions.",
      },
      {
        question: "Can I find Banaras homestays near ghats and temples?",
        answer:
          "Yes. Sacred Homes offers stays connected to localities near major ghats, old-city landmarks, and routes used for temple visits.",
      },
      {
        question: "Who should use this Banaras homestays page?",
        answer:
          "It is useful for guests who want a stay rooted in local Banaras character, whether they are planning a family visit, a short temple trip, or a slower cultural stay in Kashi.",
      },
    ],
    hubLinks: [
      { path: "/varanasi-homestays", label: "See all Varanasi homestays" },
      {
        path: "/homestays-near-assi-ghat",
        label: "Discover Banaras stays near Assi Ghat",
      },
      {
        path: "/homestays-near-kashi-vishwanath",
        label: "See stays near Kashi Vishwanath Temple",
      },
      {
        path: "/family-homestays-varanasi",
        label: "Compare family stays in Varanasi",
      },
    ],
  },
  "/homestays-near-assi-ghat": {
    title: "Homestays Near Assi Ghat | Peaceful Varanasi Stays by Sacred Homes",
    description:
      "Book homestays near Assi Ghat in Varanasi for a calm stay with easy access to riverside walks, local cafes, and spiritual experiences.",
    keywords:
      "homestays near Assi Ghat, stay near Assi Ghat, Varanasi homestay near ghat, Banaras riverside stay, Sacred Homes Assi Ghat",
    heading: "Homestays Near Assi Ghat",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi",
    heroSubtitle: "Stay close to the ghats, temples, and timeless spirit of Kashi",
    heroDescription:
      "Discover thoughtfully designed homestays in the heart of Varanasi, blending authentic hospitality with modern comfort for a stay that feels warm, relaxing, and unforgettable.",
    sectionHeading: "Our Homestays in Varanasi",
    sectionDescription:
      "Choose from Sacred Homes stays in Varanasi that balance comfort, locality, and easy access to Banaras landmarks.",
  },
  "/homestays-near-kashi-vishwanath": {
    title: "Homestay Near Kashi Vishwanath Temple | Sacred Homes Varanasi",
    description:
      "Stay near Kashi Vishwanath Temple with Sacred Homes and enjoy comfortable access to darshan, old city lanes, and the spiritual heart of Varanasi.",
    keywords:
      "homestay near Kashi Vishwanath temple, stay near Kashi Vishwanath, Kashi homestay, Banaras temple stay, Varanasi spiritual stay",
    heading: "Homestays Near Kashi Vishwanath Temple",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi",
    heroSubtitle: "Stay close to the ghats, temples, and timeless spirit of Kashi",
    heroDescription:
      "Discover thoughtfully designed homestays in the heart of Varanasi, blending authentic hospitality with modern comfort for a stay that feels warm, relaxing, and unforgettable.",
    sectionHeading: "Our Homestays in Varanasi",
    sectionDescription:
      "Choose from Sacred Homes stays in Varanasi that balance comfort, locality, and easy access to Banaras landmarks.",
  },
  "/homestays-near-dashashwamedh-ghat": {
    title: "Homestays Near Dashashwamedh Ghat | Sacred Homes Banaras Stays",
    description:
      "Discover homestays near Dashashwamedh Ghat in Banaras for easy access to Ganga Aarti, temple visits, and old city experiences.",
    keywords:
      "homestay near Dashashwamedh Ghat, stay near Ganga Aarti, Dashashwamedh Ghat stay, Banaras homestays, Sacred Homes Varanasi",
    heading: "Homestays Near Dashashwamedh Ghat",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi",
    heroSubtitle: "Stay close to the ghats, temples, and timeless spirit of Kashi",
    heroDescription:
      "Discover thoughtfully designed homestays in the heart of Varanasi, blending authentic hospitality with modern comfort for a stay that feels warm, relaxing, and unforgettable.",
    sectionHeading: "Our Homestays in Varanasi",
    sectionDescription:
      "Choose from Sacred Homes stays in Varanasi that balance comfort, locality, and easy access to Banaras landmarks.",
  },
  "/family-homestays-varanasi": {
    title: "Family Homestays in Varanasi | Comfortable Sacred Homes Stays",
    description:
      "Browse family homestays in Varanasi with spacious rooms, thoughtful amenities, and easy access to ghats, temples, and local attractions.",
    keywords:
      "family homestays in Varanasi, family stay in Varanasi, Banaras family homestay, premium family stay near ghats, Sacred Homes",
    heading: "Family Homestays in Varanasi",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi",
    heroSubtitle: "Stay close to the ghats, temples, and timeless spirit of Kashi",
    heroDescription:
      "Discover thoughtfully designed homestays in the heart of Varanasi, blending authentic hospitality with modern comfort for a stay that feels warm, relaxing, and unforgettable.",
    sectionHeading: "Our Homestays in Varanasi",
    sectionDescription:
      "Choose from Sacred Homes stays in Varanasi that balance comfort, locality, and easy access to Banaras landmarks.",
  },
  "/budget-homestays-banaras": {
    title: "Budget Homestays in Banaras | Value Stays by Sacred Homes Varanasi",
    description:
      "Compare budget homestays in Banaras with quality amenities, authentic hospitality, and convenient access to the ghats and temples of Varanasi.",
    keywords:
      "budget homestays in Banaras, budget homestays in Varanasi, affordable stay near ghats, Banaras budget stay, Sacred Homes",
    heading: "Budget Homestays in Banaras",
    heroEyebrow: "Sacred Homes Varanasi",
    heroTitle: "Homestays in Varanasi",
    heroSubtitle: "Stay close to the ghats, temples, and timeless spirit of Kashi",
    heroDescription:
      "Discover thoughtfully designed homestays in the heart of Varanasi, blending authentic hospitality with modern comfort for a stay that feels warm, relaxing, and unforgettable.",
    sectionHeading: "Our Homestays in Varanasi",
    sectionDescription:
      "Choose from Sacred Homes stays in Varanasi that balance comfort, locality, and easy access to Banaras landmarks.",
  },
};

export const LOCALITY_ROUTE_PATHS = Object.keys(LOCALITY_ROUTE_CONTENT).filter(
  (path) => !["/", "/homestays", "/bookings"].includes(path),
);

export type SeoInternalLink = {
  path: string;
  label: string;
  matchTerms: string[];
};

export const SEO_INTERNAL_LINKS: SeoInternalLink[] = [
  {
    path: "/varanasi-homestays",
    label: "Varanasi homestays",
    matchTerms: ["varanasi", "homestay", "stay", "ghat", "places to stay", "premium", "commercial"],
  },
  {
    path: "/banaras-homestays",
    label: "Banaras homestays",
    matchTerms: ["banaras", "kashi", "heritage", "old city", "local", "lanes"],
  },
  {
    path: "/homestays-near-assi-ghat",
    label: "homestays near Assi Ghat",
    matchTerms: ["assi", "assi ghat"],
  },
  {
    path: "/homestays-near-kashi-vishwanath",
    label: "stays near Kashi Vishwanath Temple",
    matchTerms: ["kashi vishwanath", "vishwanath", "temple", "darshan"],
  },
  {
    path: "/homestays-near-dashashwamedh-ghat",
    label: "homestays near Dashashwamedh Ghat",
    matchTerms: ["dashashwamedh", "ganga aarti", "ganga", "ghat"],
  },
  {
    path: "/family-homestays-varanasi",
    label: "family homestays in Varanasi",
    matchTerms: ["family", "kids", "group", "parents", "spacious", "elderly"],
  },
  {
    path: "/budget-homestays-banaras",
    label: "budget homestays in Banaras",
    matchTerms: ["budget", "affordable", "value"],
  },
];

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoPropertySummary = {
  id: number;
  slug: string;
  name: string;
  description: string;
  amenities?: Array<{ name: string }>;
  address?: string | null;
  capacity?: number;
  rooms?: number;
  price_per_night?: number;
};

export type SeoBlogSummary = {
  id: number;
  slug?: string;
  title: string;
  content: string;
  featured_locality?: string | null;
  locality_tags?: string[];
  nearby_landmark_tags?: string[];
  related_homestay_ids?: number[];
  related_blog_ids?: number[];
  faq_entries?: SeoFaqItem[];
};

export type SeoMetadata = {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  robots?: string;
  type?: string;
  twitterCard?: "summary" | "summary_large_image";
  locale?: string;
};

const seoWarnings = new Set<string>();

function warnSeoIssue(key: string, message: string) {
  if (!SEO_DEBUG_ENABLED || seoWarnings.has(key)) {
    return;
  }

  seoWarnings.add(key);
  console.warn(`[SEO] ${message}`);
}

export function buildAbsoluteUrl(path: string) {
  return new URL(path, `${resolveCanonicalBaseUrl()}/`).toString();
}

export function buildEntityId(fragment: string) {
  return buildAbsoluteUrl(fragment);
}

export function isDynamicSeoRoute(pathname: string) {
  const canonicalPath = normalizeCanonicalPath(pathname);
  return (
    canonicalPath.startsWith("/properties/") ||
    canonicalPath.startsWith("/blogs/")
  );
}

export function normalizeCanonicalPath(path = "/") {
  const sanitizedPath = path.trim() || "/";
  const withoutHash = sanitizedPath.split("#")[0] || "/";
  const withoutQuery = withoutHash.split("?")[0] || "/";

  if (withoutQuery === "/") {
    return "/";
  }

  const normalized = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;

  return normalized.replace(/\/+$/, "");
}

function trimToLength(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function tokenizeSeoText(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
}

function extractTopicSet(value: string) {
  return new Set(tokenizeSeoText(value));
}

export function toSlugFragment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function dedupeKeywords(keywords: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return keywords
    .flatMap((entry) => entry?.split(",") ?? [])
    .map((entry) => normalizeWhitespace(entry))
    .filter((entry) => {
      if (!entry) {
        return false;
      }

      const key = entry.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .join(", ");
}

function scoreSharedTopics(a: string, b: string) {
  const topicSet = extractTopicSet(a);
  return tokenizeSeoText(b).reduce(
    (score, token) => score + (topicSet.has(token) ? 1 : 0),
    0,
  );
}

export function summarizeSeoText(
  value: string,
  fallback: string,
  maxLength = 160,
) {
  const normalized = normalizeWhitespace(value);
  return trimToLength(normalized || fallback, maxLength);
}

export function inferVaranasiLocality(...parts: Array<string | null | undefined>) {
  const combined = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const localityMatchers = [
    {
      label: "Assi Ghat",
      phrases: [
        "Assi Ghat",
        "near Assi Ghat",
        "close to Assi Ghat",
      ],
      matchers: ["assi ghat", "assi"],
    },
    {
      label: "Dashashwamedh Ghat",
      phrases: [
        "Dashashwamedh Ghat",
        "near Dashashwamedh Ghat",
        "close to Dashashwamedh Ghat",
      ],
      matchers: ["dashashwamedh", "ganga aarti"],
    },
    {
      label: "Kashi Vishwanath Temple",
      phrases: [
        "Kashi Vishwanath Temple",
        "near Kashi Vishwanath Temple",
        "close to Kashi Vishwanath Temple",
      ],
      matchers: ["kashi vishwanath", "vishwanath temple", "vishwanath"],
    },
    {
      label: "the Ganga ghats",
      phrases: [
        "the Ganga ghats",
        "near the Ganga ghats",
        "close to the Ganga ghats",
      ],
      matchers: ["ganga ghat", "ghat", "ganga"],
    },
    {
      label: "old Banaras",
      phrases: ["old Banaras", "in old Banaras", "close to old Banaras"],
      matchers: ["banaras", "kashi", "old city"],
    },
  ];

  const match = localityMatchers.find(({ matchers }) =>
    matchers.some((matcher) => combined.includes(matcher)),
  );

  return match ?? null;
}

export function buildBlogPath(blog: {
  id: number | string;
  slug?: string | null;
  title?: string | null;
}) {
  const idPart = String(blog.id);
  if (/^\d+-/.test(idPart)) {
    return `/blogs/${idPart}`;
  }

  const slugPart = blog.slug?.trim() || toSlugFragment(blog.title || idPart);
  return /^\d+$/.test(idPart)
    ? `/blogs/${idPart}-${slugPart}`
    : `/blogs/${idPart}`;
}

export function buildPropertyPath(slug: string) {
  return `/properties/${slug}`;
}

export function buildFaqJsonLd(faqs: SeoFaqItem[]) {
  if (!faqs.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function normalizeFaqEntries(faqEntries?: Array<SeoFaqItem | null | undefined>) {
  return (faqEntries ?? []).filter(
    (faqEntry): faqEntry is SeoFaqItem =>
      Boolean(
        faqEntry?.question?.trim() &&
          faqEntry?.answer?.trim(),
      ),
  );
}

export function getRouteSeoContent(pathname: string) {
  const canonicalPath = normalizeCanonicalPath(pathname);
  return LOCALITY_ROUTE_CONTENT[canonicalPath] ?? LOCALITY_ROUTE_CONTENT["/"];
}

export function buildRouteFaqJsonLd(pathname: string) {
  return buildFaqJsonLd(getRouteSeoContent(pathname).faqEntries ?? []);
}

/**
 * Normalizes an array of IDs (which may be strings or numbers from the API)
 * into a consistent array of positive integers.
 *
 * This fixes the core bug: ["1", "2"].includes(1) === false
 * By ensuring all IDs are numbers, .includes() comparisons work correctly.
 */
export function normalizeNumericIds(ids: Array<unknown>): number[] {
  return (ids ?? [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

export function buildRelatedBlogLinks(
  currentBlog: SeoBlogSummary,
  blogs: SeoBlogSummary[],
  limit = 3,
) {
  const currentText = `${currentBlog.title} ${currentBlog.content}`;

  return blogs
    .filter((blog) => blog.id !== currentBlog.id)
    .map((blog) => ({
      ...blog,
      score:
        scoreSharedTopics(currentText, `${blog.title} ${blog.content}`) +
        (inferVaranasiLocality(currentText, blog.title) ? 2 : 0),
    }))
    .sort(
      (left, right) =>
        right.score - left.score || left.title.localeCompare(right.title),
    )
    .slice(0, limit);
}

export function resolveItemsByIds<
  TItem extends { id: number },
>(ids: Array<number | null | undefined>, items: TItem[]) {
  // Normalize all incoming IDs to numbers to prevent string/number mismatch
  const normalizedIds = normalizeNumericIds(ids as Array<unknown>);
  const itemsById = new Map(items.map((item) => [Number(item.id), item]));
  const seenIds = new Set<number>();

  return normalizedIds
    .filter((id) => {
      if (seenIds.has(id)) {
        return false;
      }
      seenIds.add(id);
      return true;
    })
    .map((id) => itemsById.get(id))
    .filter((item): item is TItem => Boolean(item));
}

export function buildManagedInternalLinks(tags: Array<string | null | undefined>, limit = 4) {
  const normalizedTags = tags
    .map((tag) => tag?.toString().trim().toLowerCase())
    .filter((tag): tag is string => Boolean(tag));

  return SEO_INTERNAL_LINKS.filter((link) =>
    normalizedTags.some((tag) =>
      link.matchTerms.some(
        (matchTerm) => tag.includes(matchTerm) || matchTerm.includes(tag),
      ),
    ),
  )
    .filter(
      (link, index, links) =>
        links.findIndex((candidate) => candidate.path === link.path) === index,
    )
    .slice(0, limit);
}

export function buildRelatedPropertiesForBlog(
  blog: SeoBlogSummary,
  properties: SeoPropertySummary[],
  limit = 3,
) {
  const blogText = `${blog.title} ${blog.content}`;
  const blogLocality = inferVaranasiLocality(blogText);

  return properties
    .map((property) => {
      const propertyLocality = inferVaranasiLocality(
        property.address,
        property.name,
      );
      const amenityText = property.amenities?.map((amenity) => amenity.name).join(" ") || "";
      let score = scoreSharedTopics(blogText, `${property.name} ${property.description} ${amenityText}`);

      if (
        blogLocality &&
        propertyLocality &&
        blogLocality.label === propertyLocality.label
      ) {
        score += 4;
      }

      if (blogText.toLowerCase().includes("family") && (property.capacity || 0) >= 4) {
        score += 2;
      }

      return { ...property, score };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.name.localeCompare(right.name),
    )
    .slice(0, limit);
}

export function buildRelatedProperties(
  currentProperty: SeoPropertySummary,
  properties: SeoPropertySummary[],
  limit = 3,
) {
  const currentLocality = inferVaranasiLocality(
    currentProperty.address,
    currentProperty.name,
  );
  const currentAmenities = new Set(
    (currentProperty.amenities ?? []).map((amenity) => amenity.name.toLowerCase()),
  );

  return properties
    .filter((property) => property.slug !== currentProperty.slug)
    .map((property) => {
      const propertyLocality = inferVaranasiLocality(property.address, property.name);
      const sharedAmenities = (property.amenities ?? []).reduce(
        (score, amenity) =>
          score + (currentAmenities.has(amenity.name.toLowerCase()) ? 1 : 0),
        0,
      );
      let score = sharedAmenities;

      if (
        currentLocality &&
        propertyLocality &&
        currentLocality.label === propertyLocality.label
      ) {
        score += 4;
      }

      if (
        typeof currentProperty.capacity === "number" &&
        typeof property.capacity === "number" &&
        Math.abs(currentProperty.capacity - property.capacity) <= 2
      ) {
        score += 1;
      }

      return { ...property, score };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.name.localeCompare(right.name),
    )
    .slice(0, limit);
}

export function buildRelatedBlogsForProperty(
  property: SeoPropertySummary,
  blogs: SeoBlogSummary[],
  limit = 3,
) {
  const propertyText = `${property.name} ${property.description} ${property.address || ""}`;
  const locality = inferVaranasiLocality(property.address, property.name);

  return blogs
    .map((blog) => {
      let score = scoreSharedTopics(propertyText, `${blog.title} ${blog.content}`);
      if (
        locality &&
        inferVaranasiLocality(blog.title, blog.content)?.label === locality.label
      ) {
        score += 4;
      }

      return { ...blog, score };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.title.localeCompare(right.title),
    )
    .slice(0, limit);
}

export function buildNearbyLocalityLinks(
  ...parts: Array<string | null | undefined>
) {
  const locality = inferVaranasiLocality(...parts);
  const matchedLinks = locality
    ? SEO_INTERNAL_LINKS.filter((link) =>
        link.matchTerms.some((term) =>
          locality.matchers.some((matcher) => term === matcher),
        ),
      )
    : [];

  const fallbackLinks = SEO_INTERNAL_LINKS.filter(
    (link) => !matchedLinks.some((matchedLink) => matchedLink.path === link.path),
  );

  return [...matchedLinks, ...fallbackLinks].slice(0, 4);
}

export function buildAttractionLinks(...parts: Array<string | null | undefined>) {
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();

  return SEO_INTERNAL_LINKS.filter((link) =>
    ["ghat", "temple", "ganga", "kashi", "assi", "dashashwamedh"].some(
      (keyword) =>
        haystack.includes(keyword) &&
        link.matchTerms.some((term) => term.includes(keyword)),
    ),
  ).slice(0, 3);
}

export function buildPropertyLocalContext(
  propertyName: string,
  ...parts: Array<string | null | undefined>
) {
  const locality = inferVaranasiLocality(propertyName, ...parts);
  if (!locality) {
    return `This Sacred Homes property gives guests a grounded Varanasi base with local guidance, neighborhood context, and easy access to the city's cultural rhythm.`;
  }

  if (locality.label === "Assi Ghat") {
    return `${propertyName} suits guests who want to stay close to Assi Ghat, slower riverside mornings, and a neighborhood rhythm that feels relaxed while still connected to the wider city.`;
  }

  if (locality.label === "Kashi Vishwanath Temple") {
    return `${propertyName} works well for travelers who want to stay with easier access to Kashi Vishwanath Temple, old-city routes, and the central landmarks that shape a short spiritual visit.`;
  }

  if (locality.label === "Dashashwamedh Ghat") {
    return `${propertyName} is especially relevant for guests planning time around Dashashwamedh Ghat, Ganga Aarti routes, and the busiest heritage stretches of Banaras.`;
  }

  if (locality.label === "old Banaras") {
    return `${propertyName} is a strong fit for guests who want to stay close to old Banaras, heritage lanes, and neighborhoods that make it easier to explore Godowlia and central Kashi.`;
  }

  return `${propertyName} keeps guests connected to ${locality.label} and the wider Varanasi experience, making it easier to balance comfort with genuine neighborhood access.`;
}

export function buildLandmarkSummary(
  landmarks: Array<string | null | undefined>,
  maxItems = 3,
) {
  const normalizedLandmarks = landmarks
    .map((landmark) => landmark?.trim())
    .filter((landmark): landmark is string => Boolean(landmark));

  if (!normalizedLandmarks.length) {
    return null;
  }

  return normalizedLandmarks.slice(0, maxItems).join(", ");
}

export function buildRouteMetadata(pathname: string): SeoMetadata {
  const canonicalPath = normalizeCanonicalPath(pathname);

  if (canonicalPath.startsWith("/admin")) {
    return {
      title: "Sacred Homes Admin",
      description: "Sacred Homes Varanasi administration panel.",
      canonicalPath,
      robots: "noindex,nofollow",
    };
  }

  if (canonicalPath.startsWith("/properties/")) {
    return {
      title: "Homestay in Varanasi | Sacred Homes",
      description:
        "View stay details, amenities, and booking information for a Sacred Homes Varanasi homestay near ghats, temples, and Banaras landmarks.",
      canonicalPath,
      keywords: dedupeKeywords([
        SEO_DEFAULT_KEYWORDS,
        "homestay in Varanasi, Banaras stay near ghats, Kashi stay",
      ]),
    };
  }

  if (canonicalPath.startsWith("/blogs/")) {
    return {
      title: "Sacred Homes Journal | Varanasi Travel Stories & Banaras Guides",
      description:
        "Read Sacred Homes Journal for Varanasi travel tips, Banaras neighborhood guides, temple visits, and local stay inspiration.",
      canonicalPath,
      type: "article",
      keywords: dedupeKeywords([
        "Varanasi travel blog, Banaras travel guide, Kashi stay tips, Sacred Homes Journal",
      ]),
    };
  }

  const routeContent = getRouteSeoContent(canonicalPath);

  return {
    title: routeContent.title,
    description: routeContent.description,
    canonicalPath,
    keywords: routeContent.keywords,
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}

export function buildWebPageJsonLd(pathname: string) {
  const canonicalPath = normalizeCanonicalPath(pathname);
  const routeContent = getRouteSeoContent(canonicalPath);

  return {
    "@context": "https://schema.org",
    "@type":
      canonicalPath === "/" || canonicalPath === "/bookings"
        ? "WebPage"
        : "CollectionPage",
    name: routeContent.title,
    description: routeContent.description,
    url: buildAbsoluteUrl(canonicalPath),
    inLanguage: "en-IN",
    about: [
      "Homestays in Varanasi",
      "Best homestays in Varanasi",
      "Family homestays in Varanasi",
      "Banaras homestays",
      "Places to stay in Varanasi",
      "Kashi Vishwanath Temple",
      "Ganga ghats",
    ],
    isPartOf: {
      "@id": buildEntityId(SEO_WEBSITE_ID),
    },
  };
}

export function buildBlogInternalLinks(
  title: string,
  content: string,
  limit = 4,
) {
  const haystack = `${title} ${content}`.toLowerCase();
  const prioritizedLinks = SEO_INTERNAL_LINKS.filter((link) =>
    link.matchTerms.some((term) => haystack.includes(term)),
  );

  const fallbackLinks = SEO_INTERNAL_LINKS.filter(
    (candidate) =>
      !prioritizedLinks.some((selected) => selected.path === candidate.path),
  );

  return [...prioritizedLinks, ...fallbackLinks].slice(0, limit);
}

type PropertySeoInput = {
  slug: string;
  name: string;
  description: string;
  seoSummary?: string | null;
  seoLocalityFocus?: string | null;
  localityTags?: string[];
  nearbyLandmarkTags?: string[];
  faqEntries?: SeoFaqItem[];
  address?: string | null;
  images: string[];
  featuredImage?: string | null;
  amenities: Array<{ name: string }>;
  capacity: number;
  rooms: number;
  pricePerNight: number;
  latitude?: number | null;
  longitude?: number | null;
};

export function buildPropertyImageAlt(
  propertyName: string,
  localityLabel: string,
  index: number,
) {
  return `${propertyName} homestay in Varanasi near ${localityLabel} photo ${index + 1}`;
}

export function buildHomestayCardImageAlt(
  propertyName: string,
  ...parts: Array<string | null | undefined>
) {
  const localityLabel = inferVaranasiLocality(propertyName, ...parts)?.label;
  return localityLabel
    ? `${propertyName} homestay in Varanasi near ${localityLabel}`
    : `${propertyName} homestay in Varanasi`;
}

export function buildBlogImageAlt(
  title: string,
  ...parts: Array<string | null | undefined>
) {
  const localityLabel = inferVaranasiLocality(title, ...parts)?.label;
  return localityLabel
    ? `${title} travel guide for ${localityLabel} in Varanasi`
    : `${title} travel guide for Varanasi stays and local experiences`;
}

export function buildPropertySeo(input: PropertySeoInput) {
  const localityMatch = inferVaranasiLocality(input.address, input.name);
  const localityLabel = localityMatch?.label ?? "the ghats";
  const localityPhrase =
    localityMatch?.phrases[1] ?? "near Varanasi's ghats and temples";
  const canonicalPath = `/properties/${input.slug}`;
  const imagePath =
    input.images[0] || input.featuredImage || SEO_DEFAULT_IMAGE_PATH;
  const title = trimToLength(
    `${input.name} | Homestay ${localityPhrase} in Varanasi | Sacred Homes`,
    65,
  );
  const description = summarizeSeoText(
    input.seoSummary ||
      `${input.name} is a premium Banaras homestay ${localityPhrase} with space for ${input.capacity} guests, ${input.rooms} rooms, and amenities for a peaceful Sacred Homes stay in Kashi.`,
    SEO_DEFAULT_DESCRIPTION,
  );
  const keywords = dedupeKeywords([
    SEO_DEFAULT_KEYWORDS,
    `${input.name}, homestay in Varanasi, banaras homestay, premium homestays in Banaras, family stay in Varanasi, stay ${localityPhrase}`,
    localityMatch?.phrases.join(", "),
    input.seoLocalityFocus,
    input.localityTags?.join(", "),
    input.nearbyLandmarkTags?.join(", "),
  ]);

  return {
    metadata: {
      title,
      description,
      canonicalPath,
      keywords,
      image: imagePath,
      imageAlt: `${input.name} by Sacred Homes Varanasi`,
      type: "website",
      twitterCard: "summary_large_image" as const,
    },
    localityLabel,
    faqEntries: normalizeFaqEntries(input.faqEntries),
    schema: {
      "@context": "https://schema.org",
      "@type": ["LodgingBusiness", "Hotel", "LocalBusiness"],
      "@id": buildEntityId(canonicalPath),
      name: input.name,
      description,
      url: buildAbsoluteUrl(canonicalPath),
      mainEntityOfPage: buildAbsoluteUrl(canonicalPath),
      image: [imagePath, ...input.images.slice(1, 6)].map((image) =>
        buildAbsoluteUrl(image),
      ),
      address: {
        "@type": "PostalAddress",
        streetAddress: input.address || "Varanasi, Uttar Pradesh, India",
        addressLocality: "Varanasi",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      areaServed: ["Varanasi", "Banaras", "Kashi"],
      geo:
        typeof input.latitude === "number" && typeof input.longitude === "number"
          ? {
              "@type": "GeoCoordinates",
              latitude: input.latitude,
              longitude: input.longitude,
            }
          : undefined,
      numberOfRooms: input.rooms,
      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: input.capacity,
      },
      parentOrganization: {
        "@id": buildEntityId(SEO_ORGANIZATION_ID),
      },
      amenityFeature: input.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity.name,
        value: true,
      })),
      priceRange: `From ₹${input.pricePerNight} per night`,
    },
  };
}

function isValidAbsoluteUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function safeBuildAbsoluteUrl(path: string, fallbackPath = "/") {
  try {
    const url = buildAbsoluteUrl(path);
    if (!isValidAbsoluteUrl(url)) {
      throw new Error("Invalid absolute URL");
    }
    return url;
  } catch {
    warnSeoIssue(`invalid-url:${path}`, `Invalid SEO URL generated for "${path}". Falling back to "${fallbackPath}".`);
    return buildAbsoluteUrl(fallbackPath);
  }
}

function ensureSingleCanonicalLink() {
  const canonicalLinks = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
  );

  canonicalLinks.slice(1).forEach((link) => link.remove());
}

type BlogSeoInput = {
  id: string;
  title: string;
  content: string;
  seoSummary?: string | null;
  featuredLocality?: string | null;
  localityTags?: string[];
  nearbyLandmarkTags?: string[];
  faqEntries?: SeoFaqItem[];
  imageUrl?: string | null;
  publishedAt: string;
};

export function buildBlogSeo(input: BlogSeoInput) {
  const canonicalPath = `/blogs/${input.id}`;
  const description = summarizeSeoText(
    input.seoSummary || input.content,
    "Read Sacred Homes Journal stories, Banaras travel notes, and Varanasi stay ideas.",
  );
  const imagePath = input.imageUrl || SEO_DEFAULT_IMAGE_PATH;

  return {
    metadata: {
      title: trimToLength(
        `${input.title} | Sacred Homes Journal Varanasi`,
        65,
      ),
      description,
      canonicalPath,
      image: imagePath,
      imageAlt: `${input.title} - Sacred Homes Journal`,
      type: "article",
      twitterCard: "summary_large_image" as const,
      keywords: dedupeKeywords([
        "Varanasi travel blog, Banaras travel guide, Kashi travel tips, Sacred Homes Journal",
        input.title,
        input.featuredLocality,
        input.localityTags?.join(", "),
        input.nearbyLandmarkTags?.join(", "),
      ]),
    },
    faqEntries: normalizeFaqEntries(input.faqEntries),
    schema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": buildEntityId(canonicalPath),
      headline: input.title,
      description,
      image: [buildAbsoluteUrl(imagePath)],
      url: buildAbsoluteUrl(canonicalPath),
      mainEntityOfPage: buildAbsoluteUrl(canonicalPath),
      datePublished: input.publishedAt,
      dateModified: input.publishedAt,
      author: {
        "@id": buildEntityId(SEO_ORGANIZATION_ID),
      },
      publisher: {
        "@id": buildEntityId(SEO_ORGANIZATION_ID),
      },
      articleSection: "Varanasi Travel",
      inLanguage: "en-IN",
      keywords: [
        "Varanasi",
        "Banaras",
        "Kashi",
        "Sacred Homes",
        "homestays in Varanasi",
      ],
    },
  };
}

function setMetaTag(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
}

export function setJsonLd(id: string, payload: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  if (!payload) {
    return;
  }

  if (!payload["@context"] || !payload["@type"]) {
    warnSeoIssue(
      `schema:${id}`,
      `Skipped JSON-LD "${id}" because it is missing @context or @type.`,
    );
    return;
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
}

export function applySeoMetadata({
  title,
  description,
  canonicalPath = window.location.pathname,
  keywords = SEO_DEFAULT_KEYWORDS,
  image = SEO_DEFAULT_IMAGE_PATH,
  imageAlt = `${SEO_SITE_NAME} logo`,
  robots = "index,follow",
  type = "website",
  twitterCard = "summary_large_image",
  locale = SEO_DEFAULT_LOCALE,
}: SeoMetadata) {
  const normalizedCanonicalPath = normalizeCanonicalPath(canonicalPath);
  const canonicalUrl = safeBuildAbsoluteUrl(normalizedCanonicalPath);
  const imageUrl = safeBuildAbsoluteUrl(image, SEO_DEFAULT_IMAGE_PATH);
  const normalizedDescription = summarizeSeoText(
    description,
    SEO_DEFAULT_DESCRIPTION,
  );
  const normalizedTitle = normalizeWhitespace(title) || SEO_DEFAULT_TITLE;
  const normalizedKeywords = dedupeKeywords([keywords, SEO_DEFAULT_KEYWORDS]);

  if (!title.trim()) {
    warnSeoIssue("missing-title", "Missing SEO title detected. Falling back to the default title.");
  }

  if (!description.trim()) {
    warnSeoIssue("missing-description", "Missing SEO description detected. Falling back to the default description.");
  }

  document.title = normalizedTitle;

  setMetaTag("name", "description", normalizedDescription);
  setMetaTag("name", "keywords", normalizedKeywords);
  setMetaTag("name", "author", SEO_AUTHOR);
  setMetaTag("name", "robots", robots);
  setMetaTag("name", "theme-color", SEO_THEME_COLOR);

  setMetaTag("property", "og:type", type);
  setMetaTag("property", "og:site_name", SEO_SITE_NAME);
  setMetaTag("property", "og:title", normalizedTitle);
  setMetaTag("property", "og:description", normalizedDescription);
  setMetaTag("property", "og:url", canonicalUrl);
  setMetaTag("property", "og:image", imageUrl);
  setMetaTag("property", "og:image:alt", imageAlt);
  setMetaTag("property", "og:locale", locale);

  setMetaTag("name", "twitter:card", twitterCard);
  setMetaTag("name", "twitter:site", SEO_TWITTER_HANDLE);
  setMetaTag("name", "twitter:title", normalizedTitle);
  setMetaTag("name", "twitter:description", normalizedDescription);
  setMetaTag("name", "twitter:image", imageUrl);
  setMetaTag("name", "twitter:image:alt", imageAlt);

  ensureSingleCanonicalLink();
  setLinkTag("canonical", canonicalUrl);
}
