import { Property, properties } from "./mock-data";

export type SearchFilters = {
  intent?: string;
  q?: string;
  type?: string;
  budget?: string;
  possession?: string;
  furnishing?: string;
  bhk?: string;
  sort?: string;
};

export function filterProperties(filters: SearchFilters): Property[] {
  let result = [...properties];

  if (filters.intent) {
    result = result.filter((p) => p.intent === filters.intent);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.city.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
    );
  }
  if (filters.type) {
    const types = filters.type.split(",");
    result = result.filter((p) => types.includes(p.type));
  }
  if (filters.budget) {
    const [min, max] = filters.budget.split("-").map(Number);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      result = result.filter((p) => p.price >= min && p.price <= max);
    }
  }
  if (filters.possession) {
    result = result.filter((p) => p.possession === filters.possession);
  }
  if (filters.furnishing) {
    result = result.filter((p) => p.furnishing === filters.furnishing);
  }
  if (filters.bhk) {
    result = result.filter((p) => p.bhk === filters.bhk);
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
      break;
    default:
      result.sort((a, b) => b.shortlists - a.shortlists);
  }

  return result;
}
