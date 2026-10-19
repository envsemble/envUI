// The breakpoints constant and the media query hooks: the constant holds the breakpoint tokens'
// values, the queries of one breakpoint split the widths without a gap, and on the server and
// while hydrating the hooks return their default, whatever a browser would answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
      "export * from './packages/ui/src/foundations/breakpoints.ts';",
      "export * from './packages/ui/src/foundations/useMediaQuery.ts';",
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
const { breakpoints, breakpointQuery, useBreakpoint, useMediaQuery } = await import(
  pathToFileURL(output).href
);

test('breakpoints holds the values of the breakpoint tokens', async () => {
  const { tokens } = JSON.parse(
    await readFile(join(repository, 'packages/ui/src/generated/tokens.json'), 'utf8'),
  );
  const fromTokens = Object.fromEntries(
    tokens
      .filter((token) => token.id.startsWith('breakpoint.'))
      .map((token) => [token.id.slice('breakpoint.'.length), token.values.light.css]),
  );
  assert.deepEqual(breakpoints, fromTokens);
  assert.deepEqual(Object.keys(breakpoints), ['sm', 'md', 'lg', 'xl']);
  const widths = Object.values(breakpoints).map((width) => Number.parseFloat(width));
  assert.deepEqual(
    widths,
    [...widths].sort((a, b) => a - b),
    'the breakpoints run from the smallest',
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

function Probe({ query, breakpoint, options }) {
  const media = useMediaQuery(query, options);
  const wide = useBreakpoint(breakpoint, options);
  return h('output', null, `${media} ${wide}`);
}

test('on the server, and so while hydrating, the hooks return their default', () => {
  const { markup, queries } = renderOnServer(
    h(Probe, { query: '(prefers-reduced-motion: reduce)', breakpoint: 'md' }),
  );
  assert.equal(markup, '<output>false false</output>');
  assert.deepEqual(queries, [], 'the server snapshot asks no browser');
  assert.equal(
    renderOnServer(
      h(Probe, { query: '(hover: hover)', breakpoint: 'lg', options: { defaultValue: true } }),
    ).markup,
    '<output>true true</output>',
  );
});
