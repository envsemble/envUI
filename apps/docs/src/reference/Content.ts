import type { Reference } from './Types';

export const contentReferences: Reference[] = [
  {
    id: 'markdown',
    title: 'Markdown',
    group: 'Content & guidance',
    example: `import { Markdown } from '@envsemble/envui/content';

<Markdown headingOffset={1} codeCopyable>{description}</Markdown>`,
    props: [
      ['children', 'A CommonMark/GFM Markdown string'],
      ['headingOffset', '0–5 added to semantic heading levels, capped at h6'],
      ['codeCopyable', 'Offer copying on rendered code blocks'],
      ['renderLink', 'Render safe hrefs using native anchor props and application routing'],
      ['Native div props', 'ref, className, style and accessible attributes'],
    ],
    usage: [
      {
        title: 'Render content',
        example: `import { Markdown } from '@envsemble/envui/content';

<Markdown headingOffset={1} codeCopyable>{description}</Markdown>`,
        props: [
          ['children', 'Markdown string'],
          ['headingOffset / codeCopyable', 'Heading semantics and code-copy controls'],
        ],
      },
      {
        title: 'Markdown source',
        example: `import { Markdown } from '@envsemble/envui/content';

const description = [
  '## Project checklist',
  '',
  'Prepare the **sample project** for review.',
  '- Review the [draft document](/documents/draft).',
  '',
  '\`\`\`json',
  '{ "enabled": true, "retries": 3 }',
  '\`\`\`',
].join('\\n');

<Markdown headingOffset={1} codeCopyable>{description}</Markdown>`,
        props: [
          [
            'Code fences',
            'Supply a language after the opening fence; code reuses the GitHub-themed CodeBlock',
          ],
          ['Inline code', 'Single backticks mark inline source within prose'],
        ],
      },
      {
        title: 'Application navigation',
        example: `import { Link } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';

<Markdown renderLink={({ href, children, ...props }) => (
  <Link {...props} href={href} onClick={event => {
    if (!event.defaultPrevented && event.button === 0 &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
        href.startsWith('/documents/')) {
      event.preventDefault();
      openDocumentPanel(href);
    }
  }}>{children}</Link>
)}>{description}</Markdown>`,
        props: [
          [
            'renderLink',
            'Keep real hrefs and preserve modified clicks; the application decides which routes open panels',
          ],
        ],
      },
    ],
    guidelines: [
      'Paragraphs, headings, lists, quotes and tables use envUI typography and spacing. Code blocks reuse CodeBlock with standard GitHub colors.',
      'Supports CommonMark plus GFM tables, strikethrough, task lists, automatic links and footnotes. Single source newlines follow standard paragraph behavior.',
      'Raw HTML is ignored and URLs retain the renderer’s safe protocol handling. Markdown is content, not executable components.',
      'Resource references are ordinary links with stable destination URLs. Labels are saved text; resource resolution, permissions and missing destinations belong to the application.',
      'Tables and code scroll within their own regions. Images keep their aspect ratio and fit the available width; image loading follows the supplied URL.',
      'Choose headingOffset to place a document below the surrounding page heading. Native semantic levels are retained, capped at h6.',
    ],
    related: ['markdown-editor', 'code', 'typography', 'accessibility'],
  },
  {
    id: 'code',
    title: 'Code',
    group: 'Content & guidance',
    example: `import { Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';

<Text>Use <Code>npm run build</Code> to build the application.</Text>
<CodeBlock language="tsx" copyable>{source}</CodeBlock>`,
    props: [
      ['Code', 'Native code attributes and inline content'],
      ['CodeBlock children', 'The original source string; whitespace and copying stay intact'],
      [
        'language',
        'JS/JSX, TS/TSX, Java, JSON, HTML, CSS, SQL, shell, YAML, Markdown, INI; aliases are supported',
      ],
      ['copyable / label', 'Optional copy control and source label'],
      ['wrap', 'Wrap long lines; otherwise scroll inside the block'],
      [
        'theme',
        'Defaults to GitHub Dark Default in both app themes; optional light or dark override',
      ],
      ['Native div props', 'Root ref, className, style and accessible attributes'],
    ],
    guidelines: [
      'Use Code inside prose and CodeBlock for multiline source. Source is selectable and never executed.',
      'Inline code and code blocks use GitHub Dark Default in both app themes. CodeBlock accepts an explicit light or dark override. Prose and controls retain envUI typography and spacing.',
      'Highlighting starts after the initial render and shares one runtime. App theme changes leave code colors unchanged; explicit code theme overrides reuse the tokens. Unsupported languages remain plain text.',
      'Blocks above 50,000 characters or with a line above 2,000 characters stay plain text to avoid expensive highlighting.',
      'Copy uses the original source. If clipboard access is unavailable, the code is selected for manual copying.',
    ],
    related: ['markdown', 'markdown-editor', 'typography', 'accessibility'],
  },
  {
    id: 'chips',
    title: 'Info chips',
    group: 'Content & guidance',
    summary: 'Read-only metadata beside related content.',
    example: `import { InfoChip, ActionGroup } from '@envsemble/envui';

<ActionGroup>
  <InfoChip>Optional</InfoChip>
  <InfoChip>3 members</InfoChip>
</ActionGroup>`,
    props: [['InfoChip', 'children and native span attributes']],
    guidelines: [
      'Use chips for short metadata. They have no hover, focus, filtering or selected state.',
      'Place metadata beside the content it describes. Use a button for an action or a selection control for a choice.',
    ],
    related: ['cards', 'typography', 'disclosures'],
  },
  {
    id: 'disclosures',
    title: 'Disclosure notes',
    group: 'Content & guidance',
    summary: 'Keep optional details collapsed until needed.',
    example: `import { DisclosureNote, Text } from '@envsemble/envui';

<DisclosureNote title="How visibility works">
  <Text>Team projects are available to every workspace member.</Text>
</DisclosureNote>`,
    props: [
      ['DisclosureNote title / children', 'One-line summary and optional detail'],
      ['open / onToggle', 'Native details state and event for controlled specimen state'],
      ['Native details props', 'ref, className and accessible attributes'],
    ],
    guidelines: [
      'Keep a disclosure title on one line. Put secondary guidance behind the disclosure and essential instructions beside the task.',
      'Use the native disclosure interaction. Keep labels short enough for the available width.',
    ],
    related: ['chips', 'typography', 'fields'],
  },
];
