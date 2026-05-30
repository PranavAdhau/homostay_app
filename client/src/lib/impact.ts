export function formatImpactAmount(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) {
    return "₹0";
  }

  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
  }

  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)} L`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getImpactDisplayNumber(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) {
    return { value: 0, suffix: "", decimals: 0 };
  }

  if (amount >= 10_000_000) {
    return { value: amount / 10_000_000, suffix: " Cr", decimals: 1 };
  }

  if (amount >= 100_000) {
    return { value: amount / 100_000, suffix: " L", decimals: 1 };
  }

  return { value: amount, suffix: "", decimals: 0 };
}
