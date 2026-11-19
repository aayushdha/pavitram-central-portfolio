import { Property } from "./domain-types";

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPropertyPrice(p: Pick<Property, "price" | "priceUnit">): string {
  const base = formatINR(p.price);
  return p.priceUnit === "MONTH" ? `${base}/mo` : base;
}
