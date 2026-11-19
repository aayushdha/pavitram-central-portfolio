import { apiClient } from "./client";
import { SavedSearch } from "./domain-types";

export interface CreateSavedSearchInput {
  name: string;
  filters: Record<string, unknown>;
  alertsEnabled?: boolean;
}

export const savedSearchesApi = {
  list: () => apiClient.get<{ savedSearches: SavedSearch[] }>("/saved-searches"),
  create: (input: CreateSavedSearchInput) =>
    apiClient.post<{ message: string; savedSearch: SavedSearch }>("/saved-searches", input),
  remove: (id: string) => apiClient.delete<{ message: string }>(`/saved-searches/${id}`),
};
