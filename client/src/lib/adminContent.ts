import adminApi from "./adminAxios";
import type { HostProfile, SiteContent } from "./content";

export async function fetchAdminHostProfile(): Promise<HostProfile> {
  const response = await adminApi.get("/host_profile");
  return response.data.data as HostProfile;
}

export async function updateAdminHostProfile(formData: FormData): Promise<HostProfile> {
  const response = await adminApi.patch("/host_profile", formData);
  return response.data.data as HostProfile;
}

export async function fetchAdminSiteContent(): Promise<SiteContent> {
  const response = await adminApi.get("/site_content");
  return response.data.data as SiteContent;
}

export async function updateAdminSiteContent(formData: FormData): Promise<SiteContent> {
  const response = await adminApi.patch("/site_content", formData);
  return response.data.data as SiteContent;
}
