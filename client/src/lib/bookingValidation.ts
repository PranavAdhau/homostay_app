export type BookingContactField = "guestEmail" | "guestPhone";

export type BookingContactErrors = Partial<Record<BookingContactField, string>>;

const EMAIL_MAX_LENGTH = 254;
const PHONE_ALLOWED_FORMAT = /^[+\d\s()-]+$/;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

export function validateBookingContactFields(input: {
  guestEmail: string;
  guestPhone: string;
}): BookingContactErrors {
  const errors: BookingContactErrors = {};
  const email = input.guestEmail.trim();
  const phone = input.guestPhone.trim();

  if (!email) {
    errors.guestEmail = "Email is required.";
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.guestEmail = "Email is too long.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.guestEmail = "Enter a valid email address.";
  }

  if (!phone) {
    errors.guestPhone = "Phone number is required.";
  } else if (!PHONE_ALLOWED_FORMAT.test(phone)) {
    errors.guestPhone = "Enter a valid phone number.";
  } else {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS || new Set(digits).size === 1) {
      errors.guestPhone = "Enter a valid phone number.";
    }
  }

  return errors;
}

export function clearBookingContactError(
  errors: BookingContactErrors,
  field: BookingContactField,
): BookingContactErrors {
  if (!errors[field]) {
    return errors;
  }

  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}
