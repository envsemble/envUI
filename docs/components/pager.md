# Pager

## React usage

```tsx
import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

// Place after the page content. The library owns the centered link layout.
<Pager.Root
  previous={{ href: '/typography', children: 'Typography', icon: <ArrowBack /> }}
  next={{ href: '/spacing', children: 'Spacing & shape', icon: <ArrowForward /> }}
/>

// Omit the missing destination at either end of the sequence.
<Pager.Root next={{ href: '/getting-started', children: 'Getting started' }} />
<Pager.Root previous={{ href: '/typography', children: 'Typography' }} />

// The parts compose the same pair, or stand alone for an individual destination.
<Pager.Root>
  <Pager.Previous href="/typography">Typography</Pager.Previous>
  <Pager.Next href="/spacing">Spacing & shape</Pager.Next>
</Pager.Root>
<Pager.Next href="/getting-started">Getting started</Pager.Next>
```

### Props & contracts

| Name                        | Contract                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Pager.Root previous / next  | Optional destination objects with href, children, icon and native link props; omit or pass null for a missing destination |
| Pager.Root children         | Pager.Previous and Pager.Next, as an alternative to the previous and next props                                           |
| Pager.Root native nav props | ref, className, style and accessible attributes; aria-label defaults to Previous and next content                         |
| Pager.Previous / Pager.Next | The link before or after this page; each sets its direction label, icon placement and rel                                 |
| children                    | Destination text; wraps when space is limited                                                                             |
| href                        | Required destination URL; renders a native link                                                                           |
| icon                        | Optional decorative React content; no icon is inserted by default                                                         |
| Native link props           | ref, onClick, target, rel, className and accessible attributes                                                            |

## Guidelines

- Use a pager for previous and next destinations in ordered content; Pagination is the numbered range control. The component supplies Previous or Up next; the application supplies the destination text and routing.
- The destination is the main text. Its supporting direction label sits above it inside a compact outlined rectangle with standard rounding.
- Optional icons appear before previous destinations and after next destinations. Choose an appropriate arrow; icons are decorative and the text provides the accessible name.
- Place Pager.Root after the page content. It bundles the destinations side by side with shared spacing and centers the group within the available width. The page owns bottom placement and outer spacing.
- Supply previous, next or both. A single destination stays centered without an empty placeholder; omitting both renders nothing. Previous always precedes next in reading and keyboard order.
- Pager.Root renders a named navigation landmark and preserves native link behavior. Override aria-label when several groups need distinct names. Each destination accepts the same link props as Pager.Previous and Pager.Next.
- Links stay side by side when they fit and wrap onto centered rows in narrow containers, keeping destination text readable. Titles wrap at word boundaries; unbroken text can wrap within a word to avoid overflow. Pager.Previous and Pager.Next also stand alone, with application-owned placement.
- Pager links have independent background, border, title, caption and icon roles in both themes. The background defaults to white in light and a raised dark surface in dark. Hover and pressed shades derive from their own background and border colors. Keyboard focus has a visible outline, and text wraps without growing beyond its container.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation lists](../components/nav-list.md)
- [Stacks & action groups](../components/layout.md)
- [Typography](../foundations/typography.md)
