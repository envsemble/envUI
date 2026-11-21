import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { headersFor, parseHeaders, siteHeaders } from '../../scripts/site/SiteHeaders.ts';

test('the hosted site lets its own pages frame its pages, and no other site', () => {
  const headers = headersFor(siteHeaders(), '/index.html');
  assert.equal(headers['x-frame-options'], 'SAMEORIGIN');
  const policy = Object.fromEntries(
    (headers['content-security-policy'] ?? '').split(';').map((directive) => {
      const [name = '', ...values] = directive.trim().split(/\s+/);
      return [name, values];
    }),
  );
  assert.deepEqual(policy['frame-ancestors'], ["'self'"]);
  for (const path of ['/', '/components/button/overview', '/v0.7/', '/v0.7/index.html'])
    assert.deepEqual(headersFor(siteHeaders(), path), headers, path);
});

test('_headers rules collect in order, with removals and path patterns', () => {
  const rules = parseHeaders(
    [
      '# A comment',
      '/*',
      '  Cache-Control: no-cache',
      '  X-Robots-Tag: noindex',
      '',
      '/assets/:file',
      '  ! Cache-Control',
      '  Cache-Control: max-age=60',
      '/docs/*',
      '  X-Robots-Tag: nosnippet',
    ].join('\n'),
  );
  assert.deepEqual(headersFor(rules, '/'), {
    'cache-control': 'no-cache',
    'x-robots-tag': 'noindex',
  });
  assert.deepEqual(headersFor(rules, '/assets/a.js'), {
    'cache-control': 'max-age=60',
    'x-robots-tag': 'noindex',
  });
  assert.equal(headersFor(rules, '/assets/a/b.js')['cache-control'], 'no-cache');
  assert.equal(headersFor(rules, '/docs/a/b')['x-robots-tag'], 'noindex, nosnippet');
  assert.throws(() => parseHeaders('  Name: value'), /before any path/);
  assert.throws(() => parseHeaders('/*\n  Name value'), /not "Name: value"/);
});

test("a page's pre-rendered file is served with the headers of every page", () => {
  const page = headersFor(siteHeaders(), '/');
  for (const path of ['/components/button', '/docs', '/docs/components/button', '/foundations'])
    assert.deepEqual(headersFor(siteHeaders(), path), page, path);
  assert.match(page['cache-control'] ?? '', /\bno-cache\b/);
});

test("the host serves a page's address from its pre-rendered file, and any other from 404.html", () => {
  const config = readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8');
  assert.match(config, /"html_handling": "auto-trailing-slash"/);
  assert.match(config, /"not_found_handling": "404-page"/);
  assert.deepEqual(headersFor(siteHeaders(), '/404.html'), headersFor(siteHeaders(), '/'));
});

test('the host runs no script, so no request to the site counts toward the Workers quota', () => {
  const config = readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8');
  assert.doesNotMatch(config, /"main":/);
  assert.doesNotMatch(config, /"run_worker_first":/);
});

test("hashed files keep a year's cache from _headers, and every other header of the site", () => {
  const page = headersFor(siteHeaders(), '/');
  const asset = headersFor(siteHeaders(), '/assets/index-abc123.js');
  assert.equal(asset['cache-control'], 'private, max-age=31536000, immutable');
  assert.equal(asset['x-content-type-options'], 'nosniff');
  const withoutCache = (headers: Record<string, string>) =>
    Object.fromEntries(Object.entries(headers).filter(([name]) => name !== 'cache-control'));
  assert.deepEqual(withoutCache(asset), withoutCache(page));
});
