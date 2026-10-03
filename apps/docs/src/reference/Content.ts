import type { Reference } from './Types';

export const contentReferences: Reference[] = [
  {
    id: 'code',
    title: 'Code',
    group: 'Content & guidance',
    example: `import { Code, CodeBlock, Text } from '@envsemble/envui';

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
      ['theme', 'VS Code Light+ or Dark+; follows Theme unless explicitly set'],
      ['appearance', 'surface (default) or plain without padding/background'],
      ['Native div props', 'Root ref, className, style and accessible attributes'],
    ],
    guidelines: [
      'Use Code inside prose and CodeBlock for multiline source. Source is selectable and never executed.',
      'Code blocks use the standard VS Code Light+ and Dark+ themes. Prose and controls retain envUI typography and spacing.',
      'Highlighting starts after the initial render and shares one runtime. Theme changes reuse the tokens. Unsupported languages remain plain text.',
      'Blocks above 50,000 characters or with a line above 2,000 characters stay plain text to avoid expensive highlighting.',
      'Copy uses the original source. If clipboard access is unavailable, the code is selected for manual copying.',
    ],
    related: ['typography', 'accessibility'],
  },
  {
    id: 'chips',
    presentation: 'compact',
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
    presentation: 'compact',
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
