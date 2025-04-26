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
import { VerdictRow } from "./components/VerdictRow";
import { IconButton } from "./components/IconButton";

const CopyIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M13 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M3 11V3a2 2 0 012-2h6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const App: React.FC = () => {
  // Load initial data when popup opens
  useInitialDataLoad();

  // Get state from store
  const loading = useIsLoading();
  const result = useAnalysisResult();
  const error = useError();

  // Handle copy button click
  const handleCopy = React.useCallback(() => {
    // Will be implemented in Step 16
    console.log("Copy button clicked");
  }, []);

  return (
    <main className="w-[400px] min-h-[300px] bg-white text-neutral-900">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Check Mate</h1>
          <p className="text-sm text-neutral-600">
            Fact checking at your fingertips
          </p>
        </div>

        {result && (
          <IconButton
            icon={<CopyIcon />}
            label="Copy results"
            onClick={handleCopy}
          />
        )}
      </header>

      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-[200px] text-neutral-500">
            <p>Loading analysis...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[200px] text-red-600">
            <p>{error}</p>
          </div>
        ) : !result ? (
          <div className="flex items-center justify-center h-[200px] text-neutral-500">
            <p>Select a tweet to fact check</p>
          </div>
        ) : (
          <div className="divide-y">
            {result.verdicts.map((verdict, index) => (
              <VerdictRow
                key={`${verdict.claim}-${index}`}
                verdict={verdict}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
