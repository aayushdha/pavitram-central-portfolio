export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  avatarUrl?: string | null;
  accountStatus?: string;
  kycStatus?: string;
  isOnboarded?: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  profession?: string | null;
  designation?: string | null;
  organization?: string | null;
  reference?: string | null;
};

export type TokenProfile = {
  userId: string;
  email: string;
  role?: string;
};

/** Frontend never sends role — backend assigns it. */
export type RegisterPayload = {
  email: string;
  password: string;
  phone: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type ProfileUpdatePayload = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  profession?: string;
  designation?: string;
  organization?: string;
  reference?: string;
};

export type RegisterResponse = {
  message: string;
  user: AuthUser;
};

export type LoginResponse = {
  message: string;
  access_token: string;
  user: AuthUser;
};

export type MeResponse = {
  message: string;
  user: TokenProfile;
};

/** "Join the Community" membership form — public, no login required. */
export type ProfileFormPayload = {
  fullName: string;
  mobileNumber: string;
  profession: string;
  designation: string;
  organization: string;
  location: string;
  city: string;
  state: string;
  reference?: string;
};

export type ProfileFormResponse = {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
};
