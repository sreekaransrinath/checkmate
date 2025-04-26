/**
 * @file vite.config.ts
 *
 * Vite configuration for bundling a Manifest V3 Chrome extension
 * via `rollup-plugin-chrome-extension`.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * 🩹 **Patch notes (26 Apr 2025 – hot-fix 4)**
 * 1.  The previous cast (`… as PluginOption`) produced a structural-typing
 *     mismatch after upgrading Vite 5.  The TS compiler suggested casting to
 *     `unknown` first, which we now do:
 *
 *        const cePlugin = chromeExtension(opts) as unknown as PluginOption;
 *
 * 2.  The plugin instance is declared in a separate constant (`cePlugin`)
 *     before being inserted into the `plugins[]` array, ensuring the cast is
 *     applied only once and is crystal-clear to future maintainers.
 *
 * 3.  We removed the argument cast (`opts as any`) because only the *return*
 *     type bothered TypeScript.  The runtime plugin already accepts `manifest`
 *     and `verbose`, so the cast to `unknown` → `PluginOption` is sufficient.
 */

import { defineConfig, type PluginOption } from "vite";
import { chromeExtension } from "rollup-plugin-chrome-extension";
import path from "path";

// Resolve project root in ESM (no `__dirname` in native ESM).
const rootDir = path.dirname(new URL(import.meta.url).pathname);

/* -------------------------------------------------------------------------- */
/*                            Plugin initialisation                           */
/* -------------------------------------------------------------------------- */

/** Options object fed into rollup-plugin-chrome-extension. */
const ceOptions = {
  manifest: "manifest.json",
  verbose: false,
};

/**
 * The plugin’s type definitions lag behind Vite 5’s stricter `Plugin` shape.
 * Casting the *result* to `unknown` first tells TypeScript we accept the
 * structural mismatch.
 */
const cePlugin = chromeExtension(ceOptions) as unknown as PluginOption;

/* -------------------------------------------------------------------------- */
/*                                 Vite config                                */
/* -------------------------------------------------------------------------- */

export default defineConfig({
  plugins: [cePlugin],
  resolve: {
    alias: {
      "@common": path.resolve(rootDir, "src/common"),
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
