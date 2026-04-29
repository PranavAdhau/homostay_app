import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { fetchAdminHostProfile, updateAdminHostProfile } from "../../lib/adminContent";
import type { HostProfile } from "../../lib/content";

export default function HostProfilePage() {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState<"host" | "co_host">("host");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminHostProfile();
        setProfile(data);
        if (data) {
          setName(data.host_name || "");
          setContact(data.host_contact || "");
          setBio(data.host_bio || "");
        }
      } catch (error) {
        console.error("Failed to load host profile", error);
        toast.error("Failed to load host profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (role === "host") {
      setName(profile.host_name || "");
      setContact(profile.host_contact || "");
      setBio(profile.host_bio || "");
    } else {
      setName(profile.co_host_name || "");
      setContact(profile.co_host_contact || "");
      setBio(profile.co_host_bio || "");
    }
  }, [role, profile]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    
    // Explicit frontend validation
    if (!name.trim()) return toast.error("Name is required");
    if (!contact.trim()) return toast.error("Contact is required");
    if (!bio.trim()) return toast.error("Bio is required");
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("host_profile[role]", role);
      formData.append("host_profile[name]", name);
      formData.append("host_profile[contact]", contact);
      formData.append("host_profile[bio]", bio);
      if (image) formData.append("host_profile[image]", image);

      const updated = await updateAdminHostProfile(formData);
      setProfile(updated);
      setImage(null);
      toast.success(`${role === "host" ? "Host" : "Co-Host"} profile updated`);
    } catch (error) {
      console.error("Failed to save host profile", error);
      toast.error("Failed to save host profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading host profile...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Host Profile</h2>
      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Manage Host Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "host" | "co_host")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="co_host">Co-Host</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : `Save ${role === "host" ? "Host" : "Co-Host"}`}
        </Button>
      </form>
    </div>
  );
}
