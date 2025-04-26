/**
 * @file src/popup/App.tsx
 *
 * @description
 * Root component for the Check Mate popup.
 * Displays loading states and analysis results from the store.
 *
 * @dependencies
 * - Zustand store: For state management
 * - Tailwind CSS: For styling
 *
 * @notes
 * - Uses semantic HTML for accessibility
 * - Handles loading and error states
 * - Prepared for dark mode with text-neutral-900
 */

import React from "react";
import {
  useInitialDataLoad,
  useIsLoading,
  useAnalysisResult,
  useError,
} from "./store";

const App: React.FC = () => {
  // Load initial data when popup opens
  useInitialDataLoad();

  // Get state from store
  const loading = useIsLoading();
  const result = useAnalysisResult();
  const error = useError();

  return (
    <main className="w-[400px] min-h-[300px] p-4 bg-white text-neutral-900">
      <header className="mb-4">
        <h1 className="text-lg font-semibold">Check Mate</h1>
        <p className="text-sm text-neutral-600">
          Fact checking at your fingertips
        </p>
      </header>

      <div className="flex items-center justify-center h-[200px] text-neutral-500">
        {loading ? (
          <p>Loading analysis...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !result ? (
          <p>Select a tweet to fact check</p>
        ) : (
          <p>Analysis results will be shown here</p> // Placeholder until we implement the verdict table
        )}
      </div>
    </main>
  );
};

export default App;
