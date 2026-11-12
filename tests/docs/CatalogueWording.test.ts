// The catalogue's text: option tables read as legends, text with no structure or too long, and
// headings inside code fences.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { marked } from 'marked';
import {
  lastSubsection,
  longParagraphs,
  optionPieces,
  optionTable,
  optionTableProblems,
  paragraphLength,
  catalogueStructure,
  subsections,
} from '../../apps/site/src/documentation/CatalogueContent.ts';
import { pageFixture, switchBody, switchFrontmatter } from './DocumentationFixtures.ts';

test('an option table names each option in a few words, once, and says what it is for', async () => {
  await pageFixture(async ({ page, read, rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // An option table, whose last column is Use for, shows in the catalogue as a legend of tags:
    // each names its option in a few plain words, once, and says what it is for.
    const options = (rows) =>
      frontmatter +
      body.replace(
        'Two sizes, for a form and a dense list.',
        `Two sizes, for a form and a dense list.\n\n| Size | Use for |\n| ---- | ------- |\n${rows}\n`,
      );
    await rejects(
      options('| [Small](#small) | A dense list. |'),
      /Variants: row 1 of the Size table names its option with a link/,
    );
    await rejects(
      options('| Small | A dense list. |\n| Small | A table. |'),
      /row 2 of the Size table names Small again/,
    );
    await rejects(options('| Small |  |'), /row 1 of the Size table says nothing under Use for/);
    await rejects(
      options('| The small one, for dense lists. | A dense list. |'),
      /names its option "The small one, for dense lists\.": a name of a few words/,
    );
    await writeFile(page, options('| Small | A dense list. |'));
    assert.doesNotThrow(read);
  });
});

test('an option table is read for the catalogue as a legend', () => {
  const [table] = marked.lexer(
    [
      '| Variant | Tones | Use for |',
      '| ------- | ----- | ------- |',
      '| **Primary** | Neutral, accent | The main action of a group. |',
      '| `ghost` | Neutral | A toolbar. |',
      '',
    ].join('\n'),
  );
  const options = optionTable(table);
  assert.equal(options.column, 'Variant');
  assert.deepEqual(
    options.options.map(({ name, details, use }) => ({ name, details, use })),
    [
      {
        name: 'Primary',
        details: [{ title: 'Tones', markdown: 'Neutral, accent' }],
        use: 'The main action of a group.',
      },
      { name: 'ghost', details: [{ title: 'Tones', markdown: 'Neutral' }], use: 'A toolbar.' },
    ],
  );
  assert.deepEqual(optionTableProblems(options), []);
  // Only a table whose last column is Use for is an option table.
  assert.equal(
    optionTable(marked.lexer('| Key | Action |\n| --- | --- |\n| Tab | Moves. |\n')[0]),
    undefined,
  );
  // The catalogue's Markdown is cut at its option tables, keeping each table's source.
  const source = 'Intro.\n\n| Size | Use for |\n| --- | --- |\n| Small | Lists. |\n\nAfter.\n';
  const pieces = optionPieces(source);
  assert.deepEqual(
    pieces.map((piece) => ('options' in piece ? piece.options.options[0].name : piece.markdown)),
    ['Intro.\n\n', 'Small', 'After.\n'],
  );
  assert.equal(
    pieces.map((piece) => ('options' in piece ? piece.raw : piece.markdown)).join(''),
    source,
  );
});

test('Catalogue text with no structure is found: loose after a figure, or a fourth paragraph', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const figure = (role) => ({ kind: 'example', name: 'Figure', heading: 'Figure', role });
  const found = catalogueStructure({
    sections: [
      {
        id: 'rules',
        title: 'Rules',
        blocks: [
          markdown('## Rules\n\nOne paragraph opens the section.\n\n'),
          figure('do'),
          figure('dont'),
          markdown(
            'A lone sentence after the pairs.\n\n### Labels\n\nStart with a verb.\n\nPut the outcome in it.\n\nKeep it short.\n\nOne too many.\n\n',
          ),
          figure(),
        ],
      },
      {
        id: 'anatomy',
        title: 'Anatomy',
        // The sentence after an anatomy legend names what the figure can't show; it belongs to it.
        blocks: [
          markdown('## Anatomy\n\n'),
          figure('anatomy'),
          markdown('Not shown: the spinner.\n'),
        ],
      },
      {
        id: 'variants',
        title: 'Variants',
        blocks: [
          markdown(
            '## Variants\n\n| Size | Use for |\n| --- | --- |\n| Small | Lists. |\n\nLoose after the legend.\n\n### Tones\n\nIn a block.\n',
          ),
        ],
      },
      // The developer part is not the catalogue's.
      { id: 'code', title: 'Compose', blocks: [markdown('## Compose\n\nOne.\n\nTwo.\n')] },
    ],
  });
  assert.deepEqual(
    found.map(({ where, kind, text }) => `${where}, ${kind}: ${text}`),
    [
      'Rules, after a figure: A lone sentence after the pairs.',
      'Rules, too many paragraphs: One too many.',
      'Variants, after a figure: Loose after the legend.',
    ],
  );
});

test('long paragraphs of catalogue text are found, measured as people read them', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const long = `${'A sentence of words. '.repeat(12)}`.trim();
  const found = longParagraphs({
    sections: [
      {
        id: 'rules',
        title: 'Rules',
        blocks: [
          // A link counts as its words, not its address.
          markdown(
            `## Rules

Short, with [a link](${'../components/x.md'.repeat(20)}).

${long}
`,
          ),
        ],
      },
      {
        id: 'code',
        title: 'Compose',
        blocks: [
          markdown(`## Compose

${long}
`),
        ],
      },
    ],
  });
  assert.deepEqual(
    found.map(({ where, length }) => `${where}: ${length}`),
    [`Rules: ${long.length}`],
  );
  assert.ok(long.length > paragraphLength);
});

test("a heading in a fence's code is no heading, whichever marker opens it and whatever shorter fence it holds", () => {
  const fenced = [
    '````md',
    '```tsx',
    '```',
    '### In the code',
    '~~~',
    '### Still in the code',
    '````',
  ].join('\n');
  const markdown = `## Rules\n\nThe text.\n\n### Last\n\nText beside a figure.\n\n${fenced}\n`;
  assert.deepEqual(
    subsections(markdown).map((chunk) => chunk.split('\n')[0]),
    ['', '## Rules', '### Last'],
  );
  // The last subsection holds a fence, so no figure sits beside it.
  assert.equal(lastSubsection(markdown), undefined);
  assert.deepEqual(
    lastSubsection(`## Rules\n\n${fenced}\n\n### Last\n\nText.`)?.[1],
    '### Last\n\nText.',
  );
});
