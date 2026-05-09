export interface HomestayAmenity {
  id: number;
  name: string;
  icon_name?: string;
}

export interface PublicHomestay {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_per_night: number;
  images: string[];
  featured_image?: string | null;
  capacity: number;
  rooms: number;
  size?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  amenities: HomestayAmenity[];
  seo_summary?: string | null;
  seo_locality_focus?: string | null;
  locality_tags?: string[];
  nearby_landmark_tags?: string[];
  related_blog_ids?: number[];
  related_homestay_ids?: number[];
  faq_entries?: Array<{ question: string; answer: string }>;
}
