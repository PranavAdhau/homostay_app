import adminApi from "./adminAxios";

export type SiteSetting = {
  phone: string;
  email: string;
  instagram: string;
  address: string | null;
  whatsapp_number: string;
};

export async function fetchSiteSettings(): Promise<SiteSetting> {
  const response = await adminApi.get("/site_setting");
  return response.data.data as SiteSetting;
}

export async function updateSiteSettings(payload: SiteSetting): Promise<SiteSetting> {
  const response = await adminApi.patch("/site_setting", { site_setting: payload });
  return response.data.data as SiteSetting;
}

