import type { Reference } from './Types';

const buttonUsage = {
  title: 'Button',
  example: `import { Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

<Button variant="primary" startIcon={<Add />} onClick={createItem}>
  Create item
</Button>

<Button iconOnly icon={<Add />} aria-label="Create item" onClick={createItem} />

<Button href="/projects" variant="outlined">Open projects</Button>`,
  props: [
    ['variant', 'primary (default), important, secondary, outlined, destructive'],
    ['startIcon / endIcon', 'Optional React content beside the label'],
    [
      'iconOnly / icon',
      'Show only the supplied icon; size is square and corners follow the chosen variant',
    ],
    ['aria-label', 'Required accessible action name when iconOnly is true'],
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
    ['variant', 'Same variants as Button; secondary by default'],
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
      'Action buttons fit their content: 2.5 rem minimum height (2 rem for important), 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.',
      'Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.',
      'Secondary buttons use the neutral row fill and label color, without a border. Outlined buttons retain their border and link color.',
      'Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.',
      'Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.',
      'Labeled and icon-only buttons share the 1.5 rem control icon size used by NavigationItem. Leading and trailing icons follow the same rule, including important buttons.',
      'Every variant supports iconOnly: a square matching its regular button height (2 rem for important; 2.5 rem for the others). Corners, colors, borders and interaction states follow the chosen variant: important is a rounded square; the others are circles. Name the action, rather than the icon shape.',
      'IconButton is a shorthand for Button with iconOnly enabled and variant="secondary" by default.',
    ],
    related: ['layout', 'colors', 'icons', 'accessibility'],
  },
];
