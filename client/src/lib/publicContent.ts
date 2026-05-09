import api from "./axios";
import type { PublicHomestay } from "./homestays";
import { normalizeNumericIds } from "./seo";

export interface PublicBlog {
  id: number;
  slug: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at?: string;
  seo_summary?: string | null;
  featured_locality?: string | null;
  locality_tags?: string[];
  nearby_landmark_tags?: string[];
  related_homestay_ids?: number[];
  related_blog_ids?: number[];
  faq_entries?: Array<{ question: string; answer: string }>;
}

// Fix: normalize all ID arrays on each blog to guarantee numeric types
function normalizeBlog(blog: PublicBlog): PublicBlog {
  return {
    ...blog,
    id: Number(blog.id),
    related_homestay_ids: normalizeNumericIds(blog.related_homestay_ids ?? []),
    related_blog_ids: normalizeNumericIds(blog.related_blog_ids ?? []),
  };
}

// Fix: normalize all ID arrays on each homestay to guarantee numeric types
function normalizeHomestay(homestay: PublicHomestay): PublicHomestay {
  return {
    ...homestay,
    id: Number(homestay.id),
    related_blog_ids: normalizeNumericIds(homestay.related_blog_ids ?? []),
    related_homestay_ids: normalizeNumericIds(homestay.related_homestay_ids ?? []),
  };
}

const blogCache = new Map<number, Promise<PublicBlog[]>>();
let homestayCache: Promise<PublicHomestay[]> | null = null;

export async function fetchPublicBlogs(limit = 10) {
  if (!blogCache.has(limit)) {
    blogCache.set(
      limit,
      api
        .get("/blogs", { params: { limit } })
        .then((response) =>
          response.data?.success && Array.isArray(response.data?.data)
            ? (response.data.data as PublicBlog[]).map(normalizeBlog)
            : [],
        )
        .catch((error) => {
          blogCache.delete(limit);
          throw error;
        }),
    );
  }

  return blogCache.get(limit)!;
}

export async function fetchPublicHomestays() {
  if (!homestayCache) {
    homestayCache = api
      .get("/homestays")
      .then((response) =>
        response.data?.success && Array.isArray(response.data?.data)
          ? (response.data.data as PublicHomestay[]).map(normalizeHomestay)
          : [],
      )
      .catch((error) => {
        homestayCache = null;
        throw error;
      });
  }

  return homestayCache;
}
