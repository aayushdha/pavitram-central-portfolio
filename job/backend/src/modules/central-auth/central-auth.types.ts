export interface CentralAuthUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl: string | null;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  kycStatus: string;
  isOnboarded: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  profession: string | null;
  designation: string | null;
  organization: string | null;
  reference: string | null;
}

export interface CentralSignupResponse {
  message: string;
  user: CentralAuthUser;
}

export interface CentralSigninResponse {
  message: string;
  access_token: string;
  user: CentralAuthUser;
}

export interface CentralMeResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface CentralProfileUpdateResponse {
  message: string;
  user: CentralAuthUser;
}

export interface CentralErrorBody {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
}
