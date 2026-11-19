import { publicGet, publicPost } from "./config";
import type {
  ApiFaq,
  ApiOpportunity,
  ApiPage,
  ApiService,
  ApiSettingsMap,
  ApiStat,
  ApiTeamMember,
  ApiTestimonial,
} from "./types";

export function getServices() {
  return publicGet<ApiService[]>("/api/v1/services");
}

export function getService(slug: string) {
  return publicGet<ApiService>(`/api/v1/services/${slug}`);
}

export function getOpportunities() {
  return publicGet<ApiOpportunity[]>("/api/v1/opportunities");
}

export function getOpportunity(slug: string) {
  return publicGet<ApiOpportunity>(`/api/v1/opportunities/${slug}`);
}

export function getFaqs() {
  return publicGet<ApiFaq[]>("/api/v1/faqs");
}

export function getTestimonials() {
  return publicGet<ApiTestimonial[]>("/api/v1/testimonials");
}

export function getTeamMembers() {
  return publicGet<ApiTeamMember[]>("/api/v1/team");
}

export function getStats() {
  return publicGet<ApiStat[]>("/api/v1/stats");
}

export function getPage(slug: string) {
  return publicGet<ApiPage>(`/api/v1/pages/${slug}`);
}

export function getSettings() {
  return publicGet<ApiSettingsMap>("/api/v1/settings");
}

export function submitContactMessage(payload: {
  name: string;
  contact: string;
  subject: string;
  message: string;
}) {
  return publicPost<{ success: boolean; message: string }>("/api/v1/contact", payload);
}
