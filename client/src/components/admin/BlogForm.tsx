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

interface BlogFormData {
  title: string;
  content: string;
  is_published: boolean;
  image_url?: string | null;
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
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchBlog(id);
    }
  }, [id, isEditing]);

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
