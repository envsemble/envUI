import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { commands } from './support/Commands.ts';
import { ShardByDuration } from './support/ShardByDuration.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

/**
 * The library's component tests: each fixture mounted straight into a real browser page, with no
 * server or page load per test. Each engine is a project: `npm run test:component` runs every test
 * in Chromium, and `npm run test:component:engines` those tagged `engines`, which depend on the
 * engine, in Firefox and WebKit. `ENVUI_WORKERS` sets the files run at once, as for the Playwright
 * specs.
 */
const workers = process.env.ENVUI_WORKERS ? Number(process.env.ENVUI_WORKERS) : undefined;
const viewport = { width: 1440, height: 1000 };
// The language and time zone CI runs in, on every machine, so dates and numbers read the same.
const contextOptions = { locale: 'en-US', timezoneId: 'UTC' };
/**
 * The files whose tests emulate touch in Chromium, each a project of its own, which gives it a page
 * of its own: turned off again, touch emulation leaves the page the machine's own pointer, and a
 * machine without a mouse, such as CI's Linux runners, has none, so a later file would find no
 * fine pointer or hover. `--project='chromium*'` runs them with the rest.
 */
const folder = fileURLToPath(new URL('.', import.meta.url));
const touchFiles = readdirSync(folder)
  .filter((file) => file.endsWith('.test.tsx'))
  .filter((file) => readFileSync(`${folder}${file}`, 'utf8').includes('commands.emulateTouch('))
  .map((file) => `tests/component/${file}`);

export default defineConfig({
  root: repositoryRoot,
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
      '@shikijs/langs/css',
      '@shikijs/langs/html',
      '@shikijs/langs/ini',
      '@shikijs/langs/java',
      '@shikijs/langs/javascript',
      '@shikijs/langs/json',
      '@shikijs/langs/jsx',
      '@shikijs/langs/markdown',
      '@shikijs/langs/shellscript',
      '@shikijs/langs/sql',
      '@shikijs/langs/tsx',
      '@shikijs/langs/typescript',
      '@shikijs/langs/yaml',
      '@pierre/diffs',
      '@pierre/diffs/react',
      'shiki/core',
      'shiki/engine/javascript',
      'shiki/themes/github-dark-dimmed.mjs',
      'shiki/themes/github-dark-high-contrast.mjs',
      'shiki/themes/github-light-default.mjs',
      'shiki/themes/github-light-high-contrast.mjs',
    ],
  },
  test: {
    include: ['tests/component/**/*.test.tsx'],
    setupFiles: ['tests/component/support/Setup.ts'],
    tags: [
      { name: 'engines', description: 'Depends on the engine: also runs in Firefox and WebKit' },
      { name: 'a11y', description: 'The accessibility scan, which `npm run test:a11y` runs' },
    ],
    maxWorkers: workers,
    // --shard splits the files by the time each takes, as Durations.json records.
    sequence: { sequencer: ShardByDuration },
    testTimeout: 30_000,
    expect: { poll: { timeout: 8_000 } },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ actionTimeout: 8_000, contextOptions }),
      commands,
      viewport,
      screenshotFailures: false,
      instances: [
        { browser: 'chromium', exclude: touchFiles },
        ...touchFiles.map((file) => ({
          browser: 'chromium' as const,
          name: `chromium ${file.replace(/^.*\/|\.test\.tsx$/g, '')}`,
          include: [file],
        })),
        {
          browser: 'firefox',
          // As in playwright.config.ts: no bounce-tracking warnings in the console.
          provider: playwright({
            actionTimeout: 8_000,
            contextOptions,
            launchOptions: { firefoxUserPrefs: { 'privacy.bounceTrackingProtection.mode': 0 } },
          }),
        },
        { browser: 'webkit' },
      ],
    },
  },
});
