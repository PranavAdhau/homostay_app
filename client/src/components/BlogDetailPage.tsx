import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import api from '../lib/axios';
import { BLOG_PLACEHOLDER_IMAGE } from '../lib/blogPlaceholder';

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
        const response = await api.get(`/blogs/${id}`);
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
            onClick={() => navigate('/')}
            className="text-sm text-[#73867A] mb-6 hover:text-[#1F8A84] hover:underline"
          >
            ← Back to Home
          </button>
          <div className="text-center py-16">
            <h1 className="text-3xl text-[#173A39] mb-4">Blog not found</h1>
            <p className="text-[#4F5F5B] mb-6">This article is unavailable or may no longer be published.</p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-[#73867A] hover:text-[#1F8A84] hover:underline"
            >
              ← Back to Home
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
            onClick={() => navigate('/')}
            className="text-sm text-[#73867A] mb-6 hover:text-[#1F8A84] hover:underline"
          >
            ← Back to Home
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
                <p>No blog content available.</p>
              )}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
