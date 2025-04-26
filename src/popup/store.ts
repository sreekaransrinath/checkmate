/**
 * @file src/popup/store.ts
 *
 * @description
 * Zustand store for managing the popup UI state.
 * Handles loading states and analysis results from chrome storage.
 *
 * Key features:
 * - Manages loading state during data fetches
 * - Stores and updates analysis results
 * - Provides hook for initial data load from chrome.storage
 * - Type-safe state management with TypeScript
 *
 * @dependencies
 * - zustand: State management
 * - chrome.storage.session: Chrome extension storage API
 *
 * @notes
 * - Uses chrome.storage.session for temporary result storage
 * - Implements proper TypeScript types for type safety
 * - Handles edge cases like missing storage data
 */

import { create } from "zustand";
import React from "react";
import type { AnalysisResult } from "../common/types";

/**
 * Interface defining the shape of our popup state
 */
interface PopupState {
  // State
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  loadInitialData: () => Promise<void>;
  reset: () => void;
}

/**
 * Initial state values
 */
const initialState = {
  loading: true,
  result: null,
  error: null,
};

/**
 * Create the store with Zustand
 */
export const usePopupStore = create<PopupState>()((set) => ({
  // Initial state
  ...initialState,

  // Actions
  setLoading: (loading: boolean) => set({ loading }),

  setResult: (result: AnalysisResult | null) =>
    set({
      result,
      error: null,
    }),

  setError: (error: string | null) => set({ error }),

  reset: () => set(initialState),

  /**
   * Load initial analysis result from chrome.storage.session
   * Called when popup is opened
   */
  loadInitialData: async () => {
    try {
      set({ loading: true, error: null });

      const data = await chrome.storage.session.get<{
        lastResult?: AnalysisResult;
      }>("lastResult");

      set({
        result: data.lastResult || null,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load analysis result:", error);
      set({
        result: null,
        loading: false,
        error: "Failed to load analysis result",
      });
    }
  },
}));

/**
 * Hook to automatically load initial data when popup mounts
 */
export const useInitialDataLoad = () => {
  const loadInitialData = usePopupStore((state) => state.loadInitialData);

  React.useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);
};

/**
 * Hook to access loading state
 */
export const useIsLoading = () => usePopupStore((state) => state.loading);

/**
 * Hook to access analysis result
 */
export const useAnalysisResult = () => usePopupStore((state) => state.result);

/**
 * Hook to access error state
 */
export const useError = () => usePopupStore((state) => state.error);
