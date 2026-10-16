import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { after, before, describe, it } from 'node:test';
import { runWithTimeout } from '../lib/process.mjs';

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

async function waitFor(predicate, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (predicate()) return true;
    await sleep(100);
  }
  return predicate();
}

describe('runWithTimeout', () => {
  let dir;
  const pids = [];
  before(() => {
    dir = mkdtempSync(join(tmpdir(), 'bench-process-'));
    // A command that starts a long-lived grandchild holding its stdout and stderr, like an agent
    // that leaves a dev server running (`npm run dev &` in Git Bash), then exits or keeps running.
    // Detached, because Node on Windows otherwise ends a child together with its parent.
    writeFileSync(
      join(dir, 'parent.mjs'),
      `import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => console.log("serving"), 200)'], {
  stdio: ['ignore', 'inherit', 'inherit'],
  detached: true,
});
grandchild.unref();
writeFileSync(process.argv[2], String(grandchild.pid));
console.log('started');
if (process.argv[3] === 'stay') setInterval(() => {}, 1000);
else setTimeout(() => process.exit(0), 300);
`,
    );
  });
  after(() => {
    for (const pid of pids) {
      try {
        process.kill(pid);
      } catch {
        // Gone.
      }
    }
    rmSync(dir, { recursive: true, force: true });
  });

  const start = (name, mode, timeoutMs) =>
    runWithTimeout(process.execPath, [join(dir, 'parent.mjs'), join(dir, `${name}.pid`), mode], {
      cwd: dir,
      env: process.env,
      input: '',
      stdoutFile: join(dir, `${name}.out`),
      stderrFile: join(dir, `${name}.err`),
      timeoutMs,
      graceMs: 500,
    });

  it('returns when the command exits, though a grandchild keeps its output open', async () => {
    const started = Date.now();
    const result = await start('exits', 'exit', 60_000);
    pids.push(Number(readFileSync(join(dir, 'exits.pid'), 'utf8')));
    assert.equal(result.timedOut, false);
    assert.equal(result.exitCode, 0);
    assert.ok(Date.now() - started < 10_000, `took ${Date.now() - started} ms`);
    assert.match(readFileSync(join(dir, 'exits.out'), 'utf8'), /started/);
  });

  it('kills the whole process tree at the timeout', async () => {
    const started = Date.now();
    const result = await start('stays', 'stay', 1500);
    const elapsed = Date.now() - started;
    assert.equal(result.timedOut, true);
    assert.ok(elapsed < 15_000, `took ${elapsed} ms`);
    assert.ok(existsSync(join(dir, 'stays.pid')));
    const grandchild = Number(readFileSync(join(dir, 'stays.pid'), 'utf8'));
    pids.push(grandchild);
    assert.ok(await waitFor(() => !alive(grandchild), 5000), 'the grandchild is still running');
  });
});
