import { createContext, useContext, useEffect, useState } from "react";
import type { PublicSiteSettings } from "../lib/siteSettings";
import { fetchPublicSiteSettings } from "../lib/siteSettings";

type SiteSettingsContextValue = {
  settings: PublicSiteSettings | null;
  loading: boolean;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: null,
  loading: true,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchPublicSiteSettings();
        if (!cancelled) setSettings(data);
      } catch (e) {
        console.error("Failed to load public site settings", e);
        if (!cancelled) setSettings(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

