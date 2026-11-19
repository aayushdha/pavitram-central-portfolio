import { apiClient } from "./client";
import { WishlistItem } from "./domain-types";

export const wishlistApi = {
  list: () => apiClient.get<{ items: WishlistItem[] }>("/wishlist"),
  add: (propertyId: string) =>
    apiClient.post<{ message: string; item: WishlistItem }>(`/wishlist/${propertyId}`),
  remove: (propertyId: string) => apiClient.delete<{ message: string }>(`/wishlist/${propertyId}`),
};
