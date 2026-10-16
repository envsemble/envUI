/**
 * Runs before the accessibility scans. Their update holds a lock on KnownViolations.json while a
 * worker rewrites its pages (Accessibility.spec.ts), and a stopped update can leave that lock
 * behind, which every later update would wait on until it failed. No scan holds it yet, so a lock
 * found here is stale and is removed.
 */
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test as setup } from '@playwright/test';

setup('remove a lock a stopped update left on KnownViolations.json', () => {
  rmSync(fileURLToPath(new URL('./KnownViolations.json.lock', import.meta.url)), {
    recursive: true,
    force: true,
  });
});
