import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BLOG_PLACEHOLDER_IMAGE } from '../lib/blogPlaceholder';
import { fetchPublicBlogs, type PublicBlog } from '../lib/publicContent';
import { buildBlogImageAlt, buildBlogPath } from '../lib/seo';

const previewText = (content: string) => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 120) return normalized;
  return `${normalized.slice(0, 117).trimEnd()}...`;
};

function BlogCardSkeleton() {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] w-full h-full">
      <div className="relative w-full pt-[56.25%] animate-pulse bg-[#F8F8F8]" />
      <div className="p-5 sm:px-6 sm:py-5 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-[#F8F8F8]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#F8F8F8]" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-[#F8F8F8]" />
        <div className="space-y-1.5 pt-1">
          <div className="h-3.5 w-full animate-pulse rounded bg-[#F8F8F8]" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-[#F8F8F8]" />
          <div className="h-3.5 w-4/6 animate-pulse rounded bg-[#F8F8F8]" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded bg-[#F8F8F8] pt-2" />
      </div>
    </article>
  );
}

function BlogCard({ blog }: { blog: PublicBlog }) {
  const blogPath = buildBlogPath(blog);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="relative w-full pt-[56.25%] overflow-hidden shrink-0">
        <ImageWithFallback
          src={blog.image_url || BLOG_PLACEHOLDER_IMAGE}
          alt={buildBlogImageAlt(
            blog.title,
            blog.featured_locality,
            ...(blog.locality_tags ?? []),
            ...(blog.nearby_landmark_tags ?? []),
          )}
          loading="lazy"
          decoding="async"
          width={1200}
          height={675}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:px-6 sm:py-5">
        <time
          dateTime={new Date(blog.created_at).toISOString()}
          className="text-[0.75rem] text-[#2D9B8A] uppercase tracking-[0.05em] mb-2"
        >
          {new Date(blog.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>

        <h3 className="mb-2 text-[1.125rem] font-semibold leading-snug text-[#173A39] line-clamp-2">
          <Link
            to={blogPath}
            className="rounded-sm transition-colors hover:text-[#1F8A84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
          >
            {blog.title}
          </Link>
        </h3>

        <p className="text-[#6A7A76] text-[0.875rem] leading-relaxed line-clamp-3">
          {previewText(blog.content)}
        </p>

        <Link
          to={blogPath}
          className="mt-auto inline-flex min-h-11 w-fit items-center gap-1.5 rounded-sm pt-4 text-sm font-semibold text-[#2D9B8A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
        >
          Read More
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function BlogsSection() {
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchBlogs = async () => {
      try {
        const data = await fetchPublicBlogs(10);
        if (!cancelled) {
          setBlogs(data);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        if (!cancelled) {
          setBlogs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="blogs" className="py-20 bg-[#F4F7F6] scroll-mt-16 md:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <AnimatedSection className="text-center mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            From The <span className="text-[#1F8A84]">Journal</span>
          </motion.h2>
          <motion.p
            className="text-base sm:text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Local stories, stay-planning ideas, and neighborhood guides that
            help guests choose where to stay in Varanasi, which localities fit
            their trip, and how to experience Banaras more deeply.
          </motion.p>
        </AnimatedSection>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#73867A]">No journal entries are available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default memo(BlogsSection);
