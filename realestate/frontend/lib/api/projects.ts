import { apiClient } from "./client";
import { PaginationMeta, Project, ProjectStatus, ProjectType, ProjectUnit } from "./domain-types";

export interface CreateProjectInput {
  name: string;
  city: string;
  locality: string;
  type: ProjectType;
  priceFrom: number;
  priceTo: number;
  configurations?: string[];
  areaFrom: number;
  areaTo: number;
  possessionLabel: string;
  status: ProjectStatus;
  rera?: string;
  reraVerified?: boolean;
  totalUnits?: number;
  towers?: number;
  amenities?: string[];
  connectivity?: string[];
  images?: string[];
  description?: string;
  units?: ProjectUnit[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface QueryProjectsInput {
  city?: string;
  locality?: string;
  type?: ProjectType;
  status?: ProjectStatus;
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

export const projectsApi = {
  list: (query: QueryProjectsInput = {}) =>
    apiClient.get<{ projects: Project[]; meta: PaginationMeta }>(`/projects${toQueryString(query)}`, {
      skipAuth: true,
    }),
  get: (id: string) => apiClient.get<{ project: Project }>(`/projects/${id}`, { skipAuth: true }),
  mine: () => apiClient.get<{ projects: Project[] }>("/projects/mine/list"),
  create: (input: CreateProjectInput) =>
    apiClient.post<{ message: string; project: Project }>("/projects", input),
  update: (id: string, input: UpdateProjectInput) =>
    apiClient.patch<{ message: string; project: Project }>(`/projects/${id}`, input),
  remove: (id: string) => apiClient.delete<{ message: string }>(`/projects/${id}`),
};
