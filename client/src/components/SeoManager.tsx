import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "./SiteSettingsProvider";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_SITE_NAME,
  applySeoMetadata,
  buildBreadcrumbJsonLd,
  buildAbsoluteUrl,
  buildRouteMetadata,
  buildWebPageJsonLd,
  isDynamicSeoRoute,
  normalizeCanonicalPath,
  setJsonLd,
} from "../lib/seo";

export default function SeoManager() {
  const location = useLocation();
  const { settings } = useSiteSettings();

  const routeMetadata = useMemo(
    () => buildRouteMetadata(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    if (!isDynamicSeoRoute(location.pathname)) {
      applySeoMetadata(routeMetadata);
    }
  }, [location.pathname, routeMetadata]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setJsonLd("sacred-homes-organization-jsonld", null);
      setJsonLd("sacred-homes-lodging-jsonld", null);
      setJsonLd("sacred-homes-webpage-jsonld", null);
      setJsonLd("sacred-homes-route-breadcrumb-jsonld", null);
      return;
    }

    const canonicalPath = normalizeCanonicalPath(location.pathname);
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
      areaServed: ["Varanasi", "Banaras", "Kashi"],
    });

    setJsonLd(
      "sacred-homes-webpage-jsonld",
      buildWebPageJsonLd(canonicalPath),
    );

    if (!canonicalPath.startsWith("/properties/") && !canonicalPath.startsWith("/blogs/")) {
      const breadcrumbName =
        routeMetadata.title.split("|")[0]?.trim() || SEO_SITE_NAME;
      setJsonLd(
        "sacred-homes-route-breadcrumb-jsonld",
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          ...(canonicalPath === "/"
            ? []
            : [{ name: breadcrumbName, path: canonicalPath }]),
        ]),
      );
    } else {
      setJsonLd("sacred-homes-route-breadcrumb-jsonld", null);
    }
  }, [location.pathname, routeMetadata.title, settings]);

  return null;
}
