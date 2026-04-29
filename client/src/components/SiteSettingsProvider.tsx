import { createContext, useContext, useEffect, useState } from "react";
import type { PublicSiteSettings } from "../lib/siteSettings";
import { fetchPublicSiteSettings } from "../lib/siteSettings";

type SiteSettingsContextValue = {
  settings: PublicSiteSettings | null;
  loading: boolean;
  error: boolean;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: null,
  loading: true,
  error: false,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchPublicSiteSettings();
        if (!cancelled) {
          setSettings(data);
          setError(false);
        }
      } catch (e) {
        console.error("Failed to load public site settings", e);
        if (!cancelled) {
          setSettings(null);
          setError(true);
        }
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
    <SiteSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

