// Runs the checks of `npm run check`, `npm run check:affected` and `npm run verify` as tasks: each
// a command with a name, run alone or beside others, its output held back and printed when it ends
// so parallel tasks don't interleave. A summary with each task's time closes the run.
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { repositoryRoot } from '../RepositoryPaths.ts';

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number, text: string) => (color ? `\u001b[${code}m${text}\u001b[0m` : text);
export const red = (text: string) => paint(31, text);
const green = (text: string) => paint(32, text);
export const yellow = (text: string) => paint(33, text);
export const dim = (text: string) => paint(2, text);
export const bold = (text: string) => paint(1, text);

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

const node = process.execPath;
/** The command lines of the repository's tools, run with this Node rather than through npm. */
export const bin = {
  eslint: [node, resolve(repositoryRoot, 'node_modules/eslint/bin/eslint.js')],
  stylelint: [node, resolve(repositoryRoot, 'node_modules/stylelint/bin/stylelint.mjs')],
  prettier: [node, resolve(repositoryRoot, 'node_modules/prettier/bin/prettier.cjs')],
  tsc: [node, resolve(repositoryRoot, 'node_modules/typescript/bin/tsc')],
  playwright: [node, resolve(repositoryRoot, 'node_modules/@playwright/test/cli.js')],
  node: [node],
  // npm's own script, so no shell runs in between: the one running this script, or Node's.
  npm: [
    node,
    process.env.npm_execpath?.endsWith('.js')
      ? process.env.npm_execpath
      : resolve(
          dirname(node),
          process.platform === 'win32' ? '' : '../lib',
          'node_modules/npm/bin/npm-cli.js',
        ),
  ],
};

/**
 * A task: `run` is [command, ...args]; `env` adds variables. `stream` prints its output as it comes,
 * for the one long task a phase waits on. `optional` failures warn rather than fail.
 */
/** A command a check runs, and how it reports. */
export interface Task {
  name: string;
  run: string[];
  env?: Record<string, string>;
  stream?: boolean;
  optional?: boolean;
  /** Printed after its name, such as how many files it covers. */
  detail?: string;
  /** Prints its output also when it passes. */
  echo?: boolean;
}

/** How a task went. */
export interface TaskResult {
  name: string;
  ok: boolean;
  optional?: boolean;
  ms: number;
  detail?: string;
}

export function task(name: string, run: string[], options: Omit<Task, 'name' | 'run'> = {}): Task {
  return { name, run, ...options };
}

const results: TaskResult[] = [];

/** Runs one task and records its result. */
function runTask(item: Task): Promise<TaskResult> {
  const started = performance.now();
  return new Promise((done) => {
    const [command, ...args] = item.run as [string, ...string[]];
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: { ...process.env, FORCE_COLOR: color ? '1' : '0', ...item.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const collect = (chunk: Buffer | string) => {
      if (item.stream) process.stdout.write(chunk);
      else output += chunk;
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', (error) => {
      output += String(error);
    });
    child.on('close', (code) => {
      const ms = performance.now() - started;
      const ok = code === 0;
      const result: TaskResult = {
        name: item.name,
        ok,
        optional: item.optional,
        ms,
        detail: item.detail,
      };
      results.push(result);
      const mark = ok ? green('✔') : item.optional ? yellow('!') : red('✖');
      console.log(
        `${mark} ${item.name}${item.detail ? dim(` (${item.detail})`) : ''} ${dim(seconds(ms))}`,
      );
      if (!ok && !item.stream) console.log(indent(tail(output, 120)));
      else if (ok && item.echo && output.trim()) console.log(indent(output.trim()));
      // Playwright's counts, so a passing run still shows flaky and skipped tests.
      if (ok && !item.stream)
        for (const line of output.split(/\r?\n/))
          if (
            /^\s+\d+ (?:passed|flaky|skipped|did not run)\b/.test(line) ||
            /^Port \d+ serves/.test(line)
          )
            console.log(dim(`    ${line.trim()}`));
      done(result);
    });
  });
}

/** Runs tasks side by side and waits for all of them. */
export function parallel(tasks: readonly (Task | false | undefined)[]) {
  return Promise.all(tasks.filter((item): item is Task => Boolean(item)).map(runTask));
}

/** Runs tasks one after another; stops at the first failure unless `keepGoing`. */
export async function series(
  tasks: readonly (Task | false | undefined)[],
  { keepGoing = false } = {},
): Promise<TaskResult[]> {
  const done: TaskResult[] = [];
  for (const item of tasks.filter((entry): entry is Task => Boolean(entry))) {
    const result = await runTask(item);
    done.push(result);
    if (!result.ok && !result.optional && !keepGoing) break;
  }
  return done;
}

function tail(text: string, lines: number) {
  const all = text.trimEnd().split(/\r?\n/);
  return (
    all.length > lines ? [`… ${all.length - lines} earlier lines`, ...all.slice(-lines)] : all
  ).join('\n');
}

const indent = (text: string) =>
  text
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');

/** Prints every task's time and the total, and returns whether all required tasks passed. */
export function summary(title: string, started: number) {
  const failed = results.filter((result) => !result.ok && !result.optional);
  const total = performance.now() - started;
  console.log('');
  console.log(
    bold(`${title}: ${failed.length ? red('failed') : green('passed')} in ${seconds(total)}`),
  );
  for (const result of [...results].sort((a, b) => b.ms - a.ms))
    console.log(
      `  ${result.ok ? green('✔') : result.optional ? yellow('!') : red('✖')} ${result.name.padEnd(34)} ${seconds(result.ms).padStart(8)}`,
    );
  return failed.length === 0;
}

/** Whether Docker answers, for the visual baseline. */
export function dockerRunning() {
  return new Promise((done) => {
    const child = spawn('docker', ['info', '--format', '{{.ServerVersion}}'], { stdio: 'ignore' });
    child.on('error', () => done(false));
    child.on('close', (code) => done(code === 0));
  });
}
