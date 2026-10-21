// The frame's breakpoints and the private media query hook that AppShell and Sidebar use: the
// queries of one breakpoint split the widths without a gap, and on the server and while hydrating
// the hook returns its default, whatever a browser would answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/ResponsiveHooks.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: [
      "export * from './packages/ui/src/navigation/app-shell/frameBreakpoints.ts';",
      "export * from './packages/ui/src/internal/useMediaQuery.ts';",
    ].join('\n'),
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: output,
  logLevel: 'error',
});
const { breakpoints, breakpointQuery, useMediaQuery } = await import(pathToFileURL(output).href);

test('the frame breakpoints run from the smallest', () => {
  assert.deepEqual(Object.keys(breakpoints), ['sm', 'md', 'lg', 'xl']);
  const widths = Object.values(breakpoints).map((width) => Number.parseFloat(width));
  assert.deepEqual(
    widths,
    [...widths].sort((a, b) => a - b),
  );
});

test('breakpointQuery splits the widths at a breakpoint without a gap', () => {
  assert.equal(breakpointQuery('md'), '(width >= 48rem)');
  assert.equal(breakpointQuery('md', 'up'), '(width >= 48rem)');
  assert.equal(breakpointQuery('md', 'down'), '(width < 48rem)');
  assert.equal(breakpointQuery('xl', 'down'), '(width < 80rem)');
});

/** Renders the hooks' results on the server, with a browser's matchMedia that matches anything. */
function renderOnServer(element) {
  const queries = [];
  globalThis.window = {
    matchMedia(query) {
      queries.push(query);
      return { matches: true, addEventListener() {}, removeEventListener() {} };
    },
  };
  try {
    return { markup: renderToString(element), queries };
  } finally {
    delete globalThis.window;
  }
}

function Probe({ query, options }) {
  const media = useMediaQuery(query, options);
  const wide = useMediaQuery(breakpointQuery('lg'), options);
  return h('output', null, `${media} ${wide}`);
}

test('on the server, and so while hydrating, the hook returns its default', () => {
  const { markup, queries } = renderOnServer(
    h(Probe, { query: '(prefers-reduced-motion: reduce)' }),
  );
  assert.equal(markup, '<output>false false</output>');
  assert.deepEqual(queries, [], 'the server snapshot asks no browser');
  assert.equal(
    renderOnServer(h(Probe, { query: '(hover: hover)', options: { defaultValue: true } })).markup,
    '<output>true true</output>',
  );
});
