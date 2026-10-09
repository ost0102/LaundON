import { useMutation } from '@tanstack/react-query';

import {
  confirmEmailVerification,
  findEmail,
  requestEmailVerification,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

export function useSignUp() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signUp,
    onSuccess: setUser,
  });
}

export function useSignIn() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signIn,
    onSuccess: setUser,
  });
}

export function useRequestEmailVerification() {
  return useMutation({ mutationFn: requestEmailVerification });
}

export function useConfirmEmailVerification() {
  return useMutation({ mutationFn: confirmEmailVerification });
}

export function useFindEmail() {
  return useMutation({ mutationFn: findEmail });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useSignOut() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: signOut,
    onSettled: logout,
  });
}
