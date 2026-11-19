import { apiClient } from "./client";
import { SiteVisit, SiteVisitStatus } from "./domain-types";

export interface CreateSiteVisitInput {
  propertyId?: string;
  projectId?: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateSiteVisitInput {
  scheduledAt?: string;
  status?: SiteVisitStatus;
  notes?: string;
}

export const siteVisitsApi = {
  create: (input: CreateSiteVisitInput) =>
    apiClient.post<{ message: string; siteVisit: SiteVisit }>("/site-visits", input),
  mineAsSeeker: () => apiClient.get<{ siteVisits: SiteVisit[] }>("/site-visits/mine/as-seeker"),
  mineAsHost: () => apiClient.get<{ siteVisits: SiteVisit[] }>("/site-visits/mine/as-host"),
  update: (id: string, input: UpdateSiteVisitInput) =>
    apiClient.patch<{ message: string; siteVisit: SiteVisit }>(`/site-visits/${id}`, input),
};
