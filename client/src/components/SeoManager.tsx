import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "./SiteSettingsProvider";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SEO_SITE_NAME,
  applySeoMetadata,
  buildAbsoluteUrl,
  setJsonLd,
} from "../lib/seo";

function buildRouteMetadata(pathname: string) {
  if (pathname.startsWith("/admin")) {
    return {
      title: "Sacred Homes Admin",
      description: "Sacred Homes Varanasi administration panel.",
      canonicalPath: pathname,
      robots: "noindex,nofollow",
    };
  }

  if (pathname === "/homestays") {
    return {
      title: "Homestays in Varanasi | Sacred Homes",
      description:
        "Explore Sacred Homes homestays in Varanasi with peaceful stays near the ghats, temples, and the old city.",
      canonicalPath: "/homestays",
    };
  }

  if (pathname === "/bookings") {
    return {
      title: "Book Your Varanasi Homestay | Sacred Homes",
      description:
        "Reserve your Sacred Homes Varanasi stay with an easy booking flow for premium homestays near the ghats and temples.",
      canonicalPath: "/bookings",
    };
  }

  if (pathname.startsWith("/properties/")) {
    return {
      title: "Homestay in Varanasi | Sacred Homes",
      description:
        "View stay details, amenities, and booking information for a Sacred Homes Varanasi homestay near the city's iconic ghats and temples.",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/blogs/")) {
    return {
      title: "Sacred Homes Journal | Varanasi Travel Stories",
      description:
        "Read travel notes, local stories, and thoughtful guidance from Sacred Homes Varanasi.",
      canonicalPath: pathname,
    };
  }

  return {
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    canonicalPath: "/",
  };
}

export default function SeoManager() {
  const location = useLocation();
  const { settings } = useSiteSettings();

  const routeMetadata = useMemo(
    () => buildRouteMetadata(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    applySeoMetadata(routeMetadata);
  }, [routeMetadata]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setJsonLd("sacred-homes-organization-jsonld", null);
      setJsonLd("sacred-homes-lodging-jsonld", null);
      return;
    }

    const contactPoint =
      settings?.phone && settings.phone.trim().length > 0
        ? [
            {
              "@type": "ContactPoint",
              telephone: settings.phone,
              contactType: "customer support",
              availableLanguage: ["English", "Hindi"],
            },
          ]
        : undefined;

    const sameAs =
      settings?.instagram && settings.instagram.trim().length > 0
        ? [settings.instagram]
        : undefined;

    setJsonLd("sacred-homes-organization-jsonld", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SEO_SITE_NAME,
      url: buildAbsoluteUrl("/"),
      logo: buildAbsoluteUrl("/sacred-homes-logo-circle.svg"),
      email: settings?.email || undefined,
      sameAs,
      contactPoint,
    });

    setJsonLd("sacred-homes-lodging-jsonld", {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: SEO_SITE_NAME,
      description: SEO_DEFAULT_DESCRIPTION,
      url: buildAbsoluteUrl("/"),
      image: buildAbsoluteUrl("/sacred-homes-logo-circle.svg"),
      telephone: settings?.phone || undefined,
      email: settings?.email || undefined,
      priceRange: "₹₹",
      checkinTime: "14:00",
      checkoutTime: "11:00",
      address: {
        "@type": "PostalAddress",
        streetAddress: settings?.address || "Varanasi, Uttar Pradesh, India",
        addressLocality: "Varanasi",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
    });
  }, [location.pathname, settings]);

  return null;
}
