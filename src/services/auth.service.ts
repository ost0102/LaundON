import { apiPost } from '@/services/apiClient';
import type {
  AuthResponse,
  ConfirmVerificationInput,
  ConfirmVerificationResponse,
  FindEmailInput,
  FindEmailResponse,
  RequestVerificationInput,
  RequestVerificationResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  SignInInput,
  SignUpInput,
} from '@/types/auth';

export async function signUp(input: SignUpInput) {
  const data = await apiPost<AuthResponse>('/api/auth/signup', input);
  return data.user;
}

export async function signIn(input: SignInInput) {
  const data = await apiPost<AuthResponse>('/api/auth/login', input);
  return data.user;
}

export async function requestEmailVerification(input: RequestVerificationInput) {
  return apiPost<RequestVerificationResponse>('/api/auth/verification/request', input);
}

export async function confirmEmailVerification(input: ConfirmVerificationInput) {
  return apiPost<ConfirmVerificationResponse>('/api/auth/verification/confirm', input);
}

export async function findEmail(input: FindEmailInput) {
  return apiPost<FindEmailResponse>('/api/auth/find-email', input);
}

export async function resetPassword(input: ResetPasswordInput) {
  return apiPost<ResetPasswordResponse>('/api/auth/reset-password', input);
}
