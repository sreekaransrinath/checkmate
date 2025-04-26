/**
 * @file src/popup/App.tsx
 *
 * @description
 * Root component for the Check Mate popup.
 * Currently a minimal placeholder that will be expanded
 * with verdict table and controls in later steps.
 *
 * @dependencies
 * - Tailwind CSS: For styling
 *
 * @notes
 * - Uses semantic HTML for accessibility
 * - Prepared for dark mode with text-neutral-900
 */

import React from "react";

const App: React.FC = () => {
  return (
    <main className="w-[400px] min-h-[300px] p-4 bg-white text-neutral-900">
      <header className="mb-4">
        <h1 className="text-lg font-semibold">Check Mate</h1>
        <p className="text-sm text-neutral-600">
          Fact checking at your fingertips
        </p>
      </header>

      <div className="flex items-center justify-center h-[200px] text-neutral-500">
        Select a tweet to fact check
      </div>
    </main>
  );
};

export default App;
