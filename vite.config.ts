/**
 * @file vite.config.ts
 *
 * Vite configuration that bundles a Manifest V3 Chrome extension
 * using `rollup-plugin-chrome-extension`.
 *
 * Key features
 * -------------
 * • Treats `manifest.json` as the project entry point.
 * • Converts the TypeScript service-worker (`src/background/index.ts`)
 *   into `/dist/background.js` and wires it into the manifest.
 * • Generates source-maps in development for easier debugging.
 *
 * @dependencies
 * - rollup-plugin-chrome-extension: Bridges Vite ↔ Chrome Extension build.
 * - node:path: Resolves path aliases for `@common/*`.
 */

import { defineConfig } from "vite";
import { chromeExtension } from "rollup-plugin-chrome-extension";
import path from "node:path";

export default defineConfig({
  plugins: [
    chromeExtension({
      manifest: "manifest.json",
      verbose: false
    })
  ],
  resolve: {
    alias: {
      "@common": path.resolve(__dirname, "src/common")
    }
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      output: {
        // Produce friendlier chunk names for debugging.
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js"
      }
    }
  }
});
