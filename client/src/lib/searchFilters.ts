import type { Dayjs } from "dayjs";

export type SearchFilters = {
  checkIn: Dayjs | null;
  checkOut: Dayjs | null;
  guests: string;
  rooms: string;
};

export type SearchValidation = {
  canSearch: boolean;
  hasStarted: boolean;
  hasDateRangeError: boolean;
  hasIncompleteDateRange: boolean;
  helperText: string | null;
  invalidFields: {
    checkIn: boolean;
    checkOut: boolean;
  };
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  checkIn: null,
  checkOut: null,
  guests: "",
  rooms: "",
};

export const GUEST_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const ROOM_OPTIONS = ["1", "2", "3", "4", "5"];

export function formatSearchDate(date: Dayjs | null) {
  return date ? date.format("MMM D, YYYY") : "";
}

export function buildSearchValidation(
  filters: SearchFilters,
): SearchValidation {
  const hasStarted = Boolean(
    filters.checkIn || filters.checkOut || filters.guests || filters.rooms,
  );
  const hasIncompleteDateRange = Boolean(
    (filters.checkIn && !filters.checkOut) ||
      (!filters.checkIn && filters.checkOut),
  );

  const hasDateRangeError = Boolean(
    filters.checkIn &&
      filters.checkOut &&
      filters.checkOut.diff(filters.checkIn, "day") <= 0,
  );

  let helperText: string | null = null;

  if (hasDateRangeError) {
    helperText = "Check-out must be after check-in.";
  } else if (hasIncompleteDateRange) {
    helperText = "Select both check-in and check-out to filter by dates.";
  }

  return {
    canSearch: hasStarted && !hasDateRangeError,
    hasStarted,
    hasDateRangeError,
    hasIncompleteDateRange,
    helperText,
    invalidFields: {
      checkIn: hasDateRangeError || (!filters.checkIn && Boolean(filters.checkOut)),
      checkOut: hasDateRangeError || (Boolean(filters.checkIn) && !filters.checkOut),
    },
  };
}
