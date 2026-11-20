import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { repositoryRoot } from './RepositoryPaths.ts';

const defaultBase = 'origin/dev';

export function git(args: readonly string[], root = repositoryRoot) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export function baseBranch(base?: string): string {
  return base || process.env.ENVUI_BASE || defaultBase;
}

export const mergeBase = (ref: string, root = repositoryRoot) =>
  git(['merge-base', 'HEAD', ref], root).trim();

export function baseOption(args = process.argv.slice(2)) {
  const { values } = parseArgs({
    args,
    options: { base: { type: 'string' } },
    strict: false,
    allowPositionals: true,
  });
  return typeof values.base === 'string' ? values.base : undefined;
}
