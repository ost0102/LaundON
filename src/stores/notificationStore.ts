import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
}

/**
 * Mock "finish soon" notification center. No real push notifications yet -
 * a user opts in per machine, and once its countdown crosses the 5-minute
 * mark we surface an in-app toast. The subscribe/toast plumbing is kept
 * separate so a real Push API implementation can replace just the
 * `notifyIfDue` body later.
 */
interface NotificationState {
  subscribedMachineIds: string[];
  notifiedMachineIds: string[];
  toasts: Toast[];
  toggleSubscription: (machineId: string) => void;
  isSubscribed: (machineId: string) => boolean;
  notifyIfDue: (machineId: string, message: string, remainingSeconds: number) => void;
  resetNotification: (machineId: string) => void;
  dismissToast: (toastId: string) => void;
}

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  subscribedMachineIds: [],
  notifiedMachineIds: [],
  toasts: [],

  toggleSubscription: (machineId) =>
    set((state) => ({
      subscribedMachineIds: state.subscribedMachineIds.includes(machineId)
        ? state.subscribedMachineIds.filter((id) => id !== machineId)
        : [...state.subscribedMachineIds, machineId],
    })),

  isSubscribed: (machineId) => get().subscribedMachineIds.includes(machineId),

  notifyIfDue: (machineId, message, remainingSeconds) => {
    const state = get();
    const isSubscribed = state.subscribedMachineIds.includes(machineId);
    const alreadyNotified = state.notifiedMachineIds.includes(machineId);
    const isDue = remainingSeconds > 0 && remainingSeconds <= FIVE_MINUTES_IN_SECONDS;

    if (!isSubscribed || alreadyNotified || !isDue) return;

    set((prev) => ({
      notifiedMachineIds: [...prev.notifiedMachineIds, machineId],
      toasts: [...prev.toasts, { id: `${machineId}-${Date.now()}`, message }],
    }));
  },

  resetNotification: (machineId) =>
    set((state) => ({
      notifiedMachineIds: state.notifiedMachineIds.filter((id) => id !== machineId),
    })),

  dismissToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    })),
}));
