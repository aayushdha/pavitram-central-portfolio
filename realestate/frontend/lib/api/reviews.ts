import { apiClient } from "./client";
import { Review, ReviewTargetType } from "./domain-types";

export interface CreateReviewInput {
  targetType: ReviewTargetType;
  propertyId?: string;
  projectId?: string;
  providerId?: string;
  rating: number;
  text?: string;
}

export const reviewsApi = {
  create: (input: CreateReviewInput) =>
    apiClient.post<{ message: string; review: Review }>("/reviews", input),
  forTarget: (targetType: Lowercase<ReviewTargetType> | ReviewTargetType, targetId: string) =>
    apiClient.get<{ reviews: Review[] }>(`/reviews/${targetType}/${targetId}`, { skipAuth: true }),
};
