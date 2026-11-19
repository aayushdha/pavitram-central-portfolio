import { apiClient } from "./client";
import {
  Furnishing,
  ListingIntent,
  PaginationMeta,
  Possession,
  PriceUnit,
  Property,
  PropertyType,
} from "./domain-types";

export interface CreatePropertyInput {
  title: string;
  description?: string;
  type: PropertyType;
  intent: ListingIntent;
  city: string;
  locality: string;
  address?: string;
  lat?: number;
  lng?: number;
  price: number;
  priceUnit?: PriceUnit;
  bhk?: string;
  areaSqft: number;
  possession: Possession;
  furnishing: Furnishing;
  amenities?: string[];
  images?: string[];
}

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export interface QueryPropertiesInput {
  city?: string;
  locality?: string;
  type?: PropertyType;
  intent?: ListingIntent;
  bhk?: string;
  priceMin?: number;
  priceMax?: number;
  q?: string;
  page?: number;
  pageSize?: number;
}

function toQueryString(params: object): string {
  const qs = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const propertiesApi = {
  list: (query: QueryPropertiesInput = {}) =>
    apiClient.get<{ properties: Property[]; meta: PaginationMeta }>(
      `/properties${toQueryString(query)}`,
      { skipAuth: true },
    ),
  get: (id: string) => apiClient.get<{ property: Property }>(`/properties/${id}`, { skipAuth: true }),
  mine: () => apiClient.get<{ properties: Property[] }>("/properties/mine/list"),
  create: (input: CreatePropertyInput) =>
    apiClient.post<{ message: string; property: Property }>("/properties", input),
  update: (id: string, input: UpdatePropertyInput) =>
    apiClient.patch<{ message: string; property: Property }>(`/properties/${id}`, input),
  remove: (id: string) => apiClient.delete<{ message: string }>(`/properties/${id}`),
};
