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
 * Stops processes an agent left running, such as a dev server started in the background, by
 * matching a directory of the run (its workspace or temp folder) in their command line.
 */
export function killStragglers(...directories) {
  if (!isWindows) return;
  const patterns = directories.map((directory) => `'${directory.replaceAll("'", "''")}'`).join(',');
  try {
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `$patterns = @(${patterns}); Get-CimInstance Win32_Process | Where-Object { $line = $_.CommandLine; $_.ProcessId -ne $PID -and $line -and ($patterns | Where-Object { $line.Contains($_) }) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`,
      ],
      { stdio: 'ignore', timeout: 60_000 },
    );
  } catch {
    // Best effort.
  }
}

/**
 * Runs a command with stdin text, streaming stdout and stderr to files. It returns when the command
 * exits, or at the timeout, whichever comes first, and never waits for its output pipes to close:
 * a dev server the command started in the background keeps them open for as long as it runs. At
 * the timeout the whole process tree is killed.
 */
export function runWithTimeout(
  file,
  args,
  { cwd, env, input, stdoutFile, stderrFile, timeoutMs, graceMs = 2000 },
) {
  return new Promise((resolve) => {
    const started = Date.now();
    const stdout = createWriteStream(stdoutFile);
    const stderr = createWriteStream(stderrFile);
    let timedOut = false;
    let settled = false;
    let exit = { code: null, signal: null };
    let spawnError;
    let grace;
    const child = spawn(file, args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      detached: !isWindows,
    });
    child.stdout.pipe(stdout, { end: false });
    child.stderr.pipe(stderr, { end: false });

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(grace);
      // Output still held open by a background process is cut off here, so the run is bounded.
      for (const pipe of [child.stdin, child.stdout, child.stderr]) pipe?.destroy();
      const close = (stream) => new Promise((done) => stream.end(done));
      Promise.all([close(stdout), close(stderr)]).then(() =>
        resolve({
          exitCode: exit.code,
          signal: exit.signal,
          timedOut,
          error: spawnError ? String(spawnError.message ?? spawnError) : undefined,
          durationMs: Date.now() - started,
        }),
      );
    };
    // After the exit, wait briefly for the last output to drain, then stop waiting.
    const drain = (ms) => {
      clearTimeout(grace);
      grace = setTimeout(finish, ms);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child.pid);
      // If the kill did not take, still return.
      drain(Math.max(graceMs, 5000));
    }, timeoutMs);
    child.on('error', (error) => {
      spawnError = error;
      finish();
    });
    child.on('exit', (code, signal) => {
      exit = { code, signal };
      // On POSIX the command leads its own process group; take down whatever it left behind.
      if (!isWindows) killTree(child.pid);
      drain(graceMs);
    });
    child.on('close', finish);
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
