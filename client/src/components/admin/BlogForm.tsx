import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import api from '../../lib/adminAxios';
import { BLOG_PLACEHOLDER_IMAGE } from '../../lib/blogPlaceholder';
import { normalizeNumericIds } from '../../lib/seo';

interface BlogFormData {
  title: string;
  content: string;
  is_published: boolean;
  image_url?: string | null;
  seo_summary: string;
  featured_locality: string;
  locality_tags_text: string;
  nearby_landmark_tags_text: string;
  faq_entries_text: string;
  related_homestay_ids: number[];
  related_blog_ids: number[];
}

interface AdminHomestayOption {
  id: number;
  name: string;
}

interface AdminBlogOption {
  id: number;
  title: string;
}

export default function BlogForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [blog, setBlog] = useState<BlogFormData>({
    title: '',
    content: '',
    is_published: true,
    image_url: null,
    seo_summary: '',
    featured_locality: '',
    locality_tags_text: '',
    nearby_landmark_tags_text: '',
    faq_entries_text: '',
    related_homestay_ids: [],
    related_blog_ids: [],
  });
  const [homestayOptions, setHomestayOptions] = useState<AdminHomestayOption[]>([]);
  const [blogOptions, setBlogOptions] = useState<AdminBlogOption[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions();
    if (isEditing && id) {
      fetchBlog(id);
    }
  }, [id, isEditing]);

  const fetchOptions = async () => {
    try {
      const [homestayResponse, blogResponse] = await Promise.all([
        api.get('/homestays'),
        api.get('/blogs'),
      ]);

      if (homestayResponse.data.success) {
        setHomestayOptions(homestayResponse.data.data.map((item: AdminHomestayOption) => ({
          id: Number(item.id),
          name: item.name,
        })));
      }

      if (blogResponse.data.success) {
        setBlogOptions(blogResponse.data.data.map((item: AdminBlogOption) => ({
          id: Number(item.id),
          title: item.title,
        })));
      }
    } catch (error) {
      console.error('Error fetching SEO options for blog form:', error);
    }
  };

  const fetchBlog = async (blogId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/blogs/${blogId}`);
      if (response.data.success) {
        setBlog({
          title: response.data.data.title,
          content: response.data.data.content,
          is_published: !!response.data.data.is_published,
          image_url: response.data.data.image_url,
          seo_summary: response.data.data.seo_summary || '',
          featured_locality: response.data.data.featured_locality || '',
          locality_tags_text: (response.data.data.locality_tags || []).join(', '),
          nearby_landmark_tags_text: (response.data.data.nearby_landmark_tags || []).join(', '),
          faq_entries_text: (response.data.data.faq_entries || [])
            .map((entry: { question: string; answer: string }) => `${entry.question} | ${entry.answer}`)
            .join('\n'),
          // Fix: normalize to numbers so .includes() comparisons work correctly
          related_homestay_ids: normalizeNumericIds(response.data.data.related_homestay_ids || []),
          related_blog_ids: normalizeNumericIds(response.data.data.related_blog_ids || []),
        });
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('blog[title]', blog.title);
      formData.append('blog[content]', blog.content);
      formData.append('blog[is_published]', String(blog.is_published));
      formData.append('blog[seo_summary]', blog.seo_summary);
      formData.append('blog[featured_locality]', blog.featured_locality);
      formData.append('blog[locality_tags_text]', blog.locality_tags_text);
      formData.append('blog[nearby_landmark_tags_text]', blog.nearby_landmark_tags_text);
      formData.append('blog[faq_entries_text]', blog.faq_entries_text);
      blog.related_homestay_ids.forEach((relatedId) =>
        formData.append('blog[related_homestay_ids][]', String(relatedId)),
      );
      blog.related_blog_ids.forEach((relatedId) =>
        formData.append('blog[related_blog_ids][]', String(relatedId)),
      );
      if (imageFile) {
        formData.append('blog[image]', imageFile);
      }

      if (isEditing && id) {
        await api.patch(`/blogs/${id}`, formData);
      } else {
        await api.post('/blogs', formData);
      }

      navigate('/admin/blogs');
    } catch (error: any) {
      console.error('Error saving blog:', error);
      alert(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  const previewUrl = useMemo(() => {
    if (!imageFile) return blog.image_url || BLOG_PLACEHOLDER_IMAGE;
    return URL.createObjectURL(imageFile);
  }, [blog.image_url, imageFile]);

  useEffect(() => {
    if (!imageFile || !previewUrl.startsWith('blob:')) return;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile, previewUrl]);

  const toggleRelatedId = (
    field: 'related_homestay_ids' | 'related_blog_ids',
    itemId: number,
  ) => {
    // Fix: ensure itemId is always a number before comparing
    const numericItemId = Number(itemId);
    setBlog((current) => ({
      ...current,
      [field]: current[field].includes(numericItemId)
        ? current[field].filter((existingId) => existingId !== numericItemId)
        : [...current[field], numericItemId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-foreground">
          {isEditing ? 'Edit Blog' : 'New Blog'}
        </h2>
        <Button variant="outline" onClick={() => navigate('/admin/blogs')}>
          <X className="h-4 w-4 mr-1.5" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-base font-semibold">Blog Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={blog.title}
                  onChange={(e) => setBlog((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={blog.content}
                  onChange={(e) => setBlog((prev) => ({ ...prev, content: e.target.value }))}
                  required
                  rows={14}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="seo_summary">SEO Summary</Label>
                <Textarea
                  id="seo_summary"
                  value={blog.seo_summary}
                  onChange={(e) => setBlog((prev) => ({ ...prev, seo_summary: e.target.value }))}
                  rows={3}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Optional short summary used for search previews and structured content alignment.
                </p>
              </div>

              <div>
                <Label htmlFor="featured_locality">Featured Locality Focus</Label>
                <Input
                  id="featured_locality"
                  value={blog.featured_locality}
                  onChange={(e) => setBlog((prev) => ({ ...prev, featured_locality: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g. Assi Ghat or Kashi Vishwanath"
                />
              </div>

              <div>
                <Label htmlFor="locality_tags_text">Locality Tags</Label>
                <Textarea
                  id="locality_tags_text"
                  value={blog.locality_tags_text}
                  onChange={(e) => setBlog((prev) => ({ ...prev, locality_tags_text: e.target.value }))}
                  rows={2}
                  className="mt-1.5"
                  placeholder="Assi Ghat, Banaras, Old City"
                />
              </div>

              <div>
                <Label htmlFor="nearby_landmark_tags_text">Nearby Landmark Tags</Label>
                <Textarea
                  id="nearby_landmark_tags_text"
                  value={blog.nearby_landmark_tags_text}
                  onChange={(e) => setBlog((prev) => ({ ...prev, nearby_landmark_tags_text: e.target.value }))}
                  rows={2}
                  className="mt-1.5"
                  placeholder="Kashi Vishwanath Temple, Dashashwamedh Ghat"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <Label htmlFor="is_published" className="text-sm font-medium">
                    Published
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visible on the homepage and public blog page when enabled.
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={blog.is_published}
                  onCheckedChange={(checked) => setBlog((prev) => ({ ...prev, is_published: !!checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-base font-semibold">Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <ImageWithFallback
                src={previewUrl}
                alt={blog.title || 'Blog preview'}
                className="w-full h-72 rounded-2xl object-cover border border-border"
              />

              <div>
                <Label htmlFor="image">Upload image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mt-1.5 block w-full text-sm text-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 file:cursor-pointer file:transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use a single featured image for the blog card and detail page.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border lg:col-span-2">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-base font-semibold">Related SEO Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div>
                <Label htmlFor="faq_entries_text">FAQ Entries</Label>
                <Textarea
                  id="faq_entries_text"
                  value={blog.faq_entries_text}
                  onChange={(e) => setBlog((prev) => ({ ...prev, faq_entries_text: e.target.value }))}
                  rows={5}
                  className="mt-1.5"
                  placeholder="Question | Answer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use one FAQ per line in the format <code>Question | Answer</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Related Homestays</Label>
                  <div className="mt-3 space-y-2 rounded-xl border border-border p-4 max-h-64 overflow-y-auto">
                    {homestayOptions.map((option) => (
                      <label key={option.id} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={blog.related_homestay_ids.includes(Number(option.id))}
                          onChange={() => toggleRelatedId('related_homestay_ids', option.id)}
                        />
                        <span>{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Related Guides / Blogs</Label>
                  <div className="mt-3 space-y-2 rounded-xl border border-border p-4 max-h-64 overflow-y-auto">
                    {blogOptions
                      .filter((option) => String(option.id) !== id)
                      .map((option) => (
                        <label key={option.id} className="flex items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={blog.related_blog_ids.includes(Number(option.id))}
                            onChange={() => toggleRelatedId('related_blog_ids', option.id)}
                          />
                          <span>{option.title}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/blogs')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4 mr-1.5" />
            {submitting ? 'Saving...' : 'Save Blog'}
          </Button>
        </div>
      </form>
    </div>
  );
}
