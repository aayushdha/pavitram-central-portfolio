import { authedRequest } from "@/lib/api/config";
import { getToken } from "@/lib/auth/storage";
import type {
  ApiFaq,
  ApiOpportunity,
  ApiPage,
  ApiService,
  ApiStat,
  ApiTeamMember,
  ApiTestimonial,
} from "@/lib/api/types";
import type { AuthUser } from "@/lib/auth/types";

function authed<T>(path: string, init?: RequestInit) {
  return authedRequest<T>(path, init, getToken());
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type AdminDashboardStats = {
  users: { total: number; newLast30Days: number };
  community: { total: number; pending: number; approved: number };
  messages: { total: number; unread: number };
  content: {
    services: { total: number; published: number };
    opportunities: number;
    faqs: number;
    testimonials: number;
    teamMembers: number;
    media: number;
  };
  recent: { community: any[]; messages: any[]; users: any[] };
};

export const adminApi = {
  dashboard: () => authed<AdminDashboardStats>("/api/v1/admin/dashboard/stats"),

  // ---- Services -----------------------------------------------------------
  services: {
    list: () => authed<ApiService[]>("/api/v1/admin/services"),
    get: (id: string) => authed<ApiService>(`/api/v1/admin/services/${id}`),
    create: (data: Partial<ApiService>) =>
      authed<ApiService>("/api/v1/admin/services", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ApiService>) =>
      authed<ApiService>(`/api/v1/admin/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => authed(`/api/v1/admin/services/${id}`, { method: "DELETE" }),
    reorder: (items: { id: string; order: number }[]) =>
      authed("/api/v1/admin/services/reorder", { method: "PATCH", body: JSON.stringify({ items }) }),
  },

  // ---- Opportunities --------------------------------------------------------
  opportunities: {
    list: () => authed<ApiOpportunity[]>("/api/v1/admin/opportunities"),
    get: (id: string) => authed<ApiOpportunity>(`/api/v1/admin/opportunities/${id}`),
    create: (data: Partial<ApiOpportunity>) =>
      authed<ApiOpportunity>("/api/v1/admin/opportunities", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ApiOpportunity>) =>
      authed<ApiOpportunity>(`/api/v1/admin/opportunities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: string) => authed(`/api/v1/admin/opportunities/${id}`, { method: "DELETE" }),
  },

  // ---- FAQs -----------------------------------------------------------------
  faqs: {
    list: () => authed<ApiFaq[]>("/api/v1/admin/faqs"),
    create: (data: Partial<ApiFaq>) =>
      authed<ApiFaq>("/api/v1/admin/faqs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ApiFaq>) =>
      authed<ApiFaq>(`/api/v1/admin/faqs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => authed(`/api/v1/admin/faqs/${id}`, { method: "DELETE" }),
  },

  // ---- Testimonials -----------------------------------------------------------
  testimonials: {
    list: () => authed<ApiTestimonial[]>("/api/v1/admin/testimonials"),
    create: (data: Partial<ApiTestimonial>) =>
      authed<ApiTestimonial>("/api/v1/admin/testimonials", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ApiTestimonial>) =>
      authed<ApiTestimonial>(`/api/v1/admin/testimonials/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: string) => authed(`/api/v1/admin/testimonials/${id}`, { method: "DELETE" }),
  },

  // ---- Team -----------------------------------------------------------------
  team: {
    list: () => authed<ApiTeamMember[]>("/api/v1/admin/team"),
    create: (data: Partial<ApiTeamMember>) =>
      authed<ApiTeamMember>("/api/v1/admin/team", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ApiTeamMember>) =>
      authed<ApiTeamMember>(`/api/v1/admin/team/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => authed(`/api/v1/admin/team/${id}`, { method: "DELETE" }),
  },

  // ---- Stats -----------------------------------------------------------------
  stats: {
    list: () => authed<ApiStat[]>("/api/v1/admin/stats"),
    create: (data: Partial<ApiStat>) =>
      authed<ApiStat>("/api/v1/admin/stats", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ApiStat>) =>
      authed<ApiStat>(`/api/v1/admin/stats/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => authed(`/api/v1/admin/stats/${id}`, { method: "DELETE" }),
  },

  // ---- Pages / CMS Sections ---------------------------------------------------
  pages: {
    list: () => authed<any[]>("/api/v1/admin/pages"),
    get: (slug: string) => authed<any>(`/api/v1/admin/pages/${slug}`),
    upsertPage: (data: { slug: string; title: string; hindi?: string; subtitle?: string; metaDescription?: string }) =>
      authed<any>("/api/v1/admin/pages", { method: "PUT", body: JSON.stringify(data) }),
    upsertSection: (slug: string, data: Record<string, unknown>) =>
      authed<any>(`/api/v1/admin/pages/${slug}/sections`, { method: "PUT", body: JSON.stringify(data) }),
    deleteSection: (sectionId: string) =>
      authed(`/api/v1/admin/pages/sections/${sectionId}`, { method: "DELETE" }),
  },

  // ---- Settings -----------------------------------------------------------------
  settings: {
    list: () => authed<any[]>("/api/v1/admin/settings"),
    upsert: (data: { key: string; value: string; group?: string; label?: string; type?: string }) =>
      authed<any>("/api/v1/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
    bulkUpdate: (settings: { key: string; value: string; group?: string; label?: string; type?: string }[]) =>
      authed<any>("/api/v1/admin/settings/bulk", { method: "PUT", body: JSON.stringify({ settings }) }),
  },

  // ---- Community members (join requests) ----------------------------------
  community: {
    list: (params?: { page?: number; status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.status) q.set("status", params.status);
      if (params?.search) q.set("search", params.search);
      const qs = q.toString();
      return authed<any>(`/api/v1/admin/community-members${qs ? `?${qs}` : ""}`);
    },
    updateStatus: (id: string, status: string, notes?: string) =>
      authed<any>(`/api/v1/admin/community-members/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      }),
    remove: (id: string) => authed(`/api/v1/admin/community-members/${id}`, { method: "DELETE" }),
  },

  // ---- Contact messages -----------------------------------------------------
  messages: {
    list: (params?: { page?: number; status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.status) q.set("status", params.status);
      if (params?.search) q.set("search", params.search);
      const qs = q.toString();
      return authed<any>(`/api/v1/admin/contact-messages${qs ? `?${qs}` : ""}`);
    },
    updateStatus: (id: string, status: string) =>
      authed<any>(`/api/v1/admin/contact-messages/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    remove: (id: string) => authed(`/api/v1/admin/contact-messages/${id}`, { method: "DELETE" }),
  },

  // ---- Users -----------------------------------------------------------------
  users: {
    list: (params?: { page?: number; search?: string; role?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.search) q.set("search", params.search);
      if (params?.role) q.set("role", params.role);
      const qs = q.toString();
      return authed<{ data: AuthUser[]; meta: any }>(`/api/v1/admin/users${qs ? `?${qs}` : ""}`);
    },
    create: (data: { name: string; email: string; phone: string; password: string; role?: string }) =>
      authed<AuthUser>("/api/v1/admin/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<AuthUser>) =>
      authed<AuthUser>(`/api/v1/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => authed(`/api/v1/admin/users/${id}`, { method: "DELETE" }),
  },

  // ---- Media -----------------------------------------------------------------
  media: {
    list: () => authed<{ data: any[]; meta: any }>("/api/v1/admin/media"),
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return authed<any>("/api/v1/admin/media/upload", { method: "POST", body: form });
    },
    remove: (id: string) => authed(`/api/v1/admin/media/${id}`, { method: "DELETE" }),
  },
};

export type { ApiFaq, ApiOpportunity, ApiPage, ApiService, ApiStat, ApiTeamMember, ApiTestimonial };
