import { apiClient } from "./client";
import { Lead, LeadStage } from "./domain-types";

export interface CreateLeadInput {
  name: string;
  phone: string;
  propertyId?: string;
  notes?: string;
  intentScore?: number;
}

export interface UpdateLeadInput {
  name?: string;
  phone?: string;
  notes?: string;
  stage?: LeadStage;
  intentScore?: number;
}

export const leadsApi = {
  create: (input: CreateLeadInput) => apiClient.post<{ message: string; lead: Lead }>("/leads", input),
  mine: () => apiClient.get<{ leads: Lead[] }>("/leads/mine/list"),
  update: (id: string, input: UpdateLeadInput) =>
    apiClient.patch<{ message: string; lead: Lead }>(`/leads/${id}`, input),
  remove: (id: string) => apiClient.delete<{ message: string }>(`/leads/${id}`),
};
