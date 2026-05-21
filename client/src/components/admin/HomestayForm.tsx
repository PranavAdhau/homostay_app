import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import api from '../../lib/adminAxios';
import { normalizeNumericIds } from '../../lib/seo';
import { toast } from 'sonner@2.0.3';

interface Amenity {
  id: number;
  name: string;
  icon_name?: string;
}

interface HomestayFormData {
  id?: number;
  name: string;
  description: string;
  capacity: number;
  rooms: number;
  size: string;
  price_per_night: number | null;
  is_active: boolean;
  amenity_ids: number[];
  airbnb_ical_url?: string;
  calendar_sync_enabled?: boolean;
  last_calendar_sync_at?: string | null;
  last_calendar_sync_success_at?: string | null;
  sync_error_count?: number;
  last_calendar_sync_error?: string | null;
  sync_state?: string;
  sync_state_label?: string;
  sync_state_message?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  google_maps_url?: string;
  seo_summary: string;
  seo_locality_focus: string;
  locality_tags_text: string;
  nearby_landmark_tags_text: string;
  faq_entries_text: string;
  related_blog_ids: number[];
  related_homestay_ids: number[];
}

interface AdminBlogOption {
  id: number;
  title: string;
}

interface AdminHomestayOption {
  id: number;
  name: string;
}

export default function HomestayForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [homestay, setHomestay] = useState<HomestayFormData>({
    name: '',
    description: '',
    capacity: 1,
    rooms: 1,
    size: '',
    price_per_night: null,
    is_active: true,
    amenity_ids: [],
    airbnb_ical_url: '',
    calendar_sync_enabled: false,
    seo_summary: '',
    seo_locality_focus: '',
    locality_tags_text: '',
    nearby_landmark_tags_text: '',
    faq_entries_text: '',
    related_blog_ids: [],
    related_homestay_ids: [],
  });
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [blogOptions, setBlogOptions] = useState<AdminBlogOption[]>([]);
  const [homestayOptions, setHomestayOptions] = useState<AdminHomestayOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncSubmitting, setSyncSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchAmenities();
    fetchSeoOptions();
    if (isEditing && id) fetchHomestay();
  }, [id, isEditing]);

  const fetchAmenities = async () => {
    try {
      const response = await api.get('/amenities');
      if (response.data.success) setAmenities(response.data.data);
    } catch (error) { console.error('Error fetching amenities:', error); }
  };

  const fetchSeoOptions = async () => {
    try {
      const [blogResponse, homestayResponse] = await Promise.all([
        api.get('/blogs'),
        api.get('/homestays'),
      ]);

      if (blogResponse.data.success) {
        setBlogOptions(blogResponse.data.data.map((item: AdminBlogOption) => ({
          id: Number(item.id),
          title: item.title,
        })));
      }

      if (homestayResponse.data.success) {
        setHomestayOptions(homestayResponse.data.data.map((item: AdminHomestayOption) => ({
          id: Number(item.id),
          name: item.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching SEO options for homestay form:', error);
    }
  };

  const fetchHomestay = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/homestays/${id}`);
      if (response.data.success) {
        const data = response.data.data;

        setHomestay({
          id: Number(data.id),

          name: data.name,
          description: data.description,

          capacity: data.capacity,
          rooms: data.rooms ?? 1,
          size: data.size || '',

          price_per_night: data.price_per_night,

          is_active: data.is_active,

          amenity_ids: data.amenities.map((a: Amenity) =>
            Number(a.id),
          ),

          airbnb_ical_url: data.airbnb_ical_url || '',

          calendar_sync_enabled: !!data.calendar_sync_enabled,

          last_calendar_sync_at: data.last_calendar_sync_at,

          last_calendar_sync_success_at:
            data.last_calendar_sync_success_at,

          sync_error_count: data.sync_error_count,

          last_calendar_sync_error:
            data.last_calendar_sync_error,

          sync_state: data.sync_state,

          sync_state_label: data.sync_state_label,

          sync_state_message: data.sync_state_message,

          latitude:
            typeof data.latitude === 'number'
              ? data.latitude
              : data.latitude
                ? Number(data.latitude)
                : null,

          longitude:
            typeof data.longitude === 'number'
              ? data.longitude
              : data.longitude
                ? Number(data.longitude)
                : null,

          address: data.address || '',

          google_maps_url: data.google_maps_url || '',

          seo_summary: data.seo_summary || '',

          seo_locality_focus:
            data.seo_locality_focus || '',

          locality_tags_text:
            (data.locality_tags || []).join(', '),

          nearby_landmark_tags_text:
            (data.nearby_landmark_tags || []).join(', '),

          faq_entries_text: (data.faq_entries || [])
            .map(
              (entry: {
                question: string;
                answer: string;
              }) =>
                `${entry.question} | ${entry.answer}`,
            )
            .join('\n'),

          related_blog_ids: normalizeNumericIds(
            data.related_blog_ids || [],
          ),

          related_homestay_ids:
            normalizeNumericIds(
              data.related_homestay_ids || [],
            ),
        });
      }
    } catch (error) { console.error('Error fetching homestay:', error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (homestay.calendar_sync_enabled && !homestay.airbnb_ical_url?.trim()) {
      toast.error('Airbnb iCal URL is required when calendar sync is enabled.');
      return;
    }

    setSubmitting(true);
    try {
      const useFormData = imageFiles.length > 0;
      if (useFormData) {
        const formData = new FormData();
        Object.entries(homestay).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (key === 'amenity_ids') {
            (value as number[]).forEach((amenityId) => formData.append('homestay[amenity_ids][]', String(amenityId)));
          } else if (key === 'related_blog_ids' || key === 'related_homestay_ids') {
            (value as number[]).forEach((relatedId) => formData.append(`homestay[${key}][]`, String(relatedId)));
          } else { formData.append(`homestay[${key}]`, String(value)); }
        });
        imageFiles.forEach((file) => formData.append('homestay[images][]', file));
        if (isEditing && id) await api.patch(`/homestays/${id}`, formData);
        else await api.post('/homestays', formData);
      } else {
        const payload = { homestay: { ...homestay, amenity_ids: homestay.amenity_ids } };
        if (isEditing && id) await api.patch(`/homestays/${id}`, payload);
        else await api.post('/homestays', payload);
      }
      navigate('/admin/homestays');
    } catch (error: any) {
      console.error('Error saving homestay:', error);
      toast.error(error.response?.data?.message || 'Failed to save homestay');
    } finally { setSubmitting(false); }
  };

  const handleRetrySync = async () => {
    if (!id) return;

    setSyncSubmitting(true);
    try {
      const response = await api.post(`/homestays/${id}/sync_calendar`);
      if (response.data.success) {
        if (response.data.data) {
          setHomestay((current) => ({
            ...current,
            ...response.data.data,
          }));
        }
        toast.success(response.data.message || 'Calendar sync started');
        await fetchHomestay();
      }
    } catch (error: any) {
      console.error('Error retrying calendar sync:', error);
      toast.error(error.response?.data?.message || 'Unable to retry calendar sync');
    } finally {
      setSyncSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(e.target.files || []));
  };

  const toggleAmenity = (amenityId: number) => {
    const numericId = Number(amenityId);
    setHomestay(prev => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(numericId)
        ? prev.amenity_ids.filter(id => id !== numericId)
        : [...prev.amenity_ids, numericId]
    }));
  };

  const toggleRelatedId = (
    field: 'related_blog_ids' | 'related_homestay_ids',
    itemId: number,
  ) => {
    // Fix: ensure itemId is always a number before comparing
    const numericItemId = Number(itemId);
    setHomestay((current) => ({
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
          {isEditing ? 'Edit Homestay' : 'New Homestay'}
        </h2>
        <Button variant="outline" onClick={() => navigate('/admin/homestays')}>
          <X className="h-4 w-4 mr-1.5" />Cancel
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Property Details + Location */}
          <Card className="border-border">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-base font-semibold">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={homestay.name}
                  onChange={(e) => setHomestay({ ...homestay, name: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={homestay.description}
                  onChange={(e) => setHomestay({ ...homestay, description: e.target.value })}
                  rows={5}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="seo_summary">SEO Summary</Label>
                <Textarea
                  id="seo_summary"
                  value={homestay.seo_summary}
                  onChange={(e) => setHomestay((prev) => ({ ...prev, seo_summary: e.target.value }))}
                  rows={3}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Optional short summary used for metadata and structured content alignment.
                </p>
              </div>
              <div>
                <Label htmlFor="seo_locality_focus">SEO Locality Focus</Label>
                <Input
                  id="seo_locality_focus"
                  value={homestay.seo_locality_focus}
                  onChange={(e) => setHomestay((prev) => ({ ...prev, seo_locality_focus: e.target.value }))}
                  placeholder="e.g. Assi Ghat or Kashi Vishwanath"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="locality_tags_text">Locality Tags</Label>
                <Textarea
                  id="locality_tags_text"
                  value={homestay.locality_tags_text}
                  onChange={(e) => setHomestay((prev) => ({ ...prev, locality_tags_text: e.target.value }))}
                  rows={2}
                  className="mt-1.5"
                  placeholder="Assi Ghat, Banaras, Old City"
                />
              </div>
              <div>
                <Label htmlFor="nearby_landmark_tags_text">Nearby Landmark Tags</Label>
                <Textarea
                  id="nearby_landmark_tags_text"
                  value={homestay.nearby_landmark_tags_text}
                  onChange={(e) => setHomestay((prev) => ({ ...prev, nearby_landmark_tags_text: e.target.value }))}
                  rows={2}
                  className="mt-1.5"
                  placeholder="Kashi Vishwanath Temple, Dashashwamedh Ghat"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={homestay.capacity}
                    onChange={(e) => setHomestay({ ...homestay, capacity: parseInt(e.target.value) || 0 })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="rooms">Rooms *</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    value={homestay.rooms}
                    onChange={(e) => setHomestay({ ...homestay, rooms: parseInt(e.target.value, 10) || 0 })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={homestay.size}
                    onChange={(e) => setHomestay({ ...homestay, size: e.target.value })}
                    placeholder="e.g. 500 sqft"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price_per_night">Price per Night (INR) *</Label>
                <Input
                  id="price_per_night"
                  type="number"
                  min="0"
                  step="0.01"
                  value={homestay.price_per_night ?? ""}
                  onChange={(e) =>
                    setHomestay({
                      ...homestay,
                      price_per_night:
                        e.target.value === "" ? null : parseFloat(e.target.value),
                    })
                  }
                  required
                  className="mt-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="pt-2 space-y-4">
                <div>
                  <Label htmlFor="address">Location – Address</Label>
                  <Input
                    id="address"
                    value={homestay.address || ''}
                    onChange={(e) =>
                      setHomestay((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="e.g. Assi Ghat, Varanasi, Uttar Pradesh"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="google_maps_url">Google Maps URL</Label>
                  <Input
                    id="google_maps_url"
                    type="url"
                    value={homestay.google_maps_url || ''}
                    onChange={(e) =>
                      setHomestay((prev) => ({
                        ...prev,
                        google_maps_url: e.target.value,
                      }))
                    }
                    placeholder="Paste a Google Maps link (optional)"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide either exact coordinates below or paste a Google Maps URL and we&apos;ll extract them automatically.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={homestay.latitude ?? ''}
                      onChange={(e) =>
                        setHomestay((prev) => ({
                          ...prev,
                          latitude: e.target.value === '' ? null : Number(e.target.value),
                        }))
                      }
                      placeholder="e.g. 25.317600"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={homestay.longitude ?? ''}
                      onChange={(e) =>
                        setHomestay((prev) => ({
                          ...prev,
                          longitude: e.target.value === '' ? null : Number(e.target.value),
                        }))
                      }
                      placeholder="e.g. 82.973900"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="is_active"
                  checked={homestay.is_active}
                  onCheckedChange={(checked) => setHomestay({ ...homestay, is_active: !!checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer text-sm">
                  Active (visible to public)
                </Label>
              </div>
            </CardContent>
          </Card>
          {/* Right Column */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader className="px-6 pt-6 pb-4"><CardTitle className="text-base font-semibold">Images</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground mb-3">Upload images for this homestay.</p>
                <input
                  type="file" accept="image/*" multiple onChange={handleImageChange}
                  className="block w-full text-sm text-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 file:cursor-pointer file:transition-colors"
                />
                {imageFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected {imageFiles.length} file{imageFiles.length > 1 ? 's' : ''}.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="px-6 pt-6 pb-4"><CardTitle className="text-base font-semibold">Amenities</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`amenity-${amenity.id}`}
                        checked={homestay.amenity_ids.includes(Number(amenity.id))}
                        onCheckedChange={() => toggleAmenity(amenity.id)}
                      />
                      <Label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer text-sm">{amenity.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-base font-semibold">Airbnb Calendar Sync</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="calendar_sync_enabled" className="text-sm font-medium">
                      Enable Calendar Sync
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste your Airbnb calendar URL to keep this property in sync with Airbnb bookings.
                    </p>
                  </div>
                  <Switch
                    id="calendar_sync_enabled"
                    checked={!!homestay.calendar_sync_enabled}
                    onCheckedChange={(checked) =>
                      setHomestay((prev) => ({
                        ...prev,
                        calendar_sync_enabled: !!checked,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="airbnb_ical_url">Airbnb iCal URL</Label>
                  <Input
                    id="airbnb_ical_url"
                    type="url"
                    value={homestay.airbnb_ical_url || ''}
                    onChange={(e) =>
                      setHomestay((prev) => ({
                        ...prev,
                        airbnb_ical_url: e.target.value,
                      }))
                    }
                    placeholder="https://www.airbnb.com/calendar/ical/your-listing.ics"
                    className="mt-1.5"
                    disabled={!homestay.calendar_sync_enabled}
                    required={!!homestay.calendar_sync_enabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the Airbnb calendar export (.ics) URL to keep this property synced with Airbnb bookings.
                  </p>
                </div>
                {(homestay.calendar_sync_enabled ||
                  homestay.last_calendar_sync_at ||
                  homestay.last_calendar_sync_success_at ||
                  typeof homestay.sync_error_count === 'number' ||
                  homestay.last_calendar_sync_error) && (
                  <div className="pt-3 border-t border-border/60 mt-2 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Sync status
                        </p>
                        {homestay.sync_state_label && (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                              {homestay.sync_state_label}
                            </span>
                          </div>
                        )}
                        {homestay.sync_state_message && (
                          <p className="mt-2 break-words text-xs text-muted-foreground">
                            {homestay.sync_state_message}
                          </p>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          disabled={syncSubmitting || homestay.sync_state === 'syncing'}
                          onClick={handleRetrySync}
                        >
                          {syncSubmitting ? 'Starting…' : 'Retry Sync'}
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {homestay.last_calendar_sync_at && (
                        <div>
                          <span className="font-medium text-foreground">Last sync attempt: </span>
                          <span>{new Date(homestay.last_calendar_sync_at).toLocaleString()}</span>
                        </div>
                      )}
                      {homestay.last_calendar_sync_success_at && (
                        <div>
                          <span className="font-medium text-foreground">Last successful sync: </span>
                          <span>{new Date(homestay.last_calendar_sync_success_at).toLocaleString()}</span>
                        </div>
                      )}
                      {typeof homestay.sync_error_count === 'number' && (
                        <div>
                          <span className="font-medium text-foreground">Sync error count: </span>
                          <span>{homestay.sync_error_count}</span>
                        </div>
                      )}
                      {homestay.last_calendar_sync_error && (
                        <div>
                          <span className="font-medium text-foreground">Last sync error: </span>
                          <span className="break-words">{homestay.last_calendar_sync_error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-base font-semibold">Related SEO Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div>
                  <Label htmlFor="faq_entries_text">FAQ Entries</Label>
                  <Textarea
                    id="faq_entries_text"
                    value={homestay.faq_entries_text}
                    onChange={(e) => setHomestay((prev) => ({ ...prev, faq_entries_text: e.target.value }))}
                    rows={5}
                    className="mt-1.5"
                    placeholder="Question | Answer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use one FAQ per line in the format <code>Question | Answer</code>.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Related Guides / Blogs</Label>
                  <div className="mt-3 space-y-2 rounded-xl border border-border p-4 max-h-56 overflow-y-auto">
                    {blogOptions.map((option) => (
                      <label key={option.id} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={homestay.related_blog_ids.includes(Number(option.id))}
                          onChange={() => toggleRelatedId('related_blog_ids', option.id)}
                        />
                        <span>{option.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Related Homestays</Label>
                  <div className="mt-3 space-y-2 rounded-xl border border-border p-4 max-h-56 overflow-y-auto">
                  {homestayOptions
                    .filter((option) => Number(option.id) !== Number(homestay.id))
                    .map((option) => (
                      <label key={option.id} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={homestay.related_homestay_ids.includes(Number(option.id))}
                          onChange={() => toggleRelatedId('related_homestay_ids', option.id)}
                        />
                        <span>{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/homestays')}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4 mr-1.5" />
            {submitting ? 'Saving...' : 'Save Homestay'}
          </Button>
        </div>
      </form>
    </div>
  );
}
