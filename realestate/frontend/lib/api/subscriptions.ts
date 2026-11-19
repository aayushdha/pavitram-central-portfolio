import { apiClient } from "./client";
import { Subscription, SubscriptionPlanCode } from "./domain-types";

export const subscriptionsApi = {
  mine: () => apiClient.get<{ subscriptions: Subscription[] }>("/subscriptions/mine"),
  subscribe: (planCode: SubscriptionPlanCode) =>
    apiClient.post<{ message: string; subscription: Subscription }>("/subscriptions", { planCode }),
};
