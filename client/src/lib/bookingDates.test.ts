import { describe, expect, it } from "vitest";
import {
  getValidCheckoutDates,
  getCheckInDisabledDates,
  getCheckoutDisabledDates,
  isValidCheckout,
} from "./bookingDates";

const range = (start: string, end: string) => {
  const dates: string[] = [];
  let current = new Date(start + "T12:00:00");
  const last = new Date(end + "T12:00:00");
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

describe("getValidCheckoutDates", () => {
  it("allows only checkout 14 when check-in 13 and blocked nights 14-16", () => {
    const unavailable = ["2026-06-14", "2026-06-15", "2026-06-16"];
    expect(getValidCheckoutDates("2026-06-13", unavailable, "2026-06-20")).toEqual([
      "2026-06-14",
    ]);
  });

  it("allows checkouts 14-18 when free 13-17 and blocked from 18", () => {
    const unavailable = [
      "2026-06-18",
      "2026-06-19",
      "2026-06-20",
    ];
    expect(getValidCheckoutDates("2026-06-13", unavailable, "2026-06-25")).toEqual([
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
    ]);
  });

  it("allows one-night stay 13 to 14 when night 14 is blocked", () => {
    const unavailable = ["2026-06-14"];
    expect(getValidCheckoutDates("2026-06-13", unavailable, "2026-06-20")).toEqual([
      "2026-06-14",
    ]);
  });

  it("allows gap-night booking 13 to 14 between blocks", () => {
    const unavailable = [
      "2026-06-10",
      "2026-06-11",
      "2026-06-12",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
    ];
    expect(getValidCheckoutDates("2026-06-13", unavailable, "2026-06-20")).toEqual([
      "2026-06-14",
    ]);
  });
});

describe("isValidCheckout", () => {
  it("rejects checkout 19 when blocked inventory starts on 18", () => {
    const unavailable = ["2026-06-18", "2026-06-19", "2026-06-20"];
    expect(isValidCheckout("2026-06-13", "2026-06-19", unavailable)).toBe(false);
    expect(isValidCheckout("2026-06-13", "2026-06-18", unavailable)).toBe(true);
  });
});

describe("getCheckInDisabledDates", () => {
  it("disables unavailable nights and check-ins with no valid checkout", () => {
    const unavailable = [
      "2026-06-10",
      "2026-06-11",
      "2026-06-12",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
    ];
    const allDates = range("2026-06-10", "2026-06-16");
    const disabled = getCheckInDisabledDates(unavailable, "2026-06-20", allDates);
    expect(disabled).toContain("2026-06-10");
    expect(disabled).not.toContain("2026-06-13");
    expect(disabled).toContain("2026-06-14");
  });
});

describe("getCheckoutDisabledDates", () => {
  it("disables invalid checkout dates after check-in is selected", () => {
    const unavailable = ["2026-06-14", "2026-06-15", "2026-06-16"];
    const allDates = range("2026-06-13", "2026-06-20");
    const disabled = getCheckoutDisabledDates(
      "2026-06-13",
      unavailable,
      "2026-06-20",
      allDates,
    );
    expect(disabled).not.toContain("2026-06-14");
    expect(disabled).toContain("2026-06-15");
    expect(disabled).toContain("2026-06-18");
  });
});
