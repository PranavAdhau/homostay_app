import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import api from '../../lib/adminAxios';
import { BLOG_PLACEHOLDER_IMAGE } from '../../lib/blogPlaceholder';

interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/blogs');
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setBlogs(response.data.data);
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

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await api.delete(`/blogs/${id}`);
      await fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Blogs</h2>
          <p className="text-sm text-muted-foreground">{blogs.length} blog{blogs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => navigate('/admin/blogs/new')}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Blog
        </Button>
      </div>

      {blogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No blogs available
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    <div className="w-full lg:w-52 shrink-0">
                      <ImageWithFallback
                        src={blog.image_url || BLOG_PLACEHOLDER_IMAGE}
                        alt={blog.title}
                        className="w-full h-36 rounded-xl object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-card-foreground">{blog.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.is_published ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {blog.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{blog.content}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                      <Button variant="outline" onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}>
                        <Pencil className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(blog.id)}>
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
