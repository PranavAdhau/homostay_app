import { useMemo } from "react";
import { useSiteSettings } from "../components/SiteSettingsProvider";

export const FALLBACK_WHATSAPP_NUMBER = "9743340477";
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello, I would like to list my property on your platform. Please share more details about onboarding and hosting.";

const warnedMessages = new Set<string>();

function warnOnce(message: string) {
  if (warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  console.warn(message);
}

export function normalizeWhatsAppNumber(rawPhone?: string | null) {
  if (!rawPhone) {
    return null;
  }

  const trimmed = rawPhone.trim();

  if (!trimmed || /[^\d+\s().-]/.test(trimmed) || /[a-z]/i.test(trimmed)) {
    return null;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");

  if (!digitsOnly || !/^\d+$/.test(digitsOnly) || digitsOnly.length < 10) {
    return null;
  }

  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }

  return digitsOnly;
}

export function buildWhatsAppUrl(phoneNumber?: string | null, message?: string) {
  const fallbackNormalized =
    normalizeWhatsAppNumber(FALLBACK_WHATSAPP_NUMBER) ?? "919743340477";
  const normalizedPhone = normalizeWhatsAppNumber(phoneNumber) ?? fallbackNormalized;
  const safeMessage = message?.trim() || DEFAULT_WHATSAPP_MESSAGE;

  return {
    phone: normalizedPhone,
    href: `https://api.whatsapp.com/send/?phone=${normalizedPhone}&text=${encodeURIComponent(
      safeMessage,
    )}`,
    message: safeMessage,
  };
}

export function useResolvedWhatsAppLink(message?: string) {
  const { settings, loading } = useSiteSettings();
  const settingsPhone = settings?.whatsapp_number;

  return useMemo(() => {
    if (loading) {
      return buildWhatsAppUrl(FALLBACK_WHATSAPP_NUMBER, message);
    }

    const normalizedSettingsPhone = normalizeWhatsAppNumber(settingsPhone);

    if (!normalizedSettingsPhone) {
      warnOnce(
        "[WhatsAppResolver] Missing or invalid site settings WhatsApp number. Falling back to default.",
      );
    }

    return buildWhatsAppUrl(settingsPhone, message);
  }, [loading, message, settingsPhone]);
}
