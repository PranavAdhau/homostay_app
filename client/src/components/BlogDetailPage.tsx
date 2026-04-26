import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import api from '../lib/axios';
import { BLOG_PLACEHOLDER_IMAGE } from '../lib/blogPlaceholder';
import { applySeoMetadata, buildAbsoluteUrl, setJsonLd } from '../lib/seo';

interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const formatContent = (content: string) =>
  content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const numericId = id.split('-')[0];
        const response = await api.get(`/blogs/${numericId}`);
        if (response.data.success) {
          setBlog(response.data.data);
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

    const description =
      blog.content.replace(/\s+/g, ' ').trim().slice(0, 155) ||
      'Read Sacred Homes journal stories and Varanasi travel notes.';
    const imageUrl = blog.image_url || '/sacred-homes-logo-circle.svg';

    applySeoMetadata({
      title: `${blog.title} | Sacred Homes Journal`,
      description,
      canonicalPath: `/blogs/${id}`,
      image: imageUrl,
      type: 'article',
      twitterCard: 'summary_large_image',
    });

    setJsonLd('sacred-homes-blog-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description,
      image: buildAbsoluteUrl(imageUrl),
      url: buildAbsoluteUrl(`/blogs/${id}`),
      publisher: {
        '@type': 'Organization',
        name: 'Sacred Homes Varanasi',
        logo: {
          '@type': 'ImageObject',
          url: buildAbsoluteUrl('/sacred-homes-logo-circle.svg'),
        },
      },
      datePublished: blog.created_at,
    });

    return () => setJsonLd('sacred-homes-blog-jsonld', null);
  }, [blog, id]);

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
          <button
            onClick={() => navigate('/#blogs')}
            className="text-sm text-[#73867A] mb-6 hover:text-[#1F8A84] hover:underline"
          >
            ← Back to Blogs
          </button>

          <article>
            <div className="w-full mb-8">
              <ImageWithFallback
                src={blog.image_url || BLOG_PLACEHOLDER_IMAGE}
                alt={blog.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg"
              />
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-4 text-[#173A39]">
              {blog.title}
            </h1>
            <p className="text-sm text-[#73867A] mb-6">{formattedDate}</p>

            <div className="text-[#4F5F5B] leading-relaxed space-y-4 text-base md:text-lg">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={`${blog.id}-${index}`}>{paragraph}</p>
                ))
              ) : (
                <p>No journal content is available for this entry yet.</p>
              )}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
