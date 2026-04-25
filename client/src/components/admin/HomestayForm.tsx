import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import api from '../../lib/adminAxios';
interface Amenity {
  id: number;
  name: string;
  icon_name?: string;
}
interface Homestay {
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
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  google_maps_url?: string;
}
export default function HomestayForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [homestay, setHomestay] = useState<Homestay>({
    rooms: 1,
    price_per_night: null,
    is_active: true, amenity_ids: [],
    airbnb_ical_url: '',
    calendar_sync_enabled: false,
  });
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  useEffect(() => {
    fetchAmenities();
    if (isEditing && id) fetchHomestay();
  }, [id, isEditing]);
  const fetchAmenities = async () => {
    try {
      const response = await api.get('/amenities');
      if (response.data.success) setAmenities(response.data.data);
    } catch (error) { console.error('Error fetching amenities:', error); }
  };
  const fetchHomestay = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/homestays/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setHomestay({
          name: data.name, description: data.description,
          capacity: data.capacity, rooms: data.rooms ?? 1, size: data.size || '',
          price_per_night: data.price_per_night,
          is_active: data.is_active,
          amenity_ids: data.amenities.map((a: Amenity) => a.id),
          airbnb_ical_url: data.airbnb_ical_url || '',
          calendar_sync_enabled: !!data.calendar_sync_enabled,
          last_calendar_sync_at: data.last_calendar_sync_at,
          last_calendar_sync_success_at: data.last_calendar_sync_success_at,
          sync_error_count: data.sync_error_count,
          last_calendar_sync_error: data.last_calendar_sync_error,
          latitude: typeof data.latitude === 'number' ? data.latitude : data.latitude ? Number(data.latitude) : null,
          longitude: typeof data.longitude === 'number' ? data.longitude : data.longitude ? Number(data.longitude) : null,
          address: data.address || '',
        });
      }
    } catch (error) { console.error('Error fetching homestay:', error); }
    finally { setLoading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (homestay.calendar_sync_enabled && !homestay.airbnb_ical_url?.trim()) {
      alert('Airbnb iCal URL is required when calendar sync is enabled.');
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
      alert(error.response?.data?.message || 'Failed to save homestay');
    } finally { setSubmitting(false); }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(e.target.files || []));
  };
  const toggleAmenity = (amenityId: number) => {
    setHomestay(prev => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(amenityId)
        ? prev.amenity_ids.filter(id => id !== amenityId)
        : [...prev.amenity_ids, amenityId]
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
                <textarea
                  id="description"
                  value={homestay.description}
                  onChange={(e) => setHomestay({ ...homestay, description: e.target.value })}
                  rows={5}
                  className="mt-1.5 w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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
                        checked={homestay.amenity_ids.includes(amenity.id)}
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
                {(homestay.last_calendar_sync_at ||
                  homestay.last_calendar_sync_success_at ||
                  typeof homestay.sync_error_count === 'number' ||
                  homestay.last_calendar_sync_error) && (
                  <div className="pt-1 border-t border-border/60 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Sync status (read-only)
                    </p>
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
