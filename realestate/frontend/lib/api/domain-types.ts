/**
 * Entity + enum types mirroring `backend/prisma/schema.prisma` field-for-field.
 * Keeping these separate from `lib/auth/types.ts` (which only has the
 * identity-related types) so every dashboard page has one place to import
 * real-estate domain types from.
 */
import { LocalUser } from "../auth/types";

export type PropertyType = "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "PG_COLIVING";
export type ListingIntent = "BUY" | "RENT" | "PG";
export type PriceUnit = "TOTAL" | "MONTH";
export type Possession = "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
export type Furnishing = "UNFURNISHED" | "SEMI_FURNISHED" | "FURNISHED";
export type ModerationStatus = "PENDING_REVIEW" | "APPROVED" | "FLAGGED" | "REJECTED";
export type ProjectType = "RESIDENTIAL" | "COMMERCIAL" | "MIXED_USE";
export type ProjectStatus = "NEW_LAUNCH" | "UNDER_CONSTRUCTION" | "READY_TO_MOVE";
export type LeadStage = "NEW" | "CONTACTED" | "SITE_VISIT_SCHEDULED" | "NEGOTIATION" | "CLOSED" | "LOST";
export type SiteVisitStatus = "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
export type ServiceCategory = "MATERIAL_SUPPLIERS" | "LEGAL_SERVICES" | "HOME_SERVICES" | "FINANCE_LOANS";
export type ServiceBookingStatus = "NEW" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ReviewTargetType = "PROPERTY" | "PROJECT" | "SERVICE_PROVIDER";
export type SubscriptionPlanCode = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type NotificationType = "LEAD" | "LISTING" | "SYSTEM" | "PAYMENT" | "MESSAGE" | "SITE_VISIT" | "MODERATION";

export interface OwnerSummary {
  id: string;
  name: string | null;
  email?: string;
  phone?: string | null;
  ownerType?: string | null;
  businessName?: string | null;
  kycStatus?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  owner?: OwnerSummary;
  title: string;
  description: string | null;
  type: PropertyType;
  intent: ListingIntent;
  city: string;
  locality: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  price: number;
  priceUnit: PriceUnit;
  bhk: string | null;
  areaSqft: number;
  possession: Possession;
  furnishing: Furnishing;
  amenities: string[];
  images: string[];
  verified: boolean;
  status: ModerationStatus;
  moderationRemarks: string | null;
  isActive: boolean;
  views: number;
  shortlists: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUnit {
  id?: string;
  configuration: string;
  areaSqft: number;
  price: number;
  unitsAvailable?: number;
}

export interface Project {
  id: string;
  builderId: string;
  builder?: OwnerSummary;
  name: string;
  city: string;
  locality: string;
  type: ProjectType;
  priceFrom: number;
  priceTo: number;
  configurations: string[];
  areaFrom: number;
  areaTo: number;
  possessionLabel: string;
  status: ProjectStatus;
  rera: string | null;
  reraVerified: boolean;
  totalUnits: number;
  towers: number;
  amenities: string[];
  connectivity: string[];
  images: string[];
  description: string | null;
  moderationStatus: ModerationStatus;
  moderationRemarks: string | null;
  isActive: boolean;
  units?: ProjectUnit[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  ownerId: string;
  seekerId: string | null;
  propertyId: string | null;
  property?: Pick<Property, "id" | "title" | "city" | "locality">;
  name: string;
  phone: string;
  stage: LeadStage;
  intentScore: number;
  notes: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisit {
  id: string;
  seekerId: string;
  seeker?: OwnerSummary;
  hostId: string;
  host?: OwnerSummary;
  propertyId: string | null;
  property?: Pick<Property, "id" | "title" | "city" | "locality">;
  projectId: string | null;
  project?: Pick<Project, "id" | "name" | "city" | "locality">;
  scheduledAt: string;
  status: SiteVisitStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: Record<string, unknown>;
  alertsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: OwnerSummary;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantAId: string;
  participantA?: OwnerSummary;
  participantBId: string;
  participantB?: OwnerSummary;
  propertyId: string | null;
  lastMessageAt: string;
  createdAt: string;
  messages?: ChatMessage[];
}

export interface ServiceProvider {
  id: string;
  userId: string;
  displayName: string;
  category: ServiceCategory;
  specialty: string | null;
  city: string;
  priceFrom: string | null;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceBooking {
  id: string;
  providerId: string;
  provider?: ServiceProvider;
  customerId: string;
  customer?: OwnerSummary;
  serviceName: string;
  scheduledAt: string;
  amount: number;
  status: ServiceBookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  authorId: string;
  author?: OwnerSummary;
  targetType: ReviewTargetType;
  propertyId: string | null;
  projectId: string | null;
  providerId: string | null;
  rating: number;
  text: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planCode: SubscriptionPlanCode;
  status: SubscriptionStatus;
  creditsTotal: number;
  creditsRemaining: number;
  startedAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AdminOverview {
  totalUsers: number;
  owners: number;
  seekers: number;
  providers: number;
  totalProperties: number;
  pendingProperties: number;
  totalProjects: number;
  pendingProjects: number;
  pendingKyc: number;
}

export interface KycDocument {
  id: string;
  userId: string;
  user?: OwnerSummary;
  docType: string;
  docUrl: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type { LocalUser };
