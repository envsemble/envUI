import type { Reference } from './Types';

export const foundations: Reference[] = [
  {
    id: 'colors',
    title: 'Colors & themes',
    group: 'Foundations',
    example: `import { Theme, Button, useTheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

function SaveButton() {
  const theme = useTheme();
  return <Button>Save in {theme} theme</Button>;
}

<Theme theme="dark"><SaveButton /></Theme>`,
    props: [
      ['Theme theme', 'Required: light or dark; scopes tokens and provides React theme context'],
      ['Theme native props', 'children, ref, className, style and native div attributes'],
      ['useTheme()', 'Returns the current theme, including across library portals'],
      ['Theme preference', 'The application owns selection, persistence and system preference'],
    ],
    guidelines: [
      'Use palette base colors. Derive states centrally; do not add separate hover or pressed palette entries.',
      'Below 50% HSL lightness, add lightness; otherwise subtract it. Hover shifts 10 points, press shifts 20, and results clamp to 0–100%. Disabled opacity is 0.48.',
      'Matching colors share a hue across themes. Saturation and lightness may differ; distinct semantic exceptions retain their own hues. Focus uses text color in light and link color in dark.',
      'Selected navigation mixes 13% link color with its surface. Card action strips mix 35% muted surface with the parent surface.',
      'Scope content with Theme. Nested boundaries and portaled components retain the originating theme.',
    ],
    related: ['surface', 'buttons', 'navigation', 'motion'],
  },
  {
    id: 'typography',
    title: 'Typography',
    group: 'Foundations',
    example: `import { Text, Stack } from '@envsemble/envui';

<Stack>
  <Text as="h1" variant="page-heading">Project overview</Text>
  <Text tone="muted">Shared context for your team.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>`,
    props: [
      ['Text variant', 'body (default), page-heading, section-heading, supporting or caption'],
      ['Text tone', 'Optional primary, muted or quiet override of the variant’s default color'],
      ['Text as', 'Native text tag; p (default), span, small, strong or h1–h6'],
      ['Native element props', 'children, ref, className and accessible attributes'],
    ],
    guidelines: [
      'Use Inter at regular (400) or medium (500) weight, with 1.4 line height. The preview orders styles by emphasis.',
      'Choose the semantic element separately from its visual style. Use actual headings for document structure.',
      'Text applies the shared scale and palette. Supporting text is small and muted; captions are small and quiet.',
      'Text adds no outer spacing. Stack or the containing component owns the gaps.',
    ],
    related: ['colors', 'layout', 'cards'],
  },
  {
    id: 'spacing',
    title: 'Spacing & shape',
    group: 'Foundations',
    example: `import { Surface, Stack, Text } from '@envsemble/envui';

<Surface padding={5} render={<Stack gap={4} />}>
  <Text as="h2" variant="section-heading">Workspace</Text>
  <Text>Padding is inside the surface; gap is between its children.</Text>
</Surface>`,
    props: [
      ['Spacing steps 1–9', '0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3 and 4 rem'],
      ['Step 0', 'Removes padding or gap where the component supports it'],
      ['Outer corners', '1.75 rem for panes, cards and the outside of a row group'],
      ['Standard corners', '0.5 rem for inner rows, important actions, toasts and chips'],
      [
        'Other shapes',
        'Fully rounded actions/navigation; circles for icon buttons; 0.25 rem checkboxes',
      ],
    ],
    guidelines: [
      'Use relative units and the shared spacing scale. The parent owns gaps; each component owns its internal padding.',
      'Text has no outer margins. Cards already space direct children; Stack and ActionGroup supply other layouts.',
      'Use component defaults for geometry. Choose Surface for a plain pane and Card for a content surface.',
      'Grouped rows keep large outside corners and compact inside joins. Their component page owns the complete row behavior.',
    ],
    related: ['layout', 'surface', 'cards', 'rows', 'responsive'],
  },
  {
    id: 'icons',
    title: 'Icons & assets',
    group: 'Foundations',
    example: `import { Icon, EnvUILogo, BrandLogo, Stack } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

<Stack>
  <EnvUILogo />
  <BrandLogo />
  <Home filled label="Home" />
  <Icon viewBox="0 0 24 24" label="Custom mark">
    <path d="M12 2 22 12 12 22 2 12Z" />
  </Icon>
</Stack>`,
    props: [
      ['Material symbols', 'Explicit imports from @envsemble/envui/icons or individual icon paths'],
      [
        'filled',
        'Standalone symbols choose outline or filled; navigation and tabs manage selection fill',
      ],
      ['Icon label', 'Accessible name for a meaningful standalone SVG; omit for decoration'],
      ['SVG props', 'width, height, viewBox, ref and accessible SVG attributes'],
      ['EnvUILogo / BrandLogo', 'Bundled lockups; inherit context color and accept SVG props'],
      [
        'Custom icons',
        'Controls accept React icon content; Icon supplies optional shared SVG defaults',
      ],
    ],
    guidelines: [
      'Use the bundled official Material Symbols Rounded. Symbols load locally; no remote icon font or SVG loader is required.',
      'Icons inherit their context color. Navigation and tabs choose selected fill automatically.',
      'Decorative icons stay hidden from assistive technology. Standalone meaningful icons need labels; icon-only controls need accessible action names.',
      'Use bundled brand assets rather than recreating the marks.',
    ],
    related: ['icon-buttons', 'navigation', 'tabs', 'motion'],
  },
  {
    id: 'responsive',
    title: 'Responsive layout',
    group: 'Foundations',
    example: `import { Card, Text, ActionGroup, Button } from '@envsemble/envui';

<Card>
  <Text as="h2" variant="section-heading">Autumn release</Text>
  <Text>Let content wrap within the available space.</Text>
  <ActionGroup stacked>
    <Button>Save changes</Button>
    <Button variant="secondary">Cancel</Button>
  </ActionGroup>
</Card>`,
    props: [
      [
        'ActionGroup stacked',
        'Stacks label buttons at full group width; circular icons retain their size',
      ],
      [
        'Control minimums',
        '2 rem action buttons and select triggers; 2.5 rem text inputs and navigation',
      ],
      ['Coarse pointers', 'Shared 2.75 rem touch minimum; controls can grow with content'],
      [
        'Layout breakpoints',
        'Chosen by the application; no separate mobile theme or component set',
      ],
    ],
    guidelines: [
      'Reflow the layout, wrap text and let controls grow with content. Use relative units.',
      'Use wrapped action rows when space permits and stacked actions when labels need more room.',
      'The library adapts touch targets to input capability. The application chooses layout breakpoints; feature cards adapt to their containing block.',
    ],
    related: ['layout', 'cards', 'input', 'spacing'],
  },
  {
    id: 'motion',
    title: 'Motion & accessibility',
    group: 'Foundations',
    example: `import { Stack, Input, IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Stack>
  <Input label="Project name" hint="Visible labels stay available while typing." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Stack>`,
    props: [
      ['Transition tokens', '--motion-duration-fast (0.12 s), --motion-duration-medium (0.16 s)'],
      ['Shared easing', '--motion-ease: cubic-bezier(0.45, 0, 0.2, 1)'],
      ['Focus ring', 'Shared 0.125 rem outline; keyboard order follows the visible layout'],
      ['Reduced motion', 'Library transitions respect prefers-reduced-motion automatically'],
      [
        'Content semantics',
        'The application supplies meaningful labels, headings and link destinations',
      ],
    ],
    guidelines: [
      'Keep motion brief and tied to a state change. Respect reduced motion in any application animations too.',
      'Give controls visible labels and icon actions accessible names. Preserve native form behavior and disabled states.',
      'Use semantic headings, meaningful links and a keyboard order that follows the visible layout.',
      'Library components handle their focus, keyboard and announcement behavior. Their own pages document those contracts.',
      'Validate product content and contrast in both supported themes.',
    ],
    related: ['input', 'select', 'tabs', 'dialogs', 'toasts'],
  },
];
