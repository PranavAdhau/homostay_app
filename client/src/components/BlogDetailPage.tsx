import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import api from '../lib/axios';
import { BLOG_PLACEHOLDER_IMAGE } from '../lib/blogPlaceholder';
import {
  applySeoMetadata,
  buildBlogPath,
  buildBlogSeo,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildManagedInternalLinks,
  normalizeFaqEntries,
  normalizeNumericIds,
  resolveItemsByIds,
  setJsonLd,
} from '../lib/seo';
import { fetchPublicBlogs, fetchPublicHomestays, type PublicBlog } from '../lib/publicContent';
import type { PublicHomestay } from '../lib/homestays';

const formatContent = (content: string) =>
  content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<PublicBlog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [relatedProperties, setRelatedProperties] = useState<PublicHomestay[]>([]);
  const [managedLocalityLinks, setManagedLocalityLinks] = useState<ReturnType<typeof buildManagedInternalLinks>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const numericId = id.split('-')[0];
        const response = await api.get(`/blogs/${numericId}`);
        if (response.data.success) {
          const data = response.data.data;
          // Fix: normalize related ID arrays to numbers on hydration
          setBlog({
            ...data,
            id: Number(data.id),
            related_homestay_ids: normalizeNumericIds(data.related_homestay_ids ?? []),
            related_blog_ids: normalizeNumericIds(data.related_blog_ids ?? []),
          });
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (!blog || !id) {
      return;
    }

    const blogSeo = buildBlogSeo({
      id,
      title: blog.title,
      content: blog.content,
      seoSummary: blog.seo_summary,
      featuredLocality: blog.featured_locality,
      localityTags: blog.locality_tags,
      nearbyLandmarkTags: blog.nearby_landmark_tags,
      faqEntries: blog.faq_entries,
      imageUrl: blog.image_url,
      publishedAt: blog.created_at,
    });

    applySeoMetadata(blogSeo.metadata);
    setJsonLd('sacred-homes-blog-jsonld', blogSeo.schema);
    setJsonLd('sacred-homes-faq-jsonld', buildFaqJsonLd(blogSeo.faqEntries));
    setJsonLd(
      'sacred-homes-breadcrumb-jsonld',
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: blog.title, path: `/blogs/${id}` },
      ]),
    );

    return () => {
      setJsonLd('sacred-homes-blog-jsonld', null);
      setJsonLd('sacred-homes-faq-jsonld', null);
      setJsonLd('sacred-homes-breadcrumb-jsonld', null);
    };
  }, [blog, id]);

  useEffect(() => {
    if (!blog) {
      return;
    }

    let cancelled = false;

    const loadRelatedContent = async () => {
      try {
        const [blogs, properties] = await Promise.all([
          fetchPublicBlogs(20),
          fetchPublicHomestays(),
        ]);

        if (cancelled) {
          return;
        }

        setManagedLocalityLinks(
          buildManagedInternalLinks(
            [
              blog.featured_locality,
              ...(blog.locality_tags ?? []),
              ...(blog.nearby_landmark_tags ?? []),
            ],
            4,
          ),
        );
        setRelatedBlogs(
          resolveItemsByIds(blog.related_blog_ids ?? [], blogs)
            .filter((item) => item.id !== blog.id)
            .slice(0, 3),
        );

        setRelatedProperties(
          resolveItemsByIds(blog.related_homestay_ids ?? [], properties).slice(0, 3),
        );
      } catch (error) {
        console.error('Error fetching related SEO content:', error);
        if (!cancelled) {
          setManagedLocalityLinks([]);
          setRelatedBlogs([]);
          setRelatedProperties([]);
        }
      }
    };

    loadRelatedContent();

    return () => {
      cancelled = true;
    };
  }, [blog]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8A84] mx-auto" />
            <p className="mt-4 text-[#4F5F5B]">Loading blog...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <button
            onClick={() => navigate('/#blogs')}
            className="text-sm text-[#73867A] mb-6 hover:text-[#1F8A84] hover:underline"
          >
            ← Back to Blogs
          </button>
          <div className="text-center py-16">
            <h1 className="text-3xl text-[#173A39] mb-4">Blog not found</h1>
            <p className="text-[#4F5F5B] mb-6">This article is unavailable or may no longer be published.</p>
            <button
              onClick={() => navigate('/#blogs')}
              className="text-sm text-[#73867A] hover:text-[#1F8A84] hover:underline"
            >
              ← Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const paragraphs = formatContent(blog.content);
  const formattedDate = new Date(blog.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const faqEntries = normalizeFaqEntries(blog.faq_entries);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[#73867A]">
            <Link to="/" className="hover:text-[#1F8A84] hover:underline">
              Home
            </Link>
            {' / '}
            <Link
              to="/#blogs"
              className="hover:text-[#1F8A84] hover:underline"
            >
              Journal
            </Link>
            {' / '}
            <span aria-current="page" className="text-[#4F5F5B]">
              {blog.title}
            </span>
          </nav>

          <article>
            <header>
              <div className="w-full mb-8">
                <ImageWithFallback
                  src={blog.image_url || BLOG_PLACEHOLDER_IMAGE}
                  alt={`${blog.title} - Sacred Homes Journal cover`}
                  className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                  width={1600}
                  height={900}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-4 text-[#173A39]">
                {blog.title}
              </h1>
              <p className="text-sm text-[#73867A] mb-6">{formattedDate}</p>
            </header>

            <section aria-label="Journal article content">
              <div className="text-[#4F5F5B] leading-relaxed space-y-4 text-base md:text-lg">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={`${blog.id}-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>No journal content is available for this entry yet.</p>
                )}
              </div>
            </section>

            {managedLocalityLinks.length > 0 && (
              <section
                aria-labelledby="locality-guides-heading"
                className="mt-10 border-t border-[#E5ECE6] pt-6"
              >
                <h2
                  id="locality-guides-heading"
                  className="text-xl font-semibold text-[#173A39] mb-3"
                >
                  Explore related locality pages
                </h2>
                <div className="flex flex-wrap gap-3">
                  {managedLocalityLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="rounded-full border border-[#CFE1D8] px-4 py-2 text-sm text-[#1F8A84] hover:bg-[#F4F7F6]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {relatedProperties.length > 0 && (
              <section
                aria-labelledby="related-properties-heading"
                className="mt-10 border-t border-[#E5ECE6] pt-6"
              >
                <h2
                  id="related-properties-heading"
                  className="text-xl font-semibold text-[#173A39] mb-3"
                >
                  Related stays
                </h2>
                <div className="flex flex-wrap gap-3">
                  {relatedProperties.map((property) => (
                    <Link
                      key={property.slug}
                      to={`/properties/${property.slug}`}
                      className="rounded-full border border-[#CFE1D8] px-4 py-2 text-sm text-[#1F8A84] hover:bg-[#F4F7F6]"
                    >
                      {property.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {relatedBlogs.length > 0 && (
              <section
                aria-labelledby="related-blogs-heading"
                className="mt-10 border-t border-[#E5ECE6] pt-6"
              >
                <h2
                  id="related-blogs-heading"
                  className="text-xl font-semibold text-[#173A39] mb-3"
                >
                  More Varanasi travel stories
                </h2>
                <div className="flex flex-wrap gap-3">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link
                      key={relatedBlog.id}
                      to={buildBlogPath(relatedBlog)}
                      className="rounded-full border border-[#CFE1D8] px-4 py-2 text-sm text-[#1F8A84] hover:bg-[#F4F7F6]"
                    >
                      {relatedBlog.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {faqEntries.length > 0 && (
              <section
                aria-labelledby="blog-faq-heading"
                className="mt-10 border-t border-[#E5ECE6] pt-6"
              >
                <h2
                  id="blog-faq-heading"
                  className="text-xl font-semibold text-[#173A39] mb-3"
                >
                  Frequently asked questions
                </h2>
                <div className="space-y-4">
                  {faqEntries.map((faqEntry, index) => (
                    <details
                      key={`${faqEntry.question}-${index}`}
                      className="rounded-xl border border-[#E5ECE6] bg-white px-4 py-3"
                    >
                      <summary className="cursor-pointer text-[#173A39] font-medium">
                        {faqEntry.question}
                      </summary>
                      <p className="mt-3 text-[#4F5F5B] leading-relaxed">
                        {faqEntry.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
