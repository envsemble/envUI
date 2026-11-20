import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { repositoryRoot } from '../RepositoryPaths.ts';
import { bold, dim, green, red, showsColor, yellow } from '../Terminal.ts';

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

const node = process.execPath;
export const bin = {
  eslint: [node, resolve(repositoryRoot, 'node_modules/eslint/bin/eslint.js')],
  stylelint: [node, resolve(repositoryRoot, 'node_modules/stylelint/bin/stylelint.mjs')],
  prettier: [node, resolve(repositoryRoot, 'node_modules/prettier/bin/prettier.cjs')],
  knip: [node, resolve(repositoryRoot, 'node_modules/knip/bin/knip.js')],
  tsc: [node, resolve(repositoryRoot, 'node_modules/typescript/bin/tsc')],
  playwright: [node, resolve(repositoryRoot, 'node_modules/@playwright/test/cli.js')],
  vitest: [node, resolve(repositoryRoot, 'node_modules/vitest/vitest.mjs')],
  node: [node],
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

export interface Task {
  name: string;
  run: string[];
  env?: Record<string, string>;
  stream?: boolean;
  optional?: boolean;
  detail?: string;
  echo?: boolean;
}

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

function runTask(item: Task): Promise<TaskResult> {
  const started = performance.now();
  return new Promise((done) => {
    const [command, ...args] = item.run as [string, ...string[]];
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: { ...process.env, FORCE_COLOR: showsColor ? '1' : '0', ...item.env },
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

export function parallel(tasks: readonly (Task | false | undefined)[]) {
  return Promise.all(tasks.filter((item): item is Task => Boolean(item)).map(runTask));
}

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

export function dockerRunning() {
  return new Promise((done) => {
    const child = spawn('docker', ['info', '--format', '{{.ServerVersion}}'], { stdio: 'ignore' });
    child.on('error', () => done(false));
    child.on('close', (code) => done(code === 0));
  });
}
