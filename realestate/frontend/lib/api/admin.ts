import { apiClient } from "./client";
import {
  AdminOverview,
  KycDocument,
  LocalUser,
  ModerationStatus,
  Project,
  Property,
} from "./domain-types";

export const adminApi = {
  overview: () => apiClient.get<{ overview: AdminOverview }>("/admin/overview"),

  pendingProperties: () => apiClient.get<{ properties: Property[] }>("/admin/properties/pending"),
  moderateProperty: (id: string, status: ModerationStatus, remarks?: string) =>
    apiClient.patch<{ message: string; property: Property }>(`/admin/properties/${id}/moderate`, {
      status,
      remarks,
    }),

  pendingProjects: () => apiClient.get<{ projects: Project[] }>("/admin/projects/pending"),
  moderateProject: (id: string, status: ModerationStatus, remarks?: string) =>
    apiClient.patch<{ message: string; project: Project }>(`/admin/projects/${id}/moderate`, {
      status,
      remarks,
    }),

  pendingKyc: () => apiClient.get<{ documents: KycDocument[] }>("/admin/kyc/pending"),
  reviewKyc: (documentId: string, status: "VERIFIED" | "ON_HOLD" | "REJECTED", remarks?: string) =>
    apiClient.patch<{ message: string; document: KycDocument }>(`/admin/kyc/${documentId}/review`, {
      status,
      remarks,
    }),

  users: () => apiClient.get<{ users: LocalUser[] }>("/admin/users"),
  activateUser: (id: string) =>
    apiClient.patch<{ message: string; user: LocalUser }>(`/admin/users/${id}/activate`),
  deactivateUser: (id: string) =>
    apiClient.patch<{ message: string; user: LocalUser }>(`/admin/users/${id}/deactivate`),
};
