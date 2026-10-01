export const setupCode = `import { Theme, Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons';
import '@envsemble/envui/styles.css';

export function App() {
  return <Theme theme="light">
    <Button startIcon={<Add />}>Create item</Button>
  </Theme>;
}`;

export const registryCode = `# Project .npmrc
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}`;
export const installCode = `npm install @envsemble/envui react@^19 react-dom@^19`;

export const componentGroups = [
  'Layout & surfaces',
  'Actions',
  'Forms & selection',
  'Navigation',
  'Content & guidance',
  'Feedback & overlays',
] as const;

export type ComponentGroup = (typeof componentGroups)[number];
export type Reference = {
  id: string;
  title: string;
  group: ComponentGroup | 'Foundations';
  summary: string;
  example: string;
  props: [string, string][];
  guidelines: string[];
  related?: string[];
};

export const foundations: Reference[] = [
  {
    id: 'colors',
    title: 'Colors & themes',
    group: 'Foundations',
    summary: 'The base palette, explicit themes and deterministic interaction colors.',
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
      'Matching colors share a hue across themes. Saturation and lightness may differ; distinct semantic exceptions retain their own hues.',
      'Selected navigation mixes 13% link color with its surface. Card action strips mix 35% muted surface with the parent surface.',
      'Scope content with Theme. Nested boundaries and portaled components retain the originating theme.',
    ],
    related: ['surface', 'buttons', 'navigation', 'motion'],
  },
  {
    id: 'typography',
    title: 'Typography',
    group: 'Foundations',
    summary: 'The type hierarchy and its React implementation through Text.',
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
    summary: 'Shared spacing tokens, padding and corner shapes.',
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
    summary: 'Official Material Symbols Rounded and bundled envUI/envsemble branding.',
    example: `import { Icon, EnvUILogo, BrandLogo, IconButton, Stack } from '@envsemble/envui';
import { ChevronRight, Home } from '@envsemble/envui/icons';

<Stack>
  <EnvUILogo />
  <BrandLogo />
  <Home filled label="Home" />
  <IconButton icon={<ChevronRight />} aria-label="Next item" />
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
    summary: 'Content-driven layouts and input-aware sizing across available space.',
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
      ['Control minimums', '2 rem action buttons; 2.5 rem field and navigation controls'],
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
    summary: 'Shared transition timing, visible focus and accessible composition.',
    example: `import { Stack, Input, IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons';

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

const componentReferences: Reference[] = [
  {
    id: 'layout',
    title: 'Stacks & action groups',
    group: 'Layout & surfaces',
    summary: 'Shared spacing for text, fields and grouped actions.',
    example: `import { Card, Stack, ActionGroup, Input, Button, Text } from '@envsemble/envui';

<Card>
  <Text as="h3" variant="section-heading">Project details</Text>
  <Text>Cards space their direct children automatically.</Text>
  <Stack gap={4}>
    <Input label="Name" name="name" />
    <Input label="Description" name="description" />
  </Stack>
  <ActionGroup>
    <Button variant="secondary">Cancel</Button>
    <Button>Save changes</Button>
  </ActionGroup>
</Card>

<ActionGroup stacked>
  <Button>Continue</Button>
  <Button variant="secondary">Cancel</Button>
</ActionGroup>`,
    props: [
      ['Stack gap', 'Spacing step 0–9; default 4 (1 rem); 0 removes the gap'],
      ['Stack align', 'start, center, end or stretch (default)'],
      [
        'Stack as',
        'Semantic container tag; div (default), section, article, nav, main, aside, header or footer',
      ],
      [
        'Stack render',
        'Compose layout onto another root; set the semantic tag on the supplied element instead of as',
      ],
      ['ActionGroup stacked', 'Wrapped row by default; stacked label buttons fill the group'],
      ['ActionGroup align', 'Row alignment: start (default), center or end'],
      ['ActionGroup as', 'Semantic container tag; div by default, footer for card or form actions'],
      ['Native element props', 'children, className, style, ref and accessible attributes'],
    ],
    guidelines: [
      'The parent owns space between components; components own their internal padding. Avoid individual child margins.',
      'Stack uses the shared spacing scale. Step 4 is 1 rem; step 2 is 0.5 rem. Cards already space direct children by 1 rem.',
      'ActionGroup uses 1 rem gaps in wrapped rows and 0.5 rem when stacked. Circular icon buttons keep their size.',
      'With Stack render, put the semantic tag on the supplied element. Custom components must forward native props and refs.',
    ],
    related: ['spacing', 'surface', 'cards', 'responsive'],
  },
  {
    id: 'surface',
    title: 'Surface',
    group: 'Layout & surfaces',
    summary: 'Shared backgrounds, padding and corners for panes and cards.',
    example: `import { Surface, Stack, Text } from '@envsemble/envui';

<Surface tone="pane" padding={5} render={<Stack as="section" gap={5} />}>
  <Text as="h2" variant="section-heading">Workspace pane</Text>
  <Text tone="muted">Stack supplies the content layout on the same root.</Text>
</Surface>`,
    props: [
      ['tone', 'pane (default), row, canvas or alternate'],
      ['padding', 'Spacing step 0–9; omitted uses responsive 1–1.5 rem padding'],
      ['corners', 'surface (default, 1.75 rem), standard (0.5 rem), pill or none'],
      ['as', 'Native container tag; div by default, with the semantic tags supported by Stack'],
      ['render', 'Optional root composition; set the tag on the supplied element instead of as'],
      ['Native element props', 'children, ref, className, style and accessible attributes'],
    ],
    guidelines: [
      'Surface supplies fill, padding and corners without layout, gaps, margins or interaction.',
      'Use Surface for plain panes, Card for content surfaces with standard layout, and specialized cards for their specific composition. Card builds on Surface.',
      'Stack and ActionGroup own layout. Compose Stack through render when the surface itself should arrange its content.',
      'Use surface corners for ordinary panes; standard and pill shapes serve the documented compact controls and rails. Custom render components must forward native props and refs.',
    ],
    related: ['spacing', 'layout', 'cards', 'colors'],
  },
  {
    id: 'buttons',
    title: 'Buttons',
    group: 'Actions',
    summary: 'Clear actions with a shared size, spacing and state treatment.',
    example: `import { Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons';

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
    guidelines: [
      'Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.',
      'Action buttons fit their content: 2 rem minimum height, 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.',
      'Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.',
      'Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.',
      'Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.',
    ],
    related: ['icon-buttons', 'layout', 'colors', 'icons'],
  },
  {
    id: 'icon-buttons',
    title: 'Icon buttons',
    group: 'Actions',
    summary: 'Compact circular actions with a clear accessible name.',
    example: `import { IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons';

<IconButton icon={<ChevronRight />} aria-label="Next item" onClick={next} />`,
    props: [
      ['icon', 'React icon content'],
      ['aria-label', 'Required accessible action name'],
      ['Native button props', 'disabled, type, onClick and ref'],
    ],
    guidelines: [
      'Use a 2.5 rem circle with a centered 1.5 rem icon and 0.5 rem inset.',
      'Use the tonal row fill and neutral icon. Name the action, rather than describing the icon shape.',
    ],
    related: ['buttons', 'icons', 'motion'],
  },
  {
    id: 'input',
    title: 'Text inputs',
    group: 'Forms & selection',
    summary: 'Single-line entry with visible labels and connected help.',
    example: `import { Input } from '@envsemble/envui';

<Input label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />`,
    props: [
      ['label / hint / error', 'React content; hint and error are linked to the control'],
      [
        'Native input props',
        'value/defaultValue, onChange, name, type, required, disabled, readOnly, ref',
      ],
    ],
    guidelines: [
      'Keep the label visible. Use hints for instructions and errors for a specific recovery step.',
      'Inputs support empty, filled, focus, invalid, disabled and read-only states. Keep form validation and draft state in the application.',
    ],
    related: ['textarea', 'select', 'layout', 'motion'],
  },
  {
    id: 'textarea',
    title: 'Textareas',
    group: 'Forms & selection',
    summary: 'Longer entry using the same label, hint and error treatment.',
    example: `import { Textarea } from '@envsemble/envui';

<Textarea label="Description" name="description" rows={4}
  value={description} onChange={e => setDescription(e.target.value)} />`,
    props: [
      ['label / hint / error', 'React content with accessible connections'],
      [
        'Native textarea props',
        'rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref',
      ],
    ],
    guidelines: [
      'Use for content that needs multiple lines. Set rows to reflect the expected amount of entry.',
      'Allow resizing and preserve the same state treatment as single-line fields.',
    ],
    related: ['input', 'layout', 'motion'],
  },
  {
    id: 'checkbox',
    title: 'Checkboxes',
    group: 'Forms & selection',
    summary: 'Independent choices, including partial group selection.',
    example: `import { Checkbox } from '@envsemble/envui';

<Checkbox label="Include archived items" name="archived"
  checked={included} onCheckedChange={setIncluded} />`,
    props: [
      ['checked / defaultChecked', 'boolean or "mixed"'],
      ['onCheckedChange', 'Receives the next boolean selection'],
      ['label / native props', 'Visible label, name, value, required, disabled and ref'],
    ],
    guidelines: [
      'Use for choices that can be selected independently. Use mixed for a partially selected parent group.',
      'Keep a visible label and retain native form participation. The application computes aggregate selection.',
    ],
    related: ['radio', 'switch', 'motion'],
  },
  {
    id: 'switch',
    title: 'Switches',
    group: 'Forms & selection',
    summary: 'A binary setting that can be understood as on or off.',
    example: `import { Switch } from '@envsemble/envui';

<Switch label="Enable notifications" name="notifications"
  checked={enabled} onCheckedChange={setEnabled} />`,
    props: [
      ['checked / defaultChecked', 'boolean'],
      ['onCheckedChange', 'Receives the next boolean'],
      ['label / native props', 'Visible label, disabled, name and ref'],
    ],
    guidelines: [
      'Use for a binary setting. Label the setting consistently in either state.',
      'Use checkbox semantics when the choice is part of a submitted selection.',
    ],
    related: ['checkbox', 'colors', 'motion'],
  },
  {
    id: 'radio',
    title: 'Radio groups',
    group: 'Forms & selection',
    summary: 'One selection from a visible set of alternatives.',
    example: `import { RadioGroup, Radio } from '@envsemble/envui';

<RadioGroup label="Access" name="access" value={access}
  onValueChange={setAccess} variant="rows">
  <Radio value="team" label="Team" detail="Everyone in your workspace" />
  <Radio value="private" label="Private" detail="Only invited people" />
</RadioGroup>`,
    props: [
      ['RadioGroup', 'label, name, value/defaultValue, onValueChange, required, disabled'],
      ['variant', 'inline (default) or rows'],
      ['Radio', 'value, label, detail, disabled and native input props'],
    ],
    guidelines: [
      'Use radios when one alternative must be selected and the choices benefit from being visible together.',
      'Selectable rows reuse the grouped-row geometry. Use a unique group name for each form.',
    ],
    related: ['select', 'checkbox', 'rows'],
  },
  {
    id: 'select',
    title: 'Selects',
    group: 'Forms & selection',
    summary: 'A compact choice with a tonal trigger and grouped option rows.',
    example: `import { Select } from '@envsemble/envui';

<Select label="Visibility" name="visibility" value={visibility}
  onValueChange={setVisibility} options={[
    { value: 'team', label: 'Team' },
    { value: 'private', label: 'Private' },
  ]} />`,
    props: [
      ['options', 'Array of { value, label, disabled? }'],
      ['value / defaultValue', 'Selected string, or null'],
      ['onValueChange', 'Receives selected string or null'],
      [
        'label / hint / error',
        'Visible label and linked guidance or validation, shared with text fields',
      ],
      ['Native participation', 'name, disabled, required and form'],
    ],
    guidelines: [
      'Use a select to save space when a single choice has several alternatives.',
      'Use the tonal trigger, selected indication and grouped option geometry. Keyboard navigation, typeahead and dismissal come from the component.',
      'Option focus rings appear for keyboard interaction, not pointer opening or hover.',
      'Label, hint and error use the same field structure as Input and Textarea. The application owns validation.',
    ],
    related: ['radio', 'input', 'rows', 'motion'],
  },
  {
    id: 'navigation',
    title: 'Navigation items',
    group: 'Navigation',
    summary: 'Quiet destinations and a clear selected location.',
    example: `import { NavigationItem } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons';

<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />}>
  Home
</NavigationItem>`,
    props: [
      ['href', 'Renders a link; omit for a button action'],
      ['selected / disabled', 'Current destination and unavailable state'],
      ['size', 'standard (default) or compact labels; both keep the navigation minimum height'],
      [
        'icon',
        'Material Symbols fill automatically when selected; custom React icons are supported',
      ],
      ['selectedIcon', 'Optional selected variant for custom icons'],
      ['children / native props', 'Destination label and link/button attributes'],
    ],
    guidelines: [
      'The application owns routing and the selected destination. Use a meaningful destination label.',
      'Pass one Material Symbol. Navigation renders its filled variant when selected and its outline otherwise, including icons inside wrappers.',
      'Unselected icons use the caption color; selected icon and label use the link color. Navigation fits its content with a 2.5 rem minimum height.',
      'Selection keeps the gray/blue styling. Hover and pressed preserve the base hue and saturation and use the central lightness rule.',
    ],
    related: ['tabs', 'direction-links', 'icons', 'colors'],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    summary: 'One selection, a quiet rail and animated content panels.',
    example: `import { Tabs, Button, Card } from '@envsemble/envui';

<Tabs aria-label="Project views" defaultValue="preview" keepMounted
  items={[
    { value: 'preview', button: <Button>Preview</Button>,
      content: <Card>Live preview</Card> },
    { value: 'guidelines', button: <Button>Guidelines</Button>,
      content: <Card>Design guidelines</Card> },
    { value: 'usage', button: <Button>Usage</Button>,
      content: <Card>React usage</Card> },
  ]}
/>`,
    props: [
      ['items', 'Unique string value, button element, content and optional disabled for each tab'],
      ['aria-label', 'Required name for the tab list'],
      [
        'value / defaultValue',
        'Controlled or initial selection; defaults to the first enabled item',
      ],
      ['onValueChange', 'Receives the selected string, or null when no selection remains'],
      ['activation', 'automatic (default) selects on focus; manual requires Enter or Space'],
      ['orientation', 'horizontal (default) or vertical; keyboard arrows follow the orientation'],
      [
        'keepMounted',
        'Preserve inactive content state; default false unmounts it after transition',
      ],
      ['listClassName / panelClassName', 'Optional layout classes for the list and panels'],
      ['Native div props', 'className, style, ref and accessible attributes on the root'],
    ],
    guidelines: [
      'Use tabs for related views in one place. Tabs owns selection, linked panels and keyboard behavior; your application owns any URL synchronization.',
      'Supply Button, IconButton, NavigationItem without href, or a custom component that forwards native button props and ref. Do not nest another control inside a tab. Icon-only tabs need an accessible name.',
      'The rail uses the pane color with 0.25 rem padding and gaps. Only the selected tab shows its supplied button fill; its hover and pressed colors follow the existing button rules. Official icons fill automatically when selected.',
      'Arrow keys move between enabled tabs; Home and End reach the ends. Use manual activation for content that takes time to load. Disabled tabs are skipped.',
      'Selection and panels transition over 0.16 s with shared easing. Reduced motion removes transitions. Inactive panels are hidden and inert; keepMounted preserves their local state.',
    ],
    related: ['navigation', 'buttons', 'icons', 'motion'],
  },
  {
    id: 'direction-links',
    title: 'Direction links',
    group: 'Navigation',
    summary:
      'Previous and up-next destinations with consistent direction, text and optional icons.',
    example: `import { DirectionLink, ActionGroup } from '@envsemble/envui';
import { ArrowBack, ArrowForward } from '@envsemble/envui/icons';

<ActionGroup>
  <DirectionLink direction="previous" href="/typography" icon={<ArrowBack />}>
    Typography
  </DirectionLink>
  <DirectionLink direction="next" href="/spacing" icon={<ArrowForward />}>
    Spacing & shape
  </DirectionLink>
</ActionGroup>

<DirectionLink direction="next" href="/getting-started">
  Getting started
</DirectionLink>`,
    props: [
      ['direction', 'Required: previous or next; sets the direction label and icon placement'],
      ['children', 'Destination text; wraps when space is limited'],
      ['href', 'Required destination URL; renders a native link'],
      ['icon', 'Optional decorative React content; no icon is inserted by default'],
      ['Native link props', 'ref, onClick, target, rel, className and accessible attributes'],
    ],
    guidelines: [
      'Use for previous and next destinations in ordered content. The component supplies Previous or Up next; the application supplies the destination text and routing.',
      'The destination is the main text. Its supporting direction label sits above it inside a compact outlined rectangle with standard rounding.',
      'Optional icons appear before previous destinations and after next destinations. Choose an appropriate arrow; icons are decorative and the text provides the accessible name.',
      'Show only destinations that exist. Arrange links using an existing layout component; DirectionLink represents one destination.',
      'Hover and pressed use the shared subtle-action and border colors. Keyboard focus has a visible outline, and text wraps without growing beyond its container.',
    ],
    related: ['navigation', 'layout', 'typography'],
  },
  {
    id: 'rows',
    title: 'Grouped rows',
    group: 'Layout & surfaces',
    summary: 'Connected content with generous outer corners and compact inner joins.',
    example: `import { GroupedRows, Row, Button } from '@envsemble/envui';

<GroupedRows>
  <Row title="Notifications" detail="Delivery preferences"
    action={<Button variant="outlined">Manage</Button>} />
  <Row title="Members" detail="Workspace access" />
</GroupedRows>`,
    props: [
      ['GroupedRows contrast', 'Use alternate fill inside a muted pane'],
      ['Row title / detail / action', 'General React content'],
      ['Native container props', 'className and accessible attributes'],
    ],
    guidelines: [
      'One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.',
      'Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.',
      'Keep actions short and let long titles and details wrap.',
    ],
    related: ['surface', 'cards', 'radio', 'select', 'spacing'],
  },
  {
    id: 'cards',
    title: 'Cards',
    group: 'Layout & surfaces',
    summary: 'Rounded surfaces for related content and familiar action compositions.',
    example: `import { Card, FeatureCard, Button, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons';

<Card href="/projects" aria-labelledby="projects-title">
  <Text as="h3" variant="section-heading" id="projects-title">Projects</Text>
  <Text>Open your shared workspace.</Text>
</Card>

<Card as="button" onClick={openProject}>
  <span>Open project</span>
</Card>

<FeatureCard icon={<Apps />} title="Connected workspace"
  description="Bring your team and tools together."
  action={<Button>Explore</Button>} />

<Card as="article" heading="Project overview" meta="Updated today"
  actions={<Button variant="outlined">Open project</Button>}>
  Shared context for the next release.
</Card>`,
    props: [
      ['Card tone / padding', 'row (default), pane or canvas; optional fixed spacing step 0–9'],
      ['Card as / href', 'div (default), article or button; href renders a native link'],
      ['Card heading / meta / actions', 'Content-card slots; actions adds a footer strip'],
      ['Card layout', 'content (default) or action; actions automatically selects action layout'],
      [
        'ClickableCard',
        'Compatibility wrapper for Card href / Card as="button"; native action props and disabled',
      ],
      ['ActionCard', 'Compatibility wrapper for Card action layout; title maps to heading'],
      ['FeatureCard', 'icon, title, description, action'],
    ],
    guidelines: [
      'Use 1.75 rem corners. Row tone is the standalone card fill; pane tone groups content in a quieter background.',
      'Cards space direct children by 1 rem. FeatureCard keeps compact title/description spacing and separates additional content by 1 rem.',
      'Card composes Surface and Stack on one root. FeatureCard, ActionCard and ClickableCard reuse that card implementation.',
      'Use Card href for a single destination or Card as="button" for an action. Do not nest controls inside an interactive card. Use phrasing content such as spans in button cards.',
      'Interactive cards share the same surface, padding and corners. Hover and pressed derive from the chosen tone; keyboard focus and disabled behavior are shared. Label rich links with aria-labelledby and connect descriptions with aria-describedby.',
      'The action strip derives its fill from the parent surface. Compose actions from the shared controls.',
      'Titles, metadata and product data remain application content.',
    ],
    related: ['surface', 'layout', 'rows', 'typography'],
  },
  {
    id: 'chips',
    title: 'Info chips',
    group: 'Content & guidance',
    summary: 'Compact, noninteractive metadata beside related content.',
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
    summary: 'Secondary guidance that expands without interrupting the task.',
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
  {
    id: 'empty-state',
    title: 'Empty states',
    group: 'Feedback & overlays',
    summary: 'Explain missing content and offer a relevant next action.',
    example: `import { EmptyState, Button } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons';

<EmptyState icon={<Search />} title="No results"
  description="Try a different name or clear the filters."
  action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />`,
    props: [
      ['title / description', 'Heading and concise explanation'],
      ['icon / action', 'Optional React content'],
    ],
    guidelines: [
      'Distinguish first-use emptiness from a search with no results.',
      'Offer an action that resolves the situation. Keep the content aligned to the start.',
    ],
    related: ['loading', 'cards', 'buttons'],
  },
  {
    id: 'loading',
    title: 'Loading',
    group: 'Feedback & overlays',
    summary: 'Show content geometry while announcing that work is in progress.',
    example: `import { LoadingState, Skeleton } from '@envsemble/envui';

<LoadingState label="Loading project">
  <Skeleton width="38%" height="1.25rem" />
  <Skeleton width="100%" height="0.8rem" />
  <Skeleton width="72%" height="0.8rem" />
</LoadingState>`,
    props: [
      ['Skeleton width / height', 'CSS dimensions appropriate for anticipated content'],
      ['LoadingState label / children', 'Accessible loading announcement and visual placeholders'],
    ],
    guidelines: [
      'Match placeholders to expected content without implying a precise completion time.',
      'Announce loading once per region. Respect the operating system reduced motion preference.',
    ],
    related: ['empty-state', 'cards', 'motion'],
  },
  {
    id: 'toasts',
    title: 'Toasts',
    group: 'Feedback & overlays',
    summary: 'Brief feedback with optional recovery and explicit dismissal.',
    example: `import { Theme, Button, ToastProvider, useToast } from '@envsemble/envui';

function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.show({
    variant: 'success', message: 'Changes saved',
  })}>Save</Button>;
}

<Theme theme="light">
  <ToastProvider defaultPlacement="bottom-right"><SaveButton /></ToastProvider>
</Theme>`,
    props: [
      [
        'Toast',
        'variant: neutral, success, info, error; message; action {label,onClick}; onDismiss',
      ],
      ['ToastProvider defaultPlacement', 'bottom-right (upward) or top-center (downward)'],
      [
        'ToastProvider visibleLimit',
        'Three visible notices per placement by default; FIFO overflow',
      ],
      ['useToast()', 'show(options) returns ID; dismiss(id) removes a notice; clear() removes all'],
      [
        'Notification options',
        'placement override, dismissible and duration; errors/actions persist',
      ],
      ['Manual Toast announce', 'true by default; false for static specimens'],
    ],
    guidelines: [
      'Neutral, success and info notices without actions expire after five seconds. Errors and notices with actions persist until dismissed.',
      'Timers pause during hover, keyboard focus or an inactive window. Each placement shows three notices; queued lifetimes start on display.',
      'Keep messages and actions short. Messages stay single-line and truncate to available space. Manual Toast shares the presentation; the consumer owns its lifetime.',
    ],
    related: ['dialogs', 'buttons', 'colors', 'motion'],
  },
  {
    id: 'dialogs',
    title: 'Dialogs',
    group: 'Feedback & overlays',
    summary: 'Focused confirmation or entry with a modal boundary and return focus.',
    example: `import { Dialog, Button, Input } from '@envsemble/envui';

<Dialog trigger={<Button>Create project</Button>} title="Create project"
  description="Choose a name your team will recognize."
  closeLabel="Cancel" actions={<Button onClick={save}>Create</Button>}>
  <Input label="Project name" value={name} onChange={e => setName(e.target.value)} />
</Dialog>`,
    props: [
      ['trigger / title / description', 'Launch control and accessible modal labeling'],
      ['children / actions', 'General content and shared controls'],
      ['closeLabel', 'Built-in dismissal label; defaults to Close'],
      ['open / defaultOpen / onOpenChange', 'Controlled or uncontrolled visibility'],
      ['DialogClose', 'Additional dismissal action; shared button props'],
      ['initialFocus / finalFocus', 'Optional focus refs'],
    ],
    guidelines: [
      'Use a modal for a focused confirmation or a short form. The footer always provides a dismissal action.',
      'The dialog traps focus, handles Escape and returns focus to the trigger. Portals preserve the originating theme.',
      'The application owns validation, saving, async work and whether completion closes the dialog.',
    ],
    related: ['toasts', 'input', 'layout', 'motion'],
  },
];

export const references = componentReferences.sort(
  (a, b) =>
    componentGroups.indexOf(a.group as ComponentGroup) -
    componentGroups.indexOf(b.group as ComponentGroup),
);

export function renderUsageMarkdown(): string {
  const head = `# @envsemble/envui usage\n\nReact 19 components for current browsers. Import the public package API and one stylesheet. Theme preference, routing, validation and product data belong to the application.\n\n## Install\n\nConfigure private GitHub Packages access using an environment token with read:packages and package access. Keep credentials outside committed files.\n\n\`\`\`ini\n${registryCode}\n\`\`\`\n\n\`\`\`sh\n${installCode}\n\`\`\`\n\n## First component\n\n${'```tsx'}\n${setupCode}\n${'```'}\n\nUse Theme theme="light" or theme="dark". Inter, tokens and assets are included. Imports from @envsemble/envui/icons are explicit, and icons accept filled, width, height and accessible SVG attributes. Components accept custom React icon content.\n`;
  return (
    head +
    [
      { title: 'Foundations', items: foundations },
      ...componentGroups.map((title) => ({
        title,
        items: references.filter((ref) => ref.group === title),
      })),
    ]
      .map(
        ({ title, items }) =>
          `\n## ${title}\n` +
          items
            .map((ref) => {
              const related = (ref.related ?? []).flatMap((id) => {
                const item = [...foundations, ...references].find((entry) => entry.id === id);
                if (!item) return [];
                const anchor = item.title
                  .toLowerCase()
                  .replace(/[^\p{L}\p{N} -]/gu, '')
                  .replace(/ /g, '-');
                return [`[${item.title}](#${anchor})`];
              });
              return `\n### ${ref.title}\n\n${ref.summary}\n\n${'```tsx'}\n${ref.example}\n${'```'}\n\n#### Props & contracts\n\n${ref.props.map(([name, value]) => `- ${name}: ${value}`).join('\n')}\n\n#### Guidelines\n\n${ref.guidelines.map((text) => `- ${text}`).join('\n')}\n${related.length ? `\nRelated: ${related.join(', ')}.\n` : ''}`;
            })
            .join(''),
      )
      .join('') +
    '\n## Local edits and upgrades\n\nIn the design-system repository, run npm install and npm run dev. The documentation workspace consumes the public package through the local workspace. Changes appear during development without publishing or changing the package version. A future product can use the same workspace connection; product integration is separate work. Adopt a published version intentionally with npm install @envsemble/envui@<version>, review CHANGELOG.md, and validate the consumer before release. Every release has a matching offline documentation HTML.\n'
  );
}
