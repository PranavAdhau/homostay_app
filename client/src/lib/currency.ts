export function formatINR(amount: number) {
  const hasFraction = !Number.isInteger(amount);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount);
}

export function formatNightlyRate(amount: number) {
  return `${formatINR(amount)} / night`;
}
