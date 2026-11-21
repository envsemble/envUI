import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { commands } from './support/Commands.ts';
import { ShardByDuration } from './support/ShardByDuration.ts';
import { checkoutPort } from '../../scripts/DevServers.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const componentTestsPortOffset = 3;
const workers = process.env.ENVUI_WORKERS ? Number(process.env.ENVUI_WORKERS) : undefined;
const viewport = { width: 1440, height: 1000 };
const contextOptions = { locale: 'en-US', timezoneId: 'UTC' };
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
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-dev-runtime',
      'axe-core',
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
      {
        name: 'once',
        description:
          'Holds for a fresh page only: a module loading for the first time, or a development report envUI makes once a page; the burn-in runs it once, not repeated',
        repeats: 0,
      },
    ],
    maxWorkers: workers,
    api: { port: checkoutPort(componentTestsPortOffset) },
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
