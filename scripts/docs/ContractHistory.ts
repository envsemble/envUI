// What a public contract of the library, such as its parts or its exports, was at the merge-base
// with the integration branch, and the pending changesets that record a change to it.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseCandidates } from '../test/TestScope.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const changesetDirectory = resolve(repositoryRoot, '.changeset');

/** Whether a changeset's front matter bumps @envsemble/envui at all. */
export const bumpsLibrary = (changeset: string) =>
  /^---\r?\n[\s\S]*?^\s*['"]?@envsemble\/envui['"]?\s*:\s*(?:major|minor|patch)\s*$[\s\S]*?^---/m.test(
    changeset,
  );

/** Whether a changeset's front matter makes it a major change of @envsemble/envui. */
export const isMajor = (changeset: string) =>
  /^---\r?\n[\s\S]*?^\s*['"]?@envsemble\/envui['"]?\s*:\s*major\s*$[\s\S]*?^---/m.test(changeset);

/** Whether a text names a name whole, so a changeset about env-card-header doesn't name env-card. */
export const names = (text: string, name: string) =>
  new RegExp(String.raw`(?<![\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\w-])`).test(
    text,
  );

function git(args: string[]) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * A file of the repository, parsed as JSON, at the merge-base with the integration branch: from the
 * first of the check tiers' bases whose merge-base has it, with what each base skipped lacked.
 */
export function baseContract<T>(
  path: string,
  base: string | undefined,
): { ref: string | undefined; contract: T | undefined; skipped: string[] } {
  const skipped: string[] = [];
  for (const ref of baseCandidates(base)) {
    let mergeBase: string;
    try {
      mergeBase = git(['merge-base', 'HEAD', ref]).trim();
    } catch {
      skipped.push(`${ref} does not exist here`);
      continue;
    }
    try {
      return { ref, contract: JSON.parse(git(['show', `${mergeBase}:${path}`])) as T, skipped };
    } catch {
      skipped.push(`${ref} has no ${path} at the merge-base ${mergeBase.slice(0, 10)}`);
    }
  }
  return { ref: undefined, contract: undefined, skipped };
}

/** The pending changesets' text, one per changeset. */
export function pendingChangesets() {
  if (!existsSync(changesetDirectory)) return [];
  return readdirSync(changesetDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => readFileSync(resolve(changesetDirectory, name), 'utf8'));
}

/** The `--base <ref>` a check was given, if any. */
export function baseOption(argv = process.argv) {
  const option = argv.indexOf('--base');
  return option === -1 ? undefined : argv[option + 1];
}
