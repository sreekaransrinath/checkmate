/**
 * @file src/popup/main.tsx
 *
 * @description
 * Main entry point for the popup React application.
 * Sets up React root with error boundaries and providers.
 *
 * @dependencies
 * - React: Core UI framework
 * - ReactDOM: DOM rendering
 * - Tailwind CSS: Styling
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../styles/tailwind.css";

// Error boundary component for graceful error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Popup Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          <h1 className="font-bold">Something went wrong</h1>
          <p>Please try reopening the popup</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root and render app
const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
