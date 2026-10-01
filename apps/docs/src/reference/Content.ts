import type { Reference } from './Types';

export const contentReferences: Reference[] = [
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
    related: ['chips', 'typography', 'input'],
  },
];
