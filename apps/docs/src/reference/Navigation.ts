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
</NavigationItem>

// Keep the same item when the sidebar is collapsed or expanded.
<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />} iconOnly={collapsed} aria-label="Home">
  Home
</NavigationItem>`,
    props: [
      ['href', 'Renders a link; omit for a button action'],
      ['selected / disabled', 'Current destination and unavailable state'],
      ['size', 'standard (default) or compact labels; both keep the navigation minimum height'],
      [
        'iconOnly',
        'Hide the visible label and center the icon in a circular control; accepts sidebar collapse state',
      ],
      [
        'aria-label',
        'Required accessible destination name when iconOnly is enabled; icon is also required',
      ],
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
      'Navigation labels, unselected icons and selected labels have independent color roles. Their defaults align with strong text, captions and link blue. Navigation fits its content with a 2.5 rem minimum height.',
      'Both label sizes use the shared 1 rem control icon size, matching labeled and icon-only buttons.',
      'Use iconOnly for a collapsed sidebar. Supply icon and aria-label; children can remain in place for the expanded label. The circle matches the navigation height and keeps selection, automatic icon fill, focus and disabled behavior.',
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

<Tabs aria-label="Project views" defaultValue="summary" keepMounted
  items={[
    { value: 'summary', button: <Button>Summary</Button>,
      content: <Text>A shared space for project plans and notes.</Text> },
    { value: 'details', button: <Button>Details</Button>,
      content: <Text>The project is ready for review.</Text> },
    { value: 'activity', button: <Button>Activity</Button>,
      content: <Text>The draft was updated today.</Text> },
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
      'The rail uses the filled Surface tone, with 0.25 rem padding and gaps. The selected tab retains its supplied Button or NavigationItem colors, including hover and pressed shades. Inactive tabs have a transparent fill and muted labels at rest; enabled inactive tabs use the rail’s subtle Surface hover shade. Official icons fill automatically when selected.',
      'Arrow keys move between enabled tabs; Home and End reach the ends. Use manual activation for content that takes time to load. Disabled tabs are skipped.',
      'Selection and panels transition over 0.16 s with shared easing. Reduced motion removes transitions. Inactive panels are hidden and inert; keepMounted preserves their local state.',
    ],
    related: ['navigation', 'buttons', 'icons', 'accessibility'],
  },
  {
    id: 'direction-links',
    title: 'Direction links',
    group: 'Navigation',
    summary: 'Centered previous and next destinations, together or individually.',
    example: `import { DirectionLinks, DirectionLink } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

// Place after the page content. The library owns the centered link layout.
<DirectionLinks
  previous={{ href: '/typography', children: 'Typography', icon: <ArrowBack /> }}
  next={{ href: '/spacing', children: 'Spacing & shape', icon: <ArrowForward /> }}
/>

// Omit the missing destination at either end of the sequence.
<DirectionLinks next={{ href: '/getting-started', children: 'Getting started' }} />
<DirectionLinks previous={{ href: '/typography', children: 'Typography' }} />

// DirectionLink remains available for an individual destination.
<DirectionLink direction="next" href="/getting-started">
  Getting started
</DirectionLink>`,
    props: [
      [
        'DirectionLinks: previous / next',
        'Optional destination objects with href, children, icon and native link props; omit or pass null for a missing destination',
      ],
      [
        'DirectionLinks: native nav props',
        'ref, className, style and accessible attributes; aria-label defaults to Previous and next content',
      ],
      [
        'DirectionLink: direction',
        'Required: previous or next; sets the direction label and icon placement',
      ],
      ['DirectionLink: children', 'Destination text; wraps when space is limited'],
      ['DirectionLink: href', 'Required destination URL; renders a native link'],
      ['DirectionLink: icon', 'Optional decorative React content; no icon is inserted by default'],
      [
        'DirectionLink: native link props',
        'ref, onClick, target, rel, className and accessible attributes',
      ],
    ],
    guidelines: [
      'Use for previous and next destinations in ordered content. The component supplies Previous or Up next; the application supplies the destination text and routing.',
      'The destination is the main text. Its supporting direction label sits above it inside a compact outlined rectangle with standard rounding.',
      'Optional icons appear before previous destinations and after next destinations. Choose an appropriate arrow; icons are decorative and the text provides the accessible name.',
      'Place DirectionLinks after the page content. It bundles the destinations side by side with shared spacing and centers the group within the available width. The page owns bottom placement and outer spacing.',
      'Supply previous, next or both. A single destination stays centered without an empty placeholder; omitting both renders nothing. Previous always precedes next in reading and keyboard order.',
      'DirectionLinks renders a named navigation landmark and preserves native link behavior. Override aria-label when several groups need distinct names. Each destination accepts the same link props as DirectionLink except direction, which the group supplies.',
      'Links stay side by side when they fit and wrap onto centered rows in narrow containers, keeping destination text readable. Titles wrap at word boundaries; unbroken text can wrap within a word to avoid overflow. DirectionLink remains available for standalone links with application-owned placement.',
      'Direction links have independent background, border, title, caption and icon roles in both themes. The background defaults to white in light and a raised dark surface in dark. Hover and pressed shades derive from their own background and border colors. Keyboard focus has a visible outline, and text wraps without growing beyond its container.',
    ],
    related: ['navigation', 'layout', 'typography'],
  },
];
