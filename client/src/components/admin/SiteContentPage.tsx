import { useEffect, useState } from "react";
import { HeartHandshake, ImagePlus, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { fetchAdminSiteContent, updateAdminSiteContent } from "../../lib/adminContent";
import type { SiteContent } from "../../lib/content";

export default function SiteContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<"documents" | "little_more" | "host_property" | "impact" | null>(null);
  const [houseRulesPdf, setHouseRulesPdf] = useState<File | null>(null);
  const [cancellationPdf, setCancellationPdf] = useState<File | null>(null);
  const [littleMoreImages, setLittleMoreImages] = useState<FileList | null>(null);
  const [hostPropertyImages, setHostPropertyImages] = useState<FileList | null>(null);
  const [impactMetrics, setImpactMetrics] = useState({
    donationPercentage: "",
    totalContributionAmount: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const fetchedContent = await fetchAdminSiteContent();
        setContent(fetchedContent);
        setImpactMetrics({
          donationPercentage: fetchedContent.donation_percentage?.toString() ?? "",
          totalContributionAmount: fetchedContent.total_contribution_amount?.toString() ?? "",
        });
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

  const saveImpactMetrics = async () => {
    setSavingSection("impact");
    try {
      const formData = new FormData();
      formData.append("site_content[donation_percentage]", impactMetrics.donationPercentage);
      formData.append("site_content[total_contribution_amount]", impactMetrics.totalContributionAmount);
      const updated = await updateAdminSiteContent(formData);
      setContent(updated);
      setImpactMetrics({
        donationPercentage: updated.donation_percentage?.toString() ?? "",
        totalContributionAmount: updated.total_contribution_amount?.toString() ?? "",
      });
      toast.success("Impact metrics updated");
    } catch (error) {
      console.error("Failed to save impact metrics", error);
      toast.error("Failed to save impact metrics");
    } finally {
      setSavingSection(null);
    }
  };

  if (loading || !content) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading site content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Site Content Management</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Keep trust-building content tidy and current. Each section below maps directly to an existing public-facing area.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Update downloadable guest policies without changing the public page layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="house_rules_pdf">House Rules (PDF)</Label>
                <Input id="house_rules_pdf" type="file" accept="application/pdf" onChange={(e) => setHouseRulesPdf(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellation_pdf">Cancellation Policy (PDF)</Label>
                <Input id="cancellation_pdf" type="file" accept="application/pdf" onChange={(e) => setCancellationPdf(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Files</p>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">House Rules</p>
                  {content.house_rules_pdf_url ? (
                    <a className="mt-1 inline-block text-[#1F8A84]" href={content.house_rules_pdf_url} target="_blank" rel="noreferrer">
                      View current file
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground">No file uploaded yet.</p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Cancellation Policy</p>
                  {content.cancellation_policy_pdf_url ? (
                    <a className="mt-1 inline-block text-[#1F8A84]" href={content.cancellation_policy_pdf_url} target="_blank" rel="noreferrer">
                      View current file
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground">No file uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button type="button" onClick={saveDocuments} disabled={savingSection === "documents"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "documents" ? "Saving..." : "Save Documents"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>A Little More Than Just a Stay</CardTitle>
          <CardDescription>
            Curate the trust-section collage and impact story shown on the public homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-foreground">
                <ImagePlus className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Gallery Uploads</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="little_more_images">Upload Images</Label>
                <p className="text-xs text-muted-foreground">Maximum 4 images allowed</p>
                <Input id="little_more_images" type="file" accept="image/*" multiple onChange={(e) => setLittleMoreImages(e.target.files)} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Preview</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {content.little_more_image_urls.map((url) => (
                  <img key={url} src={url} alt="Little more section" loading="lazy" className="h-24 w-full rounded-xl object-cover shadow-sm" />
                ))}
              </div>
            </div>
          </div>
          <Button type="button" onClick={saveLittleMore} disabled={savingSection === "little_more"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "little_more" ? "Saving..." : "Save Section"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Host Your Property</CardTitle>
          <CardDescription>
            Refresh the partner-facing visual used in the host-your-property section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Image Upload</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="host_property_images">Upload Images</Label>
                <p className="text-xs text-muted-foreground">Only 1 image allowed</p>
                <Input id="host_property_images" type="file" accept="image/*" multiple onChange={(e) => setHostPropertyImages(e.target.files)} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Preview</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {content.host_property_image_urls.map((url) => (
                  <img key={url} src={url} alt="Host your property section" loading="lazy" className="h-24 w-full rounded-xl object-cover shadow-sm" />
                ))}
              </div>
            </div>
          </div>
          <Button type="button" onClick={saveHostProperty} disabled={savingSection === "host_property"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "host_property" ? "Saving..." : "Save Section"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Impact Metrics</CardTitle>
          <CardDescription>
            Control the trust-building contribution numbers displayed in the public impact highlight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="donation_percentage">Donation Percentage (%)</Label>
                <Input
                  id="donation_percentage"
                  type="number"
                  min="0"
                  step="1"
                  value={impactMetrics.donationPercentage}
                  onChange={(event) =>
                    setImpactMetrics((current) => ({
                      ...current,
                      donationPercentage: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_contribution_amount">Total Contribution Amount (INR)</Label>
                <Input
                  id="total_contribution_amount"
                  type="number"
                  min="0"
                  step="1"
                  value={impactMetrics.totalContributionAmount}
                  onChange={(event) =>
                    setImpactMetrics((current) => ({
                      ...current,
                      totalContributionAmount: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-foreground">
                <HeartHandshake className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Public Section Preview</p>
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-foreground">
                  We&apos;ve contributed over <span className="font-semibold text-primary">{impactMetrics.totalContributionAmount || "0"}</span> INR towards community initiatives.
                </p>
                <p className="text-sm text-muted-foreground">
                  Approximately <span className="font-semibold text-foreground">{impactMetrics.donationPercentage || "0"}%</span> of revenue goes back into positive local impact.
                </p>
              </div>
            </div>
          </div>
          <Button type="button" onClick={saveImpactMetrics} disabled={savingSection === "impact"}>
            <Save className="mr-2 h-4 w-4" />
            {savingSection === "impact" ? "Saving..." : "Save Impact Metrics"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
