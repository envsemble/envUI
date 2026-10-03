import type { Reference } from './Types';

export const navigationReferences: Reference[] = [
  {
    id: 'navigation',
    title: 'Navigation items',
    group: 'Navigation',
    summary: 'Links to another destination; routing stays with the app.',
    example: `import { NavigationItem } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

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
    summary: 'Switches between content panels in the same view.',
    example: `import { Tabs, Button, Text } from '@envsemble/envui';

<Tabs aria-label="Project views" defaultValue="preview" keepMounted
  items={[
    { value: 'preview', button: <Button>Preview</Button>,
      content: <Text>Live preview</Text> },
    { value: 'guidelines', button: <Button>Guidelines</Button>,
      content: <Text>Design guidelines</Text> },
    { value: 'usage', button: <Button>Usage</Button>,
      content: <Text>React usage</Text> },
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
      ['renderList', 'Wraps the supplied tab list in a custom layout; render the list once'],
      ['Native div props', 'className, style, ref and accessible attributes on the root'],
    ],
    guidelines: [
      'Use tabs for related views in one place. Tabs owns selection, linked panels and keyboard behavior; your application owns any URL synchronization.',
      'Use renderList to place the tab list alongside a heading or other content inside a Card. Keep panels outside that wrapper and render the supplied list once.',
      'Supply Button, IconButton, NavigationItem without href, or a custom component that forwards native button props and ref. Do not nest another control inside a tab. Icon-only tabs need an accessible name.',
      'The rail uses the muted surface color to stand apart from background panes, with 0.25 rem padding and gaps. Only the selected tab shows its supplied button fill; its hover and pressed colors follow the existing button rules. Official icons fill automatically when selected.',
      'Arrow keys move between enabled tabs; Home and End reach the ends. Use manual activation for content that takes time to load. Disabled tabs are skipped.',
      'Selection and panels transition over 0.16 s with shared easing. Reduced motion removes transitions. Inactive panels are hidden and inert; keepMounted preserves their local state.',
    ],
    related: ['navigation', 'buttons', 'icons', 'motion'],
  },
  {
    id: 'direction-links',
    title: 'Direction links',
    group: 'Navigation',
    summary: 'Previous and next destinations in an ordered sequence.',
    example: `import { DirectionLink, ActionGroup } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

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
];
