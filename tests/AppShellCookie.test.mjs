// navigation/app-shell/persistence: the frame's cookie and localStorage formats, and
// readAppShellCookie, which a server calls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/AppShellCookie.mjs');
await build({
  absWorkingDir: repository,
  entryPoints: [join(repository, 'packages/ui/src/navigation/app-shell/persistence.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: output,
  logLevel: 'error',
});
const {
  appShellCookie,
  parseAppShellState,
  parseStoredAppShellState,
  readAppShellCookie,
  readCookie,
  serializeAppShellState,
} = await import(pathToFileURL(output).href);

test('the state is written as side.open and side.width, the width in rem', () => {
  assert.equal(
    serializeAppShellState({ start: { open: true, width: 16.5 }, end: { open: false } }),
    'start.open=1&start.width=16.5&end.open=0',
  );
  // Widths keep two decimals, and nothing invalid is written.
  assert.equal(
    serializeAppShellState({ start: { open: false, width: 17.123456 } }),
    'start.open=0&start.width=17.12',
  );
  assert.equal(serializeAppShellState({ start: { open: true, width: -2 } }), 'start.open=1');
  assert.equal(serializeAppShellState({}), '');
});

test('parsing reads what serializing wrote and skips what it cannot read', () => {
  const state = { start: { open: true, width: 16.5 }, end: { open: false } };
  assert.deepEqual(parseAppShellState(serializeAppShellState(state)), state);
  assert.deepEqual(parseAppShellState('end.width=20&middle.open=1&start.open=yes&start.width=x'), {
    end: { open: true, width: 20 },
  });
  assert.equal(parseAppShellState(''), undefined);
  assert.equal(parseAppShellState('garbage'), undefined);
});

test('readAppShellCookie finds the frame among the request cookies', () => {
  const header = `theme=dark; app.frame=${encodeURIComponent('start.open=0&end.open=1&end.width=21')}; other=1`;
  assert.deepEqual(readAppShellCookie(header, 'app.frame'), {
    start: { open: false },
    end: { open: true, width: 21 },
  });
  assert.equal(readAppShellCookie(header, 'missing'), undefined);
  assert.equal(readAppShellCookie(undefined, 'app.frame'), undefined);
  assert.equal(readAppShellCookie(null, 'app.frame'), undefined);
  assert.equal(readAppShellCookie('', 'app.frame'), undefined);
  // A value that isn't valid URL encoding is ignored, never thrown.
  assert.equal(readCookie('app.frame=%E0%A4%A', 'app.frame'), undefined);
  // A name that only starts like the key is another cookie.
  assert.equal(readAppShellCookie('app.frame2=start.open%3D0', 'app.frame'), undefined);
});

test('the cookie has its attributes: a path, a year, lax and secure on https', () => {
  const state = { start: { open: false } };
  assert.equal(
    appShellCookie('app.frame', state),
    'app.frame=start.open%3D0; path=/; max-age=31536000; samesite=lax',
  );
  assert.equal(
    appShellCookie('app.frame', state, {}, true),
    'app.frame=start.open%3D0; path=/; max-age=31536000; samesite=lax; secure',
  );
  assert.equal(
    appShellCookie(
      'app.frame',
      state,
      { path: '/app', maxAge: 60, sameSite: 'strict', secure: false },
      true,
    ),
    'app.frame=start.open%3D0; path=/app; max-age=60; samesite=strict',
  );
});

test('localStorage keeps JSON, read defensively', () => {
  assert.deepEqual(parseStoredAppShellState('{"start":{"open":false,"width":18}}'), {
    start: { open: false, width: 18 },
  });
  assert.deepEqual(parseStoredAppShellState('{"start":{"open":"no"},"end":{"open":true}}'), {
    end: { open: true },
  });
  // The 0.x format, a bare boolean, starts over.
  assert.equal(parseStoredAppShellState('true'), undefined);
  assert.equal(parseStoredAppShellState('{'), undefined);
  assert.equal(parseStoredAppShellState(null), undefined);
});
