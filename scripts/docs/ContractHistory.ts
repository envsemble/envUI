import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseBranch, git, mergeBase as mergeBaseOf } from '../Git.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const changesetDirectory = resolve(repositoryRoot, '.changeset');

export const bumpsLibrary = (changeset: string) =>
  /^---\r?\n[\s\S]*?^\s*['"]?@envsemble\/envui['"]?\s*:\s*(?:major|minor|patch)\s*$[\s\S]*?^---/m.test(
    changeset,
  );

const isMajor = (changeset: string) =>
  /^---\r?\n[\s\S]*?^\s*['"]?@envsemble\/envui['"]?\s*:\s*major\s*$[\s\S]*?^---/m.test(changeset);

export const recordsBreakingChange = (changeset: string) =>
  isMajor(changeset) || (bumpsLibrary(changeset) && /^Breaking changes:\s*$/m.test(changeset));

export const names = (text: string, name: string) =>
  new RegExp(String.raw`(?<![\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\w-])`).test(
    text,
  );

export function baseContract<T>(
  path: string,
  base: string | undefined,
): { ref: string; contract: T } | { ref: string; contract?: undefined; missing: string } {
  const ref = baseBranch(base);
  let mergeBase: string;
  try {
    mergeBase = mergeBaseOf(ref);
  } catch {
    return { ref, missing: `${ref} does not exist here` };
  }
  try {
    return { ref, contract: JSON.parse(git(['show', `${mergeBase}:${path}`])) as T };
  } catch {
    return { ref, missing: `${ref} has no ${path} at the merge-base ${mergeBase.slice(0, 10)}` };
  }
}

const stableRelease = /^v\d+\.\d+\.\d+$/;

function isAncestor(commit: string, of: string) {
  try {
    git(['merge-base', '--is-ancestor', commit, of]);
    return true;
  } catch {
    return false;
  }
}

export function lastReleaseContract<T>(
  path: string,
  base: string | undefined,
): { tag: string; contract: T } | undefined {
  const ref = baseBranch(base);
  let tags: string[];
  try {
    tags = git(['tag', '--list', 'v*', '--sort=-v:refname']).split(/\r?\n/);
  } catch {
    return undefined;
  }
  const releasedFromBase = (tag: string) => isAncestor(tag, ref) || isAncestor(`${tag}^2`, ref);
  const tag = tags.filter((name) => stableRelease.test(name)).find(releasedFromBase);
  if (!tag) return undefined;
  try {
    return { tag, contract: JSON.parse(git(['show', `${tag}:${path}`])) as T };
  } catch {
    return undefined;
  }
}

export function pendingChangesets() {
  if (!existsSync(changesetDirectory)) return [];
  return readdirSync(changesetDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => readFileSync(resolve(changesetDirectory, name), 'utf8'));
}
