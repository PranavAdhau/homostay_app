import api from "./axios";

export type PublicSiteSettings = {
  phone: string;
  email: string;
  instagram: string;
  address: string | null;
  whatsapp_number: string;
};

const defaultSiteSettings: PublicSiteSettings = {
  phone: "",
  email: "",
  instagram: "",
  address: null,
  whatsapp_number: "",
};

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const response = await api.get("/site_settings");
  if (!response.data?.success || !response.data?.data) {
    return defaultSiteSettings;
  }
  return {
    ...defaultSiteSettings,
    ...response.data.data,
  } as PublicSiteSettings;
}

