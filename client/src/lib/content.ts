import api from "./axios";

export type HostProfile = {
  host_name: string;
  host_bio: string;
  host_description?: string | null;
  host_contact: string;
  host_phone?: string | null;
  co_host_name: string;
  co_host_bio: string;
  co_host_description?: string | null;
  co_host_contact: string;
  co_host_phone?: string | null;
  host_image_url: string | null;
  co_host_image_url: string | null;
};

export type SiteContent = {
  house_rules_pdf_url: string | null;
  cancellation_policy_pdf_url: string | null;
  little_more_image_urls: string[];
  host_property_image_urls: string[];
  donation_percentage: number | null;
  total_contribution_amount: number | null;
};

export async function fetchHostProfile(): Promise<HostProfile | null> {
  const response = await api.get("/host_profile");
  return response.data?.success ? (response.data.data as HostProfile) : null;
}

export async function fetchSiteContent(): Promise<SiteContent | null> {
  const response = await api.get("/site_content");
  return response.data?.success ? (response.data.data as SiteContent) : null;
}
