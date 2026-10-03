import type { Reference } from './Types';

const buttonUsage = {
  title: 'Button',
  example: `import { Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

<Button variant="primary" startIcon={<Add />} onClick={createItem}>
  Create item
</Button>

<Button href="/projects" variant="outlined">Open projects</Button>`,
  props: [
    ['variant', 'primary (default), important, secondary, outlined, destructive'],
    ['startIcon / endIcon', 'Optional React content beside the label'],
    ['href', 'Render a native link with the same button appearance; omit for a native button'],
    [
      'Native action props',
      'disabled, type/onClick or anchor attributes, ref and accessible attributes',
    ],
  ],
} satisfies NonNullable<Reference['usage']>[number];

const iconButtonUsage = {
  title: 'IconButton',
  example: `import { IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<IconButton icon={<ChevronRight />} aria-label="Next item" onClick={next} />`,
  props: [
    ['icon', 'React icon content'],
    ['aria-label', 'Required accessible action name'],
    ['Native button props', 'disabled, type, onClick and ref'],
  ],
} satisfies NonNullable<Reference['usage']>[number];

export const actionsReferences: Reference[] = [
  {
    id: 'buttons',
    title: 'Buttons',
    group: 'Actions',
    example: buttonUsage.example,
    props: buttonUsage.props,
    usage: [buttonUsage, iconButtonUsage],
    guidelines: [
      'Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.',
      'Action buttons fit their content: 2 rem minimum height, 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.',
      'Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.',
      'Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.',
      'Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.',
      'Use a 2.5 rem circle with a centered 1.5 rem icon and 0.5 rem inset.',
      'Use the tonal row fill and neutral icon. Name the action, rather than describing the icon shape.',
    ],
    related: ['layout', 'colors', 'icons', 'accessibility'],
  },
];
