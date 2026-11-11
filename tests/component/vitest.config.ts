import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { commands } from './Commands.ts';

/**
 * The library's component tests: each fixture mounted straight into a real browser page, with no
 * server or page load per test. Each engine is a project: `npm run test:component` runs every test
 * in Chromium, and `npm run test:component:engines` those tagged `engines`, which depend on the
 * engine, in Firefox and WebKit. `ENVUI_WORKERS` sets the files run at once, as for the Playwright
 * specs.
 */
const workers = process.env.ENVUI_WORKERS ? Number(process.env.ENVUI_WORKERS) : undefined;
const viewport = { width: 1440, height: 1000 };

export default defineConfig({
  root: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [tokensVitePlugin(), react()],
  resolve: {
    conditions: ['envui-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  // Every dependency the tests load, so none is found as a test loads it, which reloads the page.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-dev-runtime',
      'axe-core',
      '@tiptap/core',
      '@tiptap/extension-image',
      '@tiptap/extension-list',
      '@tiptap/extension-mention',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-table',
      '@tiptap/markdown',
      '@tiptap/pm/state',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/static-renderer/pm/react',
      '@tiptap/suggestion',
      'marked',
      'react-markdown',
      'remark-gfm',
    ],
  },
  test: {
    include: ['tests/component/**/*.test.tsx'],
    setupFiles: ['tests/component/Setup.ts'],
    tags: [
      { name: 'engines', description: 'Depends on the engine: also runs in Firefox and WebKit' },
    ],
    maxWorkers: workers,
    testTimeout: 30_000,
    expect: { poll: { timeout: 8_000 } },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ actionTimeout: 8_000 }),
      commands,
      viewport,
      screenshotFailures: false,
      instances: [
        { browser: 'chromium' },
        {
          browser: 'firefox',
          // As in playwright.config.ts: no bounce-tracking warnings in the console.
          provider: playwright({
            actionTimeout: 8_000,
            launchOptions: { firefoxUserPrefs: { 'privacy.bounceTrackingProtection.mode': 0 } },
          }),
        },
        { browser: 'webkit' },
      ],
    },
  },
});
