import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BLOG_PLACEHOLDER_IMAGE } from '../lib/blogPlaceholder';
import { resolveApiBaseUrl } from '../lib/apiBaseUrl';

interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const previewText = (content: string) => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 120) return normalized;
  return `${normalized.slice(0, 117).trimEnd()}...`;
};

function BlogCardSkeleton() {
  return (
    <div className="bg-white border border-[#E5ECE6] rounded-xl overflow-hidden shadow-sm w-full">
      <div className="w-full h-48 animate-pulse bg-[#F8F8F8]" />
      <div className="p-5 space-y-3">
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
    </div>
  );
}

function BlogCard({
  blog,
  onNavigate,
}: {
  blog: Blog;
  onNavigate: () => void;
}) {
  return (
    <div
      className="group bg-white border border-[#E5ECE6] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={onNavigate}
    >
      {/* Image */}
      <div className="overflow-hidden shrink-0">
        <ImageWithFallback
          src={blog.image_url || BLOG_PLACEHOLDER_IMAGE}
          alt={blog.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date */}
        <p className="text-xs text-[#73867A] uppercase tracking-[0.18em] mb-2">
          {new Date(blog.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>

        {/* Title */}
        <h3 className="text-[#173A39] text-lg font-semibold leading-snug line-clamp-2 mb-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[#4F5F5B] text-sm leading-relaxed line-clamp-3 flex-1 mb-5">
          {previewText(blog.content)}
        </p>

        {/* Read More — left-aligned inline, NOT full-width */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#173A39] hover:text-[#1F8A84] hover:underline w-fit"
        >
          Read More
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function BlogsSection() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const baseURL = resolveApiBaseUrl();
        const response = await fetch(`${baseURL}/api/v1/blogs`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setBlogs(data.data);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <section id="blogs" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <AnimatedSection className="text-center mb-12">
          <motion.h2
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            From The <span className="text-[#1F8A84]">Journal</span>
          </motion.h2>
          <motion.p
            className="text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Local stories, travel inspiration, and thoughtful notes to help
            guests experience Sacred Homes and Varanasi more deeply.
          </motion.p>
        </AnimatedSection>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#73867A]">No blogs available.</p>
            </div>
          ) : (
            <>
              {/* Mobile: 1 card snap-scroll */}
              <div className="flex sm:hidden gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hidden pb-4 -mx-4 px-4">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                    className="snap-center flex-shrink-0 w-[82vw]"
                  >
                    <BlogCard
                      blog={blog}
                      onNavigate={() => navigate(`/blogs/${blog.id}`)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Tablet: 2 cols */}
              <div className="hidden sm:grid xl:hidden grid-cols-2 gap-6">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                  >
                    <BlogCard
                      blog={blog}
                      onNavigate={() => navigate(`/blogs/${blog.id}`)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Desktop: 3 cols */}
              <div className="hidden xl:grid grid-cols-3 gap-6">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                  >
                    <BlogCard
                      blog={blog}
                      onNavigate={() => navigate(`/blogs/${blog.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default memo(BlogsSection);
