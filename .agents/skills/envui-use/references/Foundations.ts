import type { Reference } from './Types';
import { compositionReference } from './Composition';

export const foundations: Reference[] = [
  {
    id: 'colors',
    title: 'Colors & themes',
    group: 'Foundations',
    summary: 'Semantic colors that carry the same purpose across light and dark themes.',
    example: `import { Theme, Text, useTheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

function ThemeLabel() {
  const theme = useTheme();
  return <Text>Current theme: {theme}</Text>;
}

<Theme theme="dark"><ThemeLabel /></Theme>`,
    props: [
      ['Theme theme', 'Required: light or dark; scopes tokens and provides React theme context'],
      ['Theme native props', 'children, ref, className, style and native div attributes'],
      ['useTheme()', 'Returns the current theme, including across library portals'],
      ['Theme preference', 'The application owns selection, persistence and system preference'],
    ],
    guidelines: [
      'Use separate semantic color roles for distinct primitive purposes, such as surfaces, rows, buttons, fields, navigation and feedback. Composed components reuse their underlying primitives’ colors. Derive hover and pressed states from each primitive’s base centrally.',
      'Light theme uses colors sampled from Chrome Web Store and Google Ads: a white page canvas, cool pale panes, soft gray cards and rows, white direction links, and blue actions and selection.',
      'Use the same semantic color role for a component in both themes. Change the theme palette values rather than switching which role the component uses.',
      'Below 50% HSL lightness, add lightness; otherwise subtract it. Controls shift 10 points on hover and 20 on press; cards and selectable rows use gentler 2-point hover and 4-point pressed shifts. Results clamp to 0–100%. Disabled opacity is 0.48.',
      'Each role keeps the same purpose across themes. Its hue, saturation and lightness can differ between palettes. Focus has its own role, with blue defaults in both themes.',
      'Tabs reuse the supplied Button or NavigationItem colors, and their rail uses Surface. Cards, dialog shells and menus reuse Surface tones. IconButton and inline Link reuse Button variants; Select shares secondary Button and field colors.',
      'Navigation selection, radio selection and selected Select options have separate roles. Card action strips, dialog backdrops, field validation and toast fills also have their own purposes; composed action buttons retain Button colors.',
      'Scope content with Theme. Nested boundaries and portaled components retain the originating theme.',
    ],
    related: ['surface', 'buttons', 'navigation', 'color-picker', 'accessibility'],
  },
  {
    id: 'typography',
    title: 'Typography',
    group: 'Foundations',
    summary: 'Shared styles for headings, body copy and supporting text.',
    example: `import { Text, Stack } from '@envsemble/envui';

<Stack>
  <Text as="h1" variant="page-heading">Project overview</Text>
  <Text as="h2" variant="section-heading">Project details</Text>
  <Text>Shared context for your team.</Text>
  <Text variant="supporting">Notes for the project.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>

<Stack>
  <Text as="h3" variant="page-heading">Project overview</Text>
  <Text tone="muted">Shared project context.</Text>
  <Text tone="quiet">Updated today.</Text>
  <Text>Project status: <Text as="span" tone="muted">Draft</Text></Text>
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
    summary: 'A shared scale for space, corners and controls that grow with content.',
    example: `import { Surface, Stack, Text } from '@envsemble/envui';

<Surface padding={5} render={<Stack gap={4} />}>
  <Text as="h2" variant="section-heading">Workspace</Text>
  <Text>Padding is inside the surface; gap is between its children.</Text>
</Surface>`,
    props: [
      ['Spacing steps 1–9', '0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3 and 4 rem'],
      ['Step 0', 'Removes padding or gap where the component supports it'],
      ['Touch minimum', '2.75 rem for coarse pointers; controls can grow with content'],
      ['Outer corners', '1.75 rem for panes, cards and the outside of a row group'],
      ['Standard corners', '0.5 rem for inner rows, important actions, toasts and chips'],
      [
        'Other shapes',
        'Fully rounded actions/navigation; icon-only actions keep their variant corners; 0.25 rem checkboxes',
      ],
    ],
    guidelines: [
      'Use relative units and the shared spacing scale. The parent owns gaps; each component owns its internal padding.',
      'Theme supplies scoped border-box sizing. Text, controls and layout children shrink to their container; long labels wrap. Rem and em dimensions follow browser text settings without shrinking the whole interface on a phone.',
      'FeatureCard responds to its own width. Dialogs, selects and notification stacks fit the viewport; code, tables, toolbars and crowded connected controls scroll within their own regions.',
      'Applications own page grids, breakpoints and custom content. Use minmax(0, 1fr) for grid tracks, min-inline-size: 0 for flex children and max-inline-size: 100% for media. Avoid fixed pixel widths and heights; retain content-driven height and a viewport meta tag.',
      'Let text wrap and controls grow with content. The application chooses layout breakpoints; there is no separate mobile theme or component set.',
      'Text has no outer margins. Cards already space direct children; Stack and ActionGroup supply other layouts.',
      'Use component defaults for geometry. Choose Surface for a plain pane and Card for a content surface.',
      'Grouped rows keep large outside corners and compact inside joins. Their component page owns the complete row behavior.',
    ],
    related: ['layout', 'surface', 'cards', 'rows', 'composition'],
  },
  compositionReference,
  {
    id: 'icons',
    title: 'Icons & assets',
    group: 'Foundations',
    summary: 'Local Material Symbols and official brand assets, ready to use.',
    example: `import { Icon, EnvUILogo, BrandLogo, Stack } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import logoUrl from '@envsemble/envui/assets/envUI/envUI-lockup-black.svg';
import faviconUrl from '@envsemble/envui/assets/envUI/envUI-favicon.ico';

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
        'Raw assets',
        'Bundler imports from @envsemble/envui/assets/*; fixed-color SVGs and ICO favicons',
      ],
      [
        'Custom icons',
        'Controls accept React icon content; Icon supplies optional shared SVG defaults',
      ],
    ],
    guidelines: [
      'Use the bundled official Material Symbols Rounded. Symbols load locally; no remote icon font or SVG loader is required.',
      'Search the offline catalogue by name and copy its exact per-icon import. Individual imports avoid loading the full catalogue in product development.',
      'Icons inherit their context color. Navigation and tabs choose selected fill automatically.',
      'Decorative icons stay hidden from assistive technology. Standalone meaningful icons need labels; icon-only controls need accessible action names.',
      'Use bundled brand assets rather than recreating the marks.',
      'Raw envUI assets include envUI-lockup-black.svg, envUI-lockup-white.svg, envUI-favicon.ico and envUI-favicon-white.ico in assets/envUI/. The raw envsemble logo is assets/envsemble-lockup-black.svg.',
    ],
    related: ['buttons', 'navigation', 'tabs', 'accessibility'],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    group: 'Foundations',
    summary: 'Keyboard access, visible focus and clear guidance across shared controls.',
    example: `import { Stack, Input, IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Stack>
  <Input label="Project name" hint="Visible labels stay available while typing." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Stack>`,
    props: [
      [
        'Library ownership',
        'Native control semantics, connected field guidance, keyboard behavior, modal focus and toast announcements',
      ],
      [
        'Application ownership',
        'Labels, heading structure, reading order, product validation and recovery actions',
      ],
      [
        'Keyboard',
        'Tab / Shift+Tab move focus; Enter activates links; Enter / Space activate buttons',
      ],
      [
        'Focus',
        'Text fields recolor their thin border or underline; other controls use the shared 0.125 rem focus ring',
      ],
      ['Reduced motion', 'Library transitions respect prefers-reduced-motion automatically'],
      ['Transition tokens', '--motion-duration-fast (0.12 s), --motion-duration-medium (0.16 s)'],
      ['Shared easing', '--motion-ease: cubic-bezier(0.45, 0, 0.2, 1)'],
    ],
    guidelines: [
      'Use Tab and Shift+Tab to move focus. Keep a visible focus indicator and a keyboard order matching the layout. Specific arrow-key and Escape behavior belongs to each component.',
      'Keep motion brief and tied to a state change. Respect reduced motion in application animations too.',
      'Give controls visible labels and icon actions accessible names. Preserve native form behavior and disabled states.',
      'Use semantic headings, meaningful links and a keyboard order that follows the visible layout.',
      'Library components handle their focus, keyboard and announcement behavior. Their own pages document those contracts.',
      'Validate product content and contrast in both supported themes.',
    ],
    related: ['fields', 'select', 'tabs', 'dialogs', 'toasts'],
  },
];
