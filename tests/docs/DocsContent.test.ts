// What the Docs show of a page beside the catalogue (scripts/docs/model/DocsContent.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.ts';

const { raisedHeadings, guideSubsections, withoutAgentNote } = await importSource(
  'DocsContent',
  'scripts/docs/model/DocsContent.ts',
);

test('raises #### headings a level, but not inside a code fence', () => {
  const markdown = '#### Sizes\n\n````md\n#### Kept\n```\n#### Still kept\n````\n\n##### Rows';
  assert.equal(
    raisedHeadings(markdown),
    '### Sizes\n\n````md\n#### Kept\n```\n#### Still kept\n````\n\n#### Rows',
  );
});

test("cuts Compose into its ### subsections, with each one's example sources", () => {
  const sections = [
    {
      id: 'code',
      title: 'Compose',
      blocks: [
        { kind: 'markdown', markdown: '## Compose\n\n### Usage\n\nPlace it.\n\n### Customize\n' },
        { kind: 'source', name: 'Custom' },
      ],
    },
  ];
  assert.deepEqual(guideSubsections(sections), [
    { title: 'Usage', content: [{ kind: 'markdown', markdown: '\nPlace it.\n\n' }] },
    { title: 'Customize', content: [{ kind: 'source', name: 'Custom' }] },
  ]);
});

test("takes the setup guide's note on coding agents out of its Markdown", () => {
  const markdown = '## Install\n\nRun it.\n\n## Coding agents\n\nThey read the docs.\n\n## Next\n';
  assert.deepEqual(withoutAgentNote(markdown), {
    markdown: '## Install\n\nRun it.\n\n## Next\n',
    note: 'They read the docs.',
  });
  assert.deepEqual(withoutAgentNote('## Install\n'), { markdown: '## Install\n' });
});
