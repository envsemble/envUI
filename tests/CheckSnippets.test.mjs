import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkSnippets, extractSnippets, wrapSnippet } from '../scripts/docs/CheckSnippets.ts';

// scripts/docs/CheckSnippets.ts: which fences it reads, how it makes a fragment a module, and which
// diagnostics it keeps. `npm run docs:snippets` runs it on the pages.

const fence = (info, ...lines) => ['```' + info, ...lines, '```'].join('\n');

test('it reads the ts and tsx fences but those that place an example or opt out', () => {
  const markdown = [
    '# Page',
    fence('tsx', '<Button>Save</Button>'),
    fence('ts', "toast.show({ message: 'Saved' });"),
    fence('tsx figure=ButtonAnatomy'),
    fence('tsx source=SaveChanges', ''),
    fence('tsx nocheck', '<Button … />'),
    fence('css', '.a {}'),
    fence('tsx recipe', 'export {};'),
    '````md',
    fence('tsx', '<Inside />'),
    '````',
  ].join('\n\n');
  const snippets = extractSnippets(markdown, 'docs/page.md');
  assert.deepEqual(
    snippets.map(({ line, lang, code }) => ({ line, lang, code })),
    [
      { line: 4, lang: 'tsx', code: '<Button>Save</Button>' },
      { line: 8, lang: 'ts', code: "toast.show({ message: 'Saved' });" },
      { line: 27, lang: 'tsx', code: 'export {};' },
    ],
  );
});

test('top-level JSX becomes one expression per run, on the same lines', () => {
  assert.equal(wrapSnippet('<A />\n<B>\n  text\n</B>;'), 'void (<><A />\n<B>\n  text\n</B></>);');
  assert.equal(
    wrapSnippet('const [open, setOpen] = useState(false);\n\n<A open={open} />\n'),
    'const [open, setOpen] = useState(false);\n\nvoid (<><A open={open} /></>);\n',
  );
  assert.equal(
    wrapSnippet('<A\n  value={`Northwind Hall\n12 Harbour Street`}\n/>\n// A comment\n<B />'),
    'void (<><A\n  value={`Northwind Hall\n12 Harbour Street`}\n/></>);\n// A comment\nvoid (<><B /></>);',
  );
  assert.equal(
    wrapSnippet("{ label: 'Reports', href: '/reports' }"),
    "void ({ label: 'Reports', href: '/reports' });",
  );
  assert.equal(
    wrapSnippet('function A() {\n  return <B />;\n}'),
    'function A() {\n  return <B />;\n}',
  );
});

test('it reports where a snippet disagrees with envUI, and nothing a fragment assumes', () => {
  const snippet = (code, lang = 'tsx') => ({ file: 'docs/page.md', line: 10, lang, code });
  const snippets = [
    // Reported: a wrong value, an unknown prop, a missing required prop.
    snippet(
      '<Button variant="bogus">Save</Button>\n<Button frobnicate>Save</Button>\n<Tree aria-label="Files" items={rows} />',
    ),
    // Reported: an import an entry doesn't export, a member a namespace lacks, an unknown key.
    snippet(
      "import { NotAThing } from '@envsemble/envui';\n<Accordion.Rooot />\n<EnvUIProvider messages={{ calendarHeatmap: { lesss: 'Quieter' } }}>…</EnvUIProvider>",
    ),
    // Reported: a component neither declared nor exported, such as one envUI renamed.
    snippet('<LoadingBar>\n  <App />\n</LoadingBar>'),
    // Reported: an option toast.show doesn't take, toast being what useToast returns.
    snippet("toast.show({ messag: 'Saved' });", 'ts'),
    // Ignored: names the snippet assumes, modules other than envUI's, errors of its own code, and
    // a DOM global it means as its own variable.
    snippet(
      "import { Link } from 'some-router';\nconst count: number = 'one';\n<Popover open={open} onOpenChange={setOpen} trigger={<Button>More</Button>}>{content}</Popover>",
    ),
    // Reported once: a snippet that doesn't parse.
    snippet('<Button … />'),
    // Not envUI code at all, so not checked.
    snippet('<html lang="en" suppressHydrationWarning>'),
  ];
  const { findings, checked } = checkSnippets(snippets);
  assert.equal(checked.length, snippets.length - 1);
  assert.deepEqual(
    findings.map(({ line, code }) => [line, code]),
    [
      [10, 2322],
      [11, 2322],
      [12, 2739],
      [10, 2305],
      [11, 2551],
      [12, 2561],
      [10, 'tag'],
      [10, 2561],
      [10, 'parse'],
    ],
  );
  assert.match(findings[0].message, /"bogus"/);
  assert.match(findings[1].message, /frobnicate/);
  assert.match(findings[6].message, /<LoadingBar>/);
});
