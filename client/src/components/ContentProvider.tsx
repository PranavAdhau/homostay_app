import { createContext, useContext, useEffect, useState } from "react";
import { fetchHostProfile, fetchSiteContent, type HostProfile, type SiteContent } from "../lib/content";

type ContentContextValue = {
  hostProfile: HostProfile | null;
  siteContent: SiteContent | null;
  loading: boolean;
};

const ContentContext = createContext<ContentContextValue>({
  hostProfile: null,
  siteContent: null,
  loading: true,
});

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [hostData, contentData] = await Promise.all([
          fetchHostProfile(),
          fetchSiteContent(),
        ]);
        if (!cancelled) {
          setHostProfile(hostData);
          setSiteContent(contentData);
        }
      } catch (error) {
        console.error("Failed to load public content", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentContext.Provider value={{ hostProfile, siteContent, loading }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
