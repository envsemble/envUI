import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { libraryVersion, validateRelease } from './ValidateRelease.ts';

export interface Outcome {
  status: number | null;
  stdout: string;
  stderr: string;
}

export type Run = (command: 'gh' | 'npm', args: string[], shown?: boolean) => Outcome;

const packagesInDependencyOrder = [
  '@envsemble/envui',
  '@envsemble/eslint-plugin-envui',
  '@envsemble/stylelint-config-envui',
];

const runCommand: Run = (command, args, shown = false) => {
  const { status, stdout, stderr } = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: shown ? 'inherit' : 'pipe',
  });
  return { status, stdout: stdout ?? '', stderr: stderr ?? '' };
};

function must(run: Run, command: 'gh' | 'npm', args: string[], shown = false) {
  const outcome = run(command, args, shown);
  if (outcome.status !== 0)
    throw new Error(
      `${command} ${args.join(' ')} failed with status ${outcome.status}:\n${shown ? 'its output is above' : outcome.stderr}`,
    );
  return outcome.stdout;
}

export function releaseState(tag: string, run: Run): 'released' | 'draft' | 'missing' {
  const view = run('gh', ['release', 'view', tag, '--json', 'isDraft', '--jq', '.isDraft']);
  if (view.status === 0) return view.stdout.trim() === 'false' ? 'released' : 'draft';
  if (/release not found/i.test(view.stderr)) return 'missing';
  throw new Error(`gh release view ${tag} failed:\n${view.stderr}`);
}

export function isPublished(name: string, version: string, run: Run) {
  const view = run('npm', ['view', `${name}@${version}`, 'version']);
  if (view.status === 0) return true;
  if (/E404|404 Not Found|is not in this registry/.test(view.stderr)) return false;
  throw new Error(`npm view ${name}@${version} failed:\n${view.stderr}`);
}

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
  for (const name of packagesInDependencyOrder) {
    if (isPublished(name, release.version, run)) continue;
    const showInLogSoLongErrorsAreNotCutOff = true;
    must(
      run,
      'npm',
      ['publish', '--workspace', name, '--tag', release.distTag, '--loglevel', 'warn'],
      showInLogSoLongErrorsAreNotCutOff,
    );
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
