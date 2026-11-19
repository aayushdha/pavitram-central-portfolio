import { apiClient } from "./client";
import { ServiceCategory, ServiceProvider } from "./domain-types";

export interface UpsertProviderProfileInput {
  displayName: string;
  category: ServiceCategory;
  specialty?: string;
  city: string;
  priceFrom?: string;
}

export const providersApi = {
  list: (query: { category?: ServiceCategory; city?: string } = {}) => {
    const qs = new URLSearchParams();
    if (query.category) qs.set("category", query.category);
    if (query.city) qs.set("city", query.city);
    const s = qs.toString();
    return apiClient.get<{ providers: ServiceProvider[] }>(`/providers${s ? `?${s}` : ""}`, {
      skipAuth: true,
    });
  },
  get: (id: string) => apiClient.get<{ provider: ServiceProvider }>(`/providers/${id}`, { skipAuth: true }),
  mine: () => apiClient.get<{ profile: ServiceProvider | null }>("/providers/mine/profile"),
  upsertMine: (input: UpsertProviderProfileInput) =>
    apiClient.put<{ message: string; profile: ServiceProvider }>("/providers/mine/profile", input),
};
