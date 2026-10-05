import type { Reference } from './Types';

const markdownEditorReference = {
  usage: [
    {
      title: 'Edit and preview',
      example: `import { MarkdownEditor } from '@envsemble/envui/content';

<MarkdownEditor variant="outlined" sizing="content" label="Description" name="description"
  value={description} onValueChange={setDescription}
  previewProps={{ headingOffset: 1, codeCopyable: true }} />`,
      props: [
        ['value / defaultValue', 'Controlled or initial Markdown source string'],
        ['onValueChange', 'Receives the complete updated source after typing, formatting or undo'],
        ['variant', 'Source field appearance: "outlined" (default) or "plain"'],
        [
          'sizing / rows',
          'Shared textarea sizing: fixed (default) scrolls and resizes from the bottom edge; content grows and shrinks',
        ],
        ['toolbar', 'Heading, bold, italic, lists, quote, code and link commands; false hides it'],
        [
          'preview / previewProps',
          'Write/Preview tabs and shared Markdown rendering; preview defaults to true',
        ],
        ['onRequestLink', 'Return { label, href }, null, or a Promise from an application picker'],
        ['label / hint / error', 'Shared field presentation and accessible connections'],
        [
          'Native textarea props',
          'name, rows, required, maxLength, disabled, readOnly, form, ref and source-control styling',
        ],
      ],
    },
    {
      title: 'Application link picker',
      example: `import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/content';

// The application supplies its search and picker. Resolve null to cancel.
async function requestLink({ selectedText }: { selectedText: string }):
  Promise<MarkdownLink | null> {
  const resource = await openResourcePicker();
  return resource ? {
    label: selectedText || resource.name,
    href: resource.url,
  } : null;
}

<MarkdownEditor variant="outlined" sizing="content" label="Description"
  value={description} onValueChange={setDescription}
  onRequestLink={requestLink} />`,
      props: [
        ['onRequestLink', 'Receives selectedText; use any application-owned picker'],
        ['Without a callback', 'The editor opens its standard text-and-URL link dialog'],
      ],
    },
  ],
  guidelines: [
    'Use MarkdownEditor for formatted prose, Textarea for plain text. The stored value remains an ordinary Markdown string; syntax stays visible while editing.',
    'Preview uses Markdown with envUI prose typography and standard GitHub code-block colors. The source control reuses Textarea geometry and states, including fixed or content sizing.',
    'Formatting and typing share bounded undo/redo history. Ctrl/Cmd+B, I and K apply enabled bold, italic and link commands. Ctrl/Cmd+Z undoes; Shift+Z or Y redoes. Toolbar arrow keys move between actions.',
    'The editor retains native selection, paste and composition. Formatting waits until composition ends; toolbar actions restore the selection to the source.',
    'Native forms submit the source even while Preview is visible. Uncontrolled form reset restores defaultValue; controlled reset retains value, so the application resets its own draft. Replacing the controlled document clears its editing history.',
    'Preview renders when first opened, then retains its mounted state while inactive. Write edits are parsed on the next preview activation; visible previews reflect current source and rendering options.',
    'maxLength constrains typing and formatting. disabled and readOnly prevent edits; validation, persistence and save/cancel actions belong to the application.',
    'Link insertion escapes saved labels and destinations. If the source changes while a picker is open, the insertion is rejected rather than overwriting newer text. Search, permissions and routes remain application responsibilities.',
  ],
} satisfies Pick<Reference, 'usage' | 'guidelines'>;

export const contentReferences: Reference[] = [
  {
    id: 'markdown',
    title: 'Markdown',
    summary:
      'Render Markdown strings with Markdown, or edit them with MarkdownEditor and its shared preview.',
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
      ...markdownEditorReference.usage,
    ],
    guidelines: [
      'Markdown renders a string supplied by your application. MarkdownEditor adds source editing, formatting and a preview that uses the same Markdown renderer. Both work with ordinary Markdown strings.',
      'Paragraphs, headings, lists, quotes and tables use envUI typography and spacing. Code blocks reuse CodeBlock with standard GitHub colors.',
      'Supports CommonMark plus GFM tables, strikethrough, task lists, automatic links and footnotes. Single source newlines follow standard paragraph behavior.',
      'Raw HTML is ignored and URLs retain the renderer’s safe protocol handling. Markdown is content, not executable components.',
      'Resource references are ordinary links with stable destination URLs. Labels are saved text; resource resolution, permissions and missing destinations belong to the application.',
      'Tables and code scroll within their own regions. Images keep their aspect ratio and fit the available width; image loading follows the supplied URL.',
      'Choose headingOffset to place a document below the surrounding page heading. Native semantic levels are retained, capped at h6.',
      ...markdownEditorReference.guidelines,
    ],
    related: ['code', 'fields', 'typography', 'accessibility'],
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
    related: ['markdown', 'typography', 'accessibility'],
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
