import { resolveCanonicalBaseUrl } from "./apiBaseUrl";

export const SEO_SITE_NAME = "Sacred Homes Varanasi";
export const SEO_DEFAULT_TITLE =
  "Sacred Homes Varanasi | Premium Homestays Near Ghats & Temples";
export const SEO_DEFAULT_DESCRIPTION =
  "Discover premium homestays in Varanasi near the ghats, temples, and sacred city landmarks. Book your stay with Sacred Homes Varanasi for a peaceful, comfortable experience.";
export const SEO_DEFAULT_KEYWORDS =
  "homestays in Varanasi, best homestay in Varanasi, stay near ghats in Varanasi, Varanasi Airbnb, homestay near Kashi Vishwanath temple, budget stay in Varanasi, family stay in Varanasi, Sacred Homes Varanasi";
export const SEO_THEME_COLOR = "#1F8A84";
export const SEO_AUTHOR = "Sacred Homes Varanasi";
export const SEO_DEFAULT_IMAGE_PATH = "/sacred-homes-logo-circle.svg";

export type SeoMetadata = {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  image?: string;
  robots?: string;
  type?: string;
  twitterCard?: "summary" | "summary_large_image";
};

export function buildAbsoluteUrl(path: string) {
  return new URL(path, `${resolveCanonicalBaseUrl()}/`).toString();
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
  robots = "index,follow",
  type = "website",
  twitterCard = "summary_large_image",
}: SeoMetadata) {
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const imageUrl = buildAbsoluteUrl(image);

  document.title = title;

  setMetaTag("name", "description", description);
  setMetaTag("name", "keywords", keywords);
  setMetaTag("name", "author", SEO_AUTHOR);
  setMetaTag("name", "robots", robots);
  setMetaTag("name", "theme-color", SEO_THEME_COLOR);

  setMetaTag("property", "og:type", type);
  setMetaTag("property", "og:site_name", SEO_SITE_NAME);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:url", canonicalUrl);
  setMetaTag("property", "og:image", imageUrl);

  setMetaTag("name", "twitter:card", twitterCard);
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", imageUrl);

  setLinkTag("canonical", canonicalUrl);
}
