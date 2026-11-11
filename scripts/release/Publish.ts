// The Release workflow's work (.github/workflows/release.yml), on the merge commit of a pull
// request into main:
//
//   node scripts/release/Publish.ts --plan   whether the version needs releasing, as release=true
//                                            or false in GITHUB_OUTPUT, and, if it does, that the
//                                            release is ready, before anything is built
//   node scripts/release/Publish.ts          once the packages are built: validates the release,
//                                            drafts the GitHub release with the version's notes,
//                                            publishes each package the registry lacks under the
//                                            version's dist-tag, then publishes the release, which
//                                            tags the merge commit
//
// A version with a published release is done; a draft left by a failed run is replaced, and a
// re-run publishes only what is still missing. Any answer from gh or npm other than "not found"
// stops the run rather than guessing. SHA names the merge commit; gh and npm take their tokens from
// the environment.
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { libraryVersion, validateRelease } from './ValidateRelease.ts';

/** How a command ended. */
export interface Outcome {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** Runs gh or npm with these arguments; the tests pass their own. */
export type Run = (command: 'gh' | 'npm', args: string[]) => Outcome;

/** The packages, the library first, as each depends on nothing published after it. */
const packages = [
  '@envsemble/envui',
  '@envsemble/eslint-plugin-envui',
  '@envsemble/stylelint-config-envui',
];

const runCommand: Run = (command, args) => {
  const { status, stdout, stderr } = spawnSync(command, args, { encoding: 'utf8' });
  return { status, stdout, stderr };
};

/** Runs a command that must succeed, and returns its output. */
function must(run: Run, command: 'gh' | 'npm', args: string[]) {
  const outcome = run(command, args);
  if (outcome.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed:\n${outcome.stderr}`);
  return outcome.stdout;
}

/** Where the release of `tag` stands on GitHub. */
export function releaseState(tag: string, run: Run): 'released' | 'draft' | 'missing' {
  const view = run('gh', ['release', 'view', tag, '--json', 'isDraft', '--jq', '.isDraft']);
  if (view.status === 0) return view.stdout.trim() === 'false' ? 'released' : 'draft';
  if (/release not found/i.test(view.stderr)) return 'missing';
  throw new Error(`gh release view ${tag} failed:\n${view.stderr}`);
}

/** Whether the registry has `name` at `version`. */
export function isPublished(name: string, version: string, run: Run) {
  const view = run('npm', ['view', `${name}@${version}`, 'version']);
  if (view.status === 0) return true;
  if (/E404|404 Not Found|is not in this registry/.test(view.stderr)) return false;
  throw new Error(`npm view ${name}@${version} failed:\n${view.stderr}`);
}

/**
 * Drafts the release of the validated version, publishes the packages the registry lacks and
 * publishes the release. Returns the packages it published.
 */
export function publish({
  release,
  sha,
  run = runCommand,
  notesDirectory = mkdtempSync(join(tmpdir(), 'envui-release-')),
}: {
  release: ReturnType<typeof validateRelease>;
  sha: string;
  run?: Run;
  notesDirectory?: string;
}) {
  const tag = `v${release.version}`;
  const state = releaseState(tag, run);
  if (state === 'released') return [];
  // Only a draft, left by an earlier attempt, is replaced; a published release never is.
  if (state === 'draft') must(run, 'gh', ['release', 'delete', tag, '--yes']);
  const notesFile = join(notesDirectory, 'release-notes.md');
  writeFileSync(notesFile, release.notes);
  must(run, 'gh', [
    'release',
    'create',
    tag,
    '--draft',
    '--target',
    sha,
    '--title',
    `envUI ${tag}`,
    '--notes-file',
    notesFile,
    ...(release.prerelease ? ['--prerelease'] : []),
  ]);
  const published: string[] = [];
  for (const name of packages) {
    if (isPublished(name, release.version, run)) continue;
    must(run, 'npm', ['publish', '--workspace', name, '--tag', release.distTag]);
    published.push(name);
  }
  must(run, 'gh', ['release', 'edit', tag, '--draft=false']);
  return published;
}

if (import.meta.main) {
  const tag = `v${libraryVersion()}`;
  if (process.argv.includes('--plan')) {
    const needed = releaseState(tag, runCommand) !== 'released';
    if (needed) validateRelease(tag);
    else console.log(`::notice title=Nothing to release::${tag} is already released.`);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `release=${needed}\n`);
    else console.log(`release=${needed}`);
  } else {
    const sha = process.env.SHA;
    if (!sha) throw new Error('Set SHA to the commit the release tags.');
    const published = publish({ release: validateRelease(tag), sha });
    console.log(
      `Released ${tag}${published.length ? `, publishing ${published.join(', ')}` : ''}.`,
    );
  }
}
