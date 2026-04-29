import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { fetchAdminSiteContent, updateAdminSiteContent } from "../../lib/adminContent";
import type { SiteContent } from "../../lib/content";

export default function SiteContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<"documents" | "little_more" | "host_property" | null>(null);
  const [houseRulesPdf, setHouseRulesPdf] = useState<File | null>(null);
  const [cancellationPdf, setCancellationPdf] = useState<File | null>(null);
  const [littleMoreImages, setLittleMoreImages] = useState<FileList | null>(null);
  const [hostPropertyImages, setHostPropertyImages] = useState<FileList | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setContent(await fetchAdminSiteContent());
      } catch (error) {
        console.error("Failed to load site content", error);
        toast.error("Failed to load site content");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveDocuments = async () => {
    setSavingSection("documents");
    try {
      const formData = new FormData();
      if (houseRulesPdf) formData.append("site_content[house_rules_pdf]", houseRulesPdf);
      if (cancellationPdf) formData.append("site_content[cancellation_policy_pdf]", cancellationPdf);
      const updated = await updateAdminSiteContent(formData);
      setContent(updated);
      setHouseRulesPdf(null);
      setCancellationPdf(null);
      toast.success("Documents updated");
    } catch (error) {
      console.error("Failed to save documents", error);
      toast.error("Failed to save documents");
    } finally {
      setSavingSection(null);
    }
  };

  const saveLittleMore = async () => {
    if (littleMoreImages && littleMoreImages.length > 4) {
      return toast.error("Maximum 4 images allowed");
    }

    setSavingSection("little_more");
    try {
      const formData = new FormData();
      Array.from(littleMoreImages ?? []).forEach((file) => {
        formData.append("site_content[little_more_images][]", file);
      });
      const updated = await updateAdminSiteContent(formData);
      setContent(updated);
      setLittleMoreImages(null);
      toast.success("Little More section updated");
    } catch (error) {
      console.error("Failed to save section", error);
      toast.error("Failed to save section");
    } finally {
      setSavingSection(null);
    }
  };

  const saveHostProperty = async () => {
    if (hostPropertyImages && hostPropertyImages.length > 1) {
      return toast.error("Only 1 image allowed");
    }

    setSavingSection("host_property");
    try {
      const formData = new FormData();
      Array.from(hostPropertyImages ?? []).forEach((file) => {
        formData.append("site_content[host_property_images][]", file);
      });
      const updated = await updateAdminSiteContent(formData);
      setContent(updated);
      setHostPropertyImages(null);
      toast.success("Host Your Property section updated");
    } catch (error) {
      console.error("Failed to save section", error);
      toast.error("Failed to save section");
    } finally {
      setSavingSection(null);
    }
  };

  if (loading || !content) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading site content...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Site Content Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="house_rules_pdf">House Rules (PDF)</Label>
            <Input id="house_rules_pdf" type="file" accept="application/pdf" onChange={(e) => setHouseRulesPdf(e.target.files?.[0] ?? null)} />
            {content.house_rules_pdf_url ? <a className="text-sm text-[#1F8A84] block mt-1" href={content.house_rules_pdf_url} target="_blank" rel="noreferrer">Current file</a> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancellation_pdf">Cancellation Policy (PDF)</Label>
            <Input id="cancellation_pdf" type="file" accept="application/pdf" onChange={(e) => setCancellationPdf(e.target.files?.[0] ?? null)} />
            {content.cancellation_policy_pdf_url ? <a className="text-sm text-[#1F8A84] block mt-1" href={content.cancellation_policy_pdf_url} target="_blank" rel="noreferrer">Current file</a> : null}
          </div>
          <Button type="button" onClick={saveDocuments} disabled={savingSection === "documents"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "documents" ? "Saving..." : "Save Documents"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A Little More Than Just a Stay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="little_more_images">Upload Images</Label>
            <p className="text-xs text-muted-foreground">Maximum 4 images allowed</p>
            <Input id="little_more_images" type="file" accept="image/*" multiple onChange={(e) => setLittleMoreImages(e.target.files)} />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {content.little_more_image_urls.map((url) => (
              <img key={url} src={url} alt="Little more section" loading="lazy" className="h-24 w-full rounded-md object-cover" />
            ))}
          </div>
          <Button type="button" onClick={saveLittleMore} disabled={savingSection === "little_more"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "little_more" ? "Saving..." : "Save Section"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Host Your Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host_property_images">Upload Images</Label>
            <p className="text-xs text-muted-foreground">Only 1 image allowed</p>
            <Input id="host_property_images" type="file" accept="image/*" multiple onChange={(e) => setHostPropertyImages(e.target.files)} />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {content.host_property_image_urls.map((url) => (
              <img key={url} src={url} alt="Host your property section" loading="lazy" className="h-24 w-full rounded-md object-cover" />
            ))}
          </div>
          <Button type="button" onClick={saveHostProperty} disabled={savingSection === "host_property"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "host_property" ? "Saving..." : "Save Section"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
