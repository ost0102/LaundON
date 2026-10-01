import { create } from 'zustand';

export type MachineTypeFilter = 'ALL' | 'WASHER' | 'DRYER';
export type MachineStatusFilter = 'ALL' | 'AVAILABLE' | 'RUNNING';
export type MachineSortOption = 'NUMBER' | 'AVAILABLE_FIRST' | 'REMAINING_ASC';

/**
 * Client-only UI state for the store detail screen (filter/sort selection).
 * Deliberately does NOT hold machine data itself - that's server state
 * owned by TanStack Query, refetched on its own schedule. Mixing the two
 * would mean two sources of truth for the same data.
 */
interface LaundryUiState {
  typeFilter: MachineTypeFilter;
  statusFilter: MachineStatusFilter;
  sortOption: MachineSortOption;
  setTypeFilter: (filter: MachineTypeFilter) => void;
  setStatusFilter: (filter: MachineStatusFilter) => void;
  setSortOption: (option: MachineSortOption) => void;
}

export const useLaundryUiStore = create<LaundryUiState>((set) => ({
  typeFilter: 'ALL',
  statusFilter: 'ALL',
  sortOption: 'NUMBER',
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSortOption: (sortOption) => set({ sortOption }),
}));
