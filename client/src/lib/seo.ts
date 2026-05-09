import { resolveCanonicalBaseUrl } from "./apiBaseUrl";

export const SEO_SITE_NAME = "Sacred Homes Varanasi";
export const SEO_DEFAULT_TITLE =
  "Sacred Homes Varanasi | Premium Homestays in Varanasi Near Ghats & Kashi Vishwanath";
export const SEO_DEFAULT_DESCRIPTION =
  "Book premium homestays in Varanasi, Banaras, and Kashi with Sacred Homes near Assi Ghat, Dashashwamedh Ghat, and Kashi Vishwanath Temple for a peaceful local stay.";
export const SEO_DEFAULT_KEYWORDS =
  "homestays in Varanasi, banaras homestays, homestay near Kashi Vishwanath temple, homestay near Dashashwamedh Ghat, homestays near Assi Ghat, family stay in Varanasi, premium homestays in Banaras, stay near Ganga Ghat, budget homestays in Varanasi, Sacred Homes Varanasi";
export const SEO_THEME_COLOR = "#1F8A84";
export const SEO_AUTHOR = "Sacred Homes Varanasi";
export const SEO_DEFAULT_IMAGE_PATH = "/sacred-homes-logo-circle.svg";
export const SEO_DEFAULT_LOCALE = "en_IN";
export const SEO_TWITTER_HANDLE = "@sacredhomes_in";
const SEO_DEBUG_ENABLED = import.meta.env.DEV;

type RouteContent = {
  title: string;
  description: string;
  keywords: string;
  heading: string;
};

export const LOCALITY_ROUTE_CONTENT: Record<
  string,
  RouteContent
> = {
  "/": {
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: SEO_DEFAULT_KEYWORDS,
    heading: "Homestays in Varanasi",
  },
  "/homestays": {
    title: "Homestays in Varanasi | Sacred Homes Banaras Stays Near Ghats",
    description:
      "Explore premium and family-friendly homestays in Varanasi with Sacred Homes, close to Assi Ghat, Dashashwamedh Ghat, and Kashi Vishwanath Temple.",
    keywords:
      "homestays in Varanasi, best homestays in Varanasi, stay near ghats in Varanasi, family homestay in Varanasi, Sacred Homes Banaras",
    heading: "Homestays in Varanasi",
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
    title: "Varanasi Homestays | Premium Stays Near Ghats, Temples & Ganga",
    description:
      "Find Varanasi homestays for couples, families, and spiritual travelers near the ghats, Kashi Vishwanath Temple, and the heart of old Banaras.",
    keywords:
      "varanasi homestays, homestays in Varanasi, premium homestays in Varanasi, stay near Ganga Ghat, family stay in Varanasi",
    heading: "Varanasi Homestays",
  },
  "/banaras-homestays": {
    title: "Banaras Homestays | Sacred Homes Stays in the Heart of Kashi",
    description:
      "Choose Banaras homestays with Sacred Homes for a peaceful local stay near ghats, temples, and heritage lanes in Kashi.",
    keywords:
      "banaras homestays, premium homestays in Banaras, stay in Kashi, Banaras family stay, homestay near ghats",
    heading: "Banaras Homestays",
  },
  "/homestays-near-assi-ghat": {
    title: "Homestays Near Assi Ghat | Peaceful Varanasi Stays by Sacred Homes",
    description:
      "Book homestays near Assi Ghat in Varanasi for a calm stay with easy access to riverside walks, local cafes, and spiritual experiences.",
    keywords:
      "homestays near Assi Ghat, stay near Assi Ghat, Varanasi homestay near ghat, Banaras riverside stay, Sacred Homes Assi Ghat",
    heading: "Homestays Near Assi Ghat",
  },
  "/homestays-near-kashi-vishwanath": {
    title: "Homestay Near Kashi Vishwanath Temple | Sacred Homes Varanasi",
    description:
      "Stay near Kashi Vishwanath Temple with Sacred Homes and enjoy comfortable access to darshan, old city lanes, and the spiritual heart of Varanasi.",
    keywords:
      "homestay near Kashi Vishwanath temple, stay near Kashi Vishwanath, Kashi homestay, Banaras temple stay, Varanasi spiritual stay",
    heading: "Homestays Near Kashi Vishwanath Temple",
  },
  "/homestays-near-dashashwamedh-ghat": {
    title: "Homestays Near Dashashwamedh Ghat | Sacred Homes Banaras Stays",
    description:
      "Discover homestays near Dashashwamedh Ghat in Banaras for easy access to Ganga Aarti, temple visits, and old city experiences.",
    keywords:
      "homestay near Dashashwamedh Ghat, stay near Ganga Aarti, Dashashwamedh Ghat stay, Banaras homestays, Sacred Homes Varanasi",
    heading: "Homestays Near Dashashwamedh Ghat",
  },
  "/family-homestays-varanasi": {
    title: "Family Homestays in Varanasi | Comfortable Sacred Homes Stays",
    description:
      "Browse family homestays in Varanasi with spacious rooms, thoughtful amenities, and easy access to ghats, temples, and local attractions.",
    keywords:
      "family homestays in Varanasi, family stay in Varanasi, Banaras family homestay, premium family stay near ghats, Sacred Homes",
    heading: "Family Homestays in Varanasi",
  },
  "/budget-homestays-banaras": {
    title: "Budget Homestays in Banaras | Value Stays by Sacred Homes Varanasi",
    description:
      "Compare budget homestays in Banaras with quality amenities, authentic hospitality, and convenient access to the ghats and temples of Varanasi.",
    keywords:
      "budget homestays in Banaras, budget homestays in Varanasi, affordable stay near ghats, Banaras budget stay, Sacred Homes",
    heading: "Budget Homestays in Banaras",
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
    matchTerms: ["varanasi", "homestay", "stay", "ghat"],
  },
  {
    path: "/banaras-homestays",
    label: "Banaras homestays",
    matchTerms: ["banaras", "kashi", "heritage", "old city"],
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
    matchTerms: ["family", "kids", "group", "parents"],
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

  const routeContent =
    LOCALITY_ROUTE_CONTENT[canonicalPath] ?? LOCALITY_ROUTE_CONTENT["/"];

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
  const routeContent =
    LOCALITY_ROUTE_CONTENT[canonicalPath] ?? LOCALITY_ROUTE_CONTENT["/"];

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
      "Banaras stays",
      "Kashi Vishwanath Temple",
      "Ganga ghats",
    ],
    isPartOf: {
      "@type": "WebSite",
      name: SEO_SITE_NAME,
      url: buildAbsoluteUrl("/"),
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
      headline: input.title,
      description,
      image: [buildAbsoluteUrl(imagePath)],
      url: buildAbsoluteUrl(canonicalPath),
      mainEntityOfPage: buildAbsoluteUrl(canonicalPath),
      datePublished: input.publishedAt,
      dateModified: input.publishedAt,
      author: {
        "@type": "Organization",
        name: SEO_SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SEO_SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: buildAbsoluteUrl(SEO_DEFAULT_IMAGE_PATH),
        },
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
