import assert from 'node:assert/strict';
import { test } from 'node:test';
import { highlightCode } from '../packages/ui/dist/content/internal/CodeHighlighting.js';

test('concurrent cold highlighting consumers share one token matrix', async (context) => {
  const source = Array.from({ length: 40 }, (_, index) => `const value${index} = ${index};`).join(
    '\n',
  );
  const requests = await Promise.all(
    Array.from({ length: 24 }, () => highlightCode(source, 'javascript')),
  );
  const matrices = new Set(requests);
  context.diagnostic(
    `${requests.length} concurrent requests produced ${matrices.size} token matrix`,
  );
  assert.equal(matrices.size, 1);
  assert.equal(
    requests[0].map((line) => line.map((token) => token.content).join('')).join('\n'),
    source,
  );
  assert.ok(requests[0].flat().some((token) => token.light.color && token.dark.color));
  assert.equal(await highlightCode(source, 'javascript'), requests[0]);
});
