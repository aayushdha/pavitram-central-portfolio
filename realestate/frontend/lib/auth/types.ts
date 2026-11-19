/** Raw role reported by the CENTRAL auth service (mainbackend). */
export type CentralRole = "USER" | "ADMIN" | "SUPER_ADMIN";

/** The user object the central auth API returns from /auth/me, /auth/signin, /auth/signup.
 * Confirmed via Postman: the id field is called `id`, not `userId` — both are
 * accepted here in case that ever changes back. */
export interface CentralAuthUser {
  id?: string;
  userId?: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: CentralRole;
}

export interface CentralAuthResponse {
  success?: boolean;
  message?: string;
  /** Confirmed field name from the real API — kept optional because the
   * `/auth/signup` response may not include a token (see `signup()` in
   * `central-auth-client.ts`, which falls back to a `signin` call if so). */
  access_token?: string;
  accessToken?: string;
  token?: string;
  user: CentralAuthUser;
}

/** Functional role INSIDE this real-estate module (backend `RealRole` enum). */
export type RealRole = "SEEKER" | "OWNER" | "PROVIDER" | "ADMIN";

export type OwnerType = "OWNER" | "AGENT" | "BUILDER";

/** Matches backend `KycStatus` enum in `prisma/schema.prisma` exactly. */
export type KycStatus = "PENDING" | "VERIFIED" | "ON_HOLD" | "REJECTED";

/** Shape of `RealUser` as returned by this project's own backend (`GET /users/me`). */
export interface LocalUser {
  id: string;
  centralUserId: string;
  email: string;
  phone: string | null;
  name: string | null;
  roles: RealRole[];
  ownerType: OwnerType | null;
  businessName: string | null;
  reraNumber: string | null;
  kycStatus: KycStatus;
  avatarUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  profession: string | null;
  designation: string | null;
  organization: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Generic success envelope this project's backend wraps every response in. */
export interface ApiSuccess<T = Record<string, unknown>> {
  success: true;
  message?: string;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

export class ApiRequestError extends Error {
  statusCode: number;
  details?: ApiError;

  constructor(message: string, statusCode: number, details?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
