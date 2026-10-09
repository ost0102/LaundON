export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface RequestVerificationInput {
  email: string;
}

export interface RequestVerificationResponse {
  message: string;
  /** Only present outside production - stands in for the email itself. */
  devCode?: string;
}

export interface ConfirmVerificationInput {
  email: string;
  code: string;
}

export interface ConfirmVerificationResponse {
  verified: true;
}

export interface FindEmailInput {
  name: string;
}

export interface FindEmailResponse {
  /** Masked, e.g. "ab***@example.com" - never the raw address. */
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: true;
}
