import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative } from 'node:path';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

export const cacheDirectory = join(repositoryRoot, '.cache');

export async function inScratchFolder<T>(
  prefix: string,
  run: (folder: string) => T | Promise<T>,
  { within = tmpdir() } = {},
) {
  await mkdir(within, { recursive: true });
  const folder = await mkdtemp(join(within, `envui-${prefix}-`));
  try {
    return await run(folder);
  } finally {
    const contained = relative(within, folder);
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    await rm(folder, { recursive: true, force: true });
  }
}
