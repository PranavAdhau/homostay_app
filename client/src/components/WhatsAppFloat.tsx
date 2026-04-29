import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "./SiteSettingsProvider";

type WhatsAppFloatProps = {
  phoneNumber?: string;
  defaultMessage?: string;
};

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default function WhatsAppFloat({
  phoneNumber,
  defaultMessage = "Hello, I have a question about your homestay.",
}: WhatsAppFloatProps) {
  const { settings } = useSiteSettings();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  const rawNumber = phoneNumber || settings?.whatsapp_number || "";
  const normalized = normalizePhoneNumber(rawNumber);

  if (!normalized) return null;

  const encodedMessage = encodeURIComponent(defaultMessage);
  const href = `https://wa.me/${normalized}?text=${encodedMessage}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}

