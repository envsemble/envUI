import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withoutComments } from '../scripts/site/CssComments.ts';

test("the site's style sheets lose their comments and keep their rules and values as written", () => {
  const css = [
    '/* A component: what it is. */',
    '@layer env.components {',
    '  /* Its root. */',
    '  .env-card {',
    '    --env-card-fill: hsl(210 40% 96%); /* the fill */',
    '    padding: var(--env-space-4);',
    '  }',
    '}',
  ].join('\n');
  assert.equal(
    withoutComments(css),
    [
      '@layer env.components {',
      '  .env-card {',
      '    --env-card-fill: hsl(210 40% 96%); ',
      '    padding: var(--env-space-4);',
      '  }',
      '}',
    ].join('\n'),
  );
});

test("a comment's characters in a string stay, escaped quotes included", () => {
  const css = `.a::before { content: "/* not a comment */"; } .b::after { content: 'it\\'s /* text */'; }`;
  assert.equal(withoutComments(css), css);
});
