import dayjs from "dayjs";

function toUnavailableSet(unavailableDates: string[]): Set<string> {
  return new Set(unavailableDates);
}

function addDays(dateStr: string, days: number): string {
  return dayjs(dateStr).add(days, "day").format("YYYY-MM-DD");
}

function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = dayjs(start);
  const last = dayjs(end);
  while (current.isBefore(last) || current.isSame(last, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
}

function stayNightsOverlap(
  checkIn: string,
  checkOut: string,
  unavailable: Set<string>,
): boolean {
  let night = dayjs(checkIn);
  const checkout = dayjs(checkOut);
  while (night.isBefore(checkout, "day")) {
    if (unavailable.has(night.format("YYYY-MM-DD"))) {
      return true;
    }
    night = night.add(1, "day");
  }
  return false;
}

export function getValidCheckoutDates(
  checkIn: string,
  unavailableDates: string[],
  rangeEnd: string,
): string[] {
  const unavailable = toUnavailableSet(unavailableDates);
  const valid: string[] = [];
  let checkout = addDays(checkIn, 1);
  const end = dayjs(rangeEnd);

  while (dayjs(checkout).isBefore(end) || dayjs(checkout).isSame(end, "day")) {
    if (stayNightsOverlap(checkIn, checkout, unavailable)) {
      break;
    }
    valid.push(checkout);
    checkout = addDays(checkout, 1);
  }

  return valid;
}

export function isValidCheckout(
  checkIn: string,
  checkOut: string,
  unavailableDates: string[],
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return false;
  }
  return !stayNightsOverlap(checkIn, checkOut, toUnavailableSet(unavailableDates));
}

export function getCheckInDisabledDates(
  unavailableDates: string[],
  rangeEnd: string,
  candidateDates: string[],
): string[] {
  const unavailable = toUnavailableSet(unavailableDates);
  return candidateDates.filter((date) => {
    if (unavailable.has(date)) {
      return true;
    }
    return getValidCheckoutDates(date, unavailableDates, rangeEnd).length === 0;
  });
}

export function getCheckoutDisabledDates(
  checkIn: string,
  unavailableDates: string[],
  rangeEnd: string,
  candidateDates: string[],
): string[] {
  const validCheckouts = new Set(
    getValidCheckoutDates(checkIn, unavailableDates, rangeEnd),
  );
  const minCheckout = addDays(checkIn, 1);

  return candidateDates.filter((date) => {
    if (date < minCheckout || date > rangeEnd) {
      return true;
    }
    if (date === checkIn) {
      return true;
    }
    return !validCheckouts.has(date);
  });
}

export function enumerateDateRange(start: string, end: string): string[] {
  return enumerateDates(start, end);
}
