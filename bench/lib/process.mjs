import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';

const isWindows = process.platform === 'win32';

/** Kills a process and everything it started. */
export function killTree(pid) {
  try {
    if (isWindows) execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-pid, 'SIGKILL');
  } catch {
    // Already gone.
  }
}

/**
 * Stops processes an agent left running in its workspace, such as a dev server started in the
 * background, by matching the workspace path in their command line.
 */
export function killStragglers(directory) {
  if (!isWindows) return;
  const pattern = directory.replaceAll("'", "''");
  try {
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -and $_.CommandLine.Contains('${pattern}') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`,
      ],
      { stdio: 'ignore', timeout: 60_000 },
    );
  } catch {
    // Best effort.
  }
}

/**
 * Runs a command with stdin text, streaming stdout and stderr to files, and kills the whole
 * process tree when it exceeds the timeout.
 */
export function runWithTimeout(file, args, { cwd, env, input, stdoutFile, stderrFile, timeoutMs }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const stdout = createWriteStream(stdoutFile);
    const stderr = createWriteStream(stderrFile);
    let timedOut = false;
    let settled = false;
    const child = spawn(file, args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      detached: !isWindows,
    });
    child.stdout.pipe(stdout);
    child.stderr.pipe(stderr);
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child.pid);
    }, timeoutMs);
    const finish = (exitCode, signal, error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const close = (stream) => new Promise((done) => stream.end(done));
      Promise.all([close(stdout), close(stderr)]).then(() =>
        resolve({
          exitCode,
          signal,
          timedOut,
          error: error ? String(error.message ?? error) : undefined,
          durationMs: Date.now() - started,
        }),
      );
    };
    child.on('error', (error) => finish(null, null, error));
    child.on('close', (code, signal) => finish(code, signal));
    child.stdin.on('error', () => {});
    child.stdin.end(input ?? '');
  });
}

/** Runs a short command synchronously and returns trimmed stdout. */
export function run(file, args, options = {}) {
  return execFileSync(file, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}
