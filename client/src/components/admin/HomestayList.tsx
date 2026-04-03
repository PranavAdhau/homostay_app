import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Pencil, Trash2, Copy, CalendarDays, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import api from '../../lib/adminAxios';
interface Homestay {
  id: number;
  slug: string;
  name: string;
  capacity: number;
  rooms: number;
  price_per_night: number;
  is_active: boolean;
  created_at?: string;
}
export default function HomestayList() {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchHomestays();
  }, []);
  const fetchHomestays = async () => {
    setLoading(true);
    try {
      const response = await api.get('/homestays');
      if (response.data.success) {
        setHomestays(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCopyPropertyLink = async (slug: string) => {
    try {
      const url = `${window.location.origin}/properties/${slug}`;
      await navigator.clipboard.writeText(url);
      toast('Property link copied', { position: 'top-right', duration: 2000 });
    } catch (error) {
      console.error('Failed to copy property link:', error);
    }
  };
  const handleCopyCalendarLink = async (id: number) => {
    try {
      const url = `${window.location.origin}/calendars/${id}.ics`;
      await navigator.clipboard.writeText(url);
      toast('Calendar link (.ics) copied', { position: 'top-right', duration: 2000 });
    } catch (error) {
      console.error('Failed to copy calendar link:', error);
    }
  };
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this homestay? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await api.delete(`/homestays/${id}`);
      await fetchHomestays();
    } catch (error) {
      console.error('Error deleting homestay:', error);
      alert('Failed to delete homestay');
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
          <h2 className="text-2xl font-semibold text-foreground mb-1">Homestays</h2>
          <p className="text-sm text-muted-foreground">{homestays.length} propert{homestays.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <Button onClick={() => navigate('/admin/homestays/new')}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Homestay
        </Button>
      </div>
      {homestays.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No homestays found. Click "New Homestay" to create one.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rooms</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price / Night</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {homestays.map((homestay, index) => (
                  <motion.tr
                    key={homestay.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">{homestay.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{homestay.capacity}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{homestay.rooms}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">RM{homestay.price_per_night.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      {homestay.is_active ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Active</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <span className="mr-1.5">Actions</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[180px] whitespace-nowrap"
                        >
                          <DropdownMenuItem onClick={() => navigate(`/properties/${homestay.slug}`)}>
                            <Eye className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/homestays/${homestay.id}/edit`)}>
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyPropertyLink(homestay.slug)}>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">Copy Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyCalendarLink(homestay.id)}>
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">Copy Calendar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(homestay.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {homestays.map((homestay, index) => (
                <motion.div
                  key={homestay.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-card-foreground">{homestay.name}</h3>
                    {homestay.is_active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Active</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Inactive</span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Capacity: {homestay.capacity}</span>
                    <span>Rooms: {homestay.rooms}</span>
                    <span>RM{homestay.price_per_night.toFixed(2)}/night</span>
                  </div>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <span className="mr-1.5">Actions</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[180px] whitespace-nowrap"
                      >
                        <DropdownMenuItem onClick={() => navigate(`/properties/${homestay.slug}`)}>
                          <Eye className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/homestays/${homestay.id}/edit`)}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyPropertyLink(homestay.slug)}>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">Copy Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyCalendarLink(homestay.id)}>
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">Copy Calendar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(homestay.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
