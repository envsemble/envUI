import assert from 'node:assert/strict';
import { test } from 'node:test';
import { headersFor, parseHeaders, siteHeaders } from '../scripts/site/SiteHeaders.ts';

test('the hosted site lets its own pages frame its pages, and no other site', () => {
  // The template pages show each screen in an iframe of the site's frame route, ?frame=, which a
  // page load answers with index.html under the rule for every page.
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
