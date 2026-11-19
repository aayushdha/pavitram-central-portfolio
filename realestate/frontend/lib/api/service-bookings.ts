import { apiClient } from "./client";
import { ServiceBooking, ServiceBookingStatus } from "./domain-types";

export interface CreateServiceBookingInput {
  providerId: string;
  serviceName: string;
  scheduledAt: string;
  amount: number;
}

export const serviceBookingsApi = {
  create: (input: CreateServiceBookingInput) =>
    apiClient.post<{ message: string; booking: ServiceBooking }>("/service-bookings", input),
  mineAsCustomer: () =>
    apiClient.get<{ bookings: ServiceBooking[] }>("/service-bookings/mine/as-customer"),
  mineAsProvider: () =>
    apiClient.get<{ bookings: ServiceBooking[] }>("/service-bookings/mine/as-provider"),
  update: (id: string, status: ServiceBookingStatus) =>
    apiClient.patch<{ message: string; booking: ServiceBooking }>(`/service-bookings/${id}`, { status }),
};
