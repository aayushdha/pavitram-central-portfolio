import { apiClient } from "./client";
import { LocalUser, OwnerType, RealRole } from "../auth/types";

/**
 * `GET /users/me` — this is also the call that makes our OWN backend
 * find-or-create the local `RealUser` shadow row for whoever the bearer
 * token belongs to (see `CentralAuthGuard`). In other words: the very first
 * authenticated call this app makes after a signup/signin IS the
 * "registration" of that identity into this real-estate module, with the
 * default `SEEKER` role.
 */
export function getMe(): Promise<{ user: LocalUser }> {
  return apiClient.get<{ user: LocalUser }>("/users/me");
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  profession?: string;
  designation?: string;
  organization?: string;
  bio?: string;
  ownerType?: OwnerType;
  businessName?: string;
  reraNumber?: string;
}

export function updateProfile(input: UpdateProfileInput): Promise<{ message: string; user: LocalUser }> {
  return apiClient.patch<{ message: string; user: LocalUser }>("/users/me", input);
}

/**
 * Adds role(s) to the current account (merges — never removes). Used right
 * after registration when someone signs up as "Owner / Agent / Builder" or
 * "Service Provider" instead of the default Property Seeker, and any time
 * later when a seeker decides to also start listing a property.
 */
export function addRoles(roles: RealRole[]): Promise<{ message: string; user: LocalUser }> {
  return apiClient.patch<{ message: string; user: LocalUser }>("/users/me/roles", { roles });
}

export interface KycDocumentRecord {
  id: string;
  userId: string;
  docType: string;
  docUrl: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export function getMyKycDocuments(): Promise<{ documents: KycDocumentRecord[] }> {
  return apiClient.get<{ documents: KycDocumentRecord[] }>("/users/me/kyc-documents");
}

export function submitKycDocument(docType: string, docUrl: string): Promise<{ message: string; document: KycDocumentRecord }> {
  return apiClient.post<{ message: string; document: KycDocumentRecord }>("/users/me/kyc-documents", {
    docType,
    docUrl,
  });
}
