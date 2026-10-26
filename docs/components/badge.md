---
title: Badge
summary: Small static pills that name a state in its tone or a piece of metadata, show a count, or the size of a change.
status: stable
since: 0.5.0
category: Data display
aliases:
  - Counter
  - CounterBadge
  - DiffCount
  - InfoChip
  - info chip
  - chip
  - chips
  - metadata
  - status badge
  - status
  - tag
  - lozenge
  - label
  - pill
  - count
  - counter
  - notification count
  - unread count
  - diff count
  - change size
useWhen:
  - A short state beside what it describes, such as In review or Blocked
  - A name or a category on an item, such as a team or a folder
  - Neutral metadata beside related content, such as a plan
  - A number that belongs to a label, such as unread messages
  - The size of a change beside a file, such as +12 −3 (DiffStat)
avoidWhen:
  - text: An action, or a choice people turn on and off, even when it looks like a pill.
    use: Button
  - text: Choosing one of a few filters or views.
    use: SegmentedControl
  - text: A message about a page or section that needs a sentence.
    use: Alert
  - text: How full or complete something is, such as storage used.
    use: Meter
  - text: A headline number with its label and trend, such as on a dashboard.
    see: key-figures
  - text: A count beside a destination in the navigation, which a Drawer item shows itself.
    use: Drawer
  - text: An identifier or a command in text.
    use: Code
components:
  - Badge
  - DiffStat
examples:
  ProjectStatus: overview
  CountsInButtons:
    role: overview
    caption: 'Counts: a compact number, here inside buttons.'
  ChangeSize:
    role: overview
    caption: 'DiffStat: the size of a change.'
  Emphasis: variants
  Tones: variants
  BadgeAnatomy: anatomy
  LongState: example
  SoftInLists:
    role: do
    caption: Soft badges in a list, and solid only for the state that must stand out.
  SolidEverywhere:
    role: dont
    caption: 'Solid badges everywhere: none of them stands out.'
---

# Badge

## Variants

```tsx figure=Emphasis

```

1. **Soft**
2. **Solid**
3. **Outline**

| Variant | Use for                                             |
| ------- | --------------------------------------------------- |
| Soft    | Most states, in lists, tables and headings.         |
| Solid   | The one state that must stand out, such as Overdue. |
| Outline | Names and categories, such as a team or a folder.   |

### Tones

A badge takes every status tone, which [Colors & themes](../foundations/colors.md) describes.

```tsx figure=Tones

```

1. **Neutral**
2. **Accent**
3. **Success**
4. **Warning**
5. **Danger**
6. **Done**

### Counts

A count takes the same tones and variants: neutral and soft by default, and solid in the accent tone for a count that needs attention.

## Anatomy

```tsx figure=BadgeAnatomy

```

1. **Pill** (`env-badge`)
2. **Icon** (`env-badge > env-icon`, `icon`)
3. **Label** (`env-badge-label`, `children`)

Not shown: a count, and DiffStat's added and removed lines.

## Behaviour

### Adapting to width

A badge stays on one line and ends with an ellipsis where its container is narrower.

```tsx figure=LongState widths="20 10" sweep

```

## Rules

A badge's word carries its meaning, and only the state that must stand out is solid.

```tsx figure=SoftInLists

```

```tsx figure=SolidEverywhere

```

### Words and tones

Give the same state the same word and tone everywhere, and let the word carry the meaning, never the tone alone.

### Content

Show 99+ beyond two digits, and give the full count in the count's name for assistive technology.

## Accessibility

### envUI provides

- The label as text, read in place; the icon hidden.
- A count's `aria-label` read instead of its number.
- A DiffStat named once, such as 12 added lines and 3 removed lines, from `messages.diffStat.label` or `formatLabel`.

### You provide

- An `aria-label` on a count whose number doesn't explain itself, such as 12 unread.
- A status region where a change of count must be announced.

## Compose

### Usage

A Badge's label is its `children`, a state, a name or a category in a word or two, with an optional decorative `icon` before it. It stays on one line and ends with an ellipsis where it is wider than its container.

```tsx source=ProjectStatus

```

#### Variants and tones

`variant` is `soft`, the default, which tints the background, `solid`, which fills it with the tone, or `outline`, which draws a border. `tone` is `neutral`, the default, `accent`, `success`, `warning`, `danger` or `done`, the purple of completed work.

```tsx
<Badge tone="success">Ready</Badge>
<Badge tone="danger" variant="solid">Overdue</Badge>
<Badge variant="outline">Design team</Badge>
```

#### Counts

`count` takes a number, such as `12`, or short text, such as `99+`, in place of a label: a compact round pill in tabular figures. Pass `99+` yourself beyond two digits. Its `aria-label`, such as 12 unread, is read in place of the number. Counts take the same tones and variants; `tone="accent" variant="solid"` draws attention to one.

```tsx
<Button>
  Comments <Badge count={4} />
</Button>
<Button>
  Review requests <Badge count={2} tone="accent" variant="solid" />
</Button>
```

#### DiffStat

DiffStat shows `additions` as +12 in the success tone and `deletions` as −3 in the danger tone, in the locale's digits. It is named once for assistive technology, such as 12 added lines and 3 removed lines, from EnvUIProvider's `messages.diffStat.label` or its own `formatLabel`.

```tsx
<DiffStat additions={12} deletions={3} />
```

#### In navigation

A Drawer destination's `count` shows the count at its end and adds it to the destination's name, such as Inbox, 12 new.

```tsx
const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 12, current: true },
  { label: 'Later', icon: <Schedule />, href: '/later', count: 1200 },
];

<Drawer aria-label="Workspace" destinations={destinations} />;
```

### Composition

The parts are the pill, `env-badge`, its icon, `env-badge > env-icon`, and its label, `env-badge-label`. A count is `env-badge[data-count]`, with `env-badge-count-label` for its `aria-label`; DiffStat has `env-diff-stat-additions` and `env-diff-stat-deletions`. A control, such as a Button, sets the badges, counts and DiffStats inside it through the `--env-badge-*`, `--env-badge-count-*` and `--env-diff-stat-*` properties.

### Customize

`--env-badge-container`, `--env-badge-content` and `--env-badge-outline` set the colors of one Badge, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

```tsx
<Badge style={{ '--env-badge-container': 'var(--env-color-bg-brand-muted)' } as CSSProperties}>
  Beta
</Badge>
```

## Changelog

- **1.0.0**: InfoChip is Badge, a pill, and its page joins this one. The `subtle` variant is `soft`. `Counter` is a Badge with `count`, which the `v1-structure` codemod writes, `.env-badge[data-count]` with `env-badge-count-label`, and `DiffCount` is `DiffStat`, with its props type and the `env-diff-stat-*` classes; the page is `badge`. DiffStat writes its numbers and its name in the locale, and its name comes from `messages.diffStat.label`. A control sets the badges inside it through the `--env-badge-*`, `--env-badge-count-*` and `--env-diff-stat-*` hooks.
- **0.7.0**: DiffCount; a counter in a button keeps its own filled pill, except on primary and important fills.
- **0.5.0**: Badge in six tones and three variants, and Counter; in a button, a badge or counter takes the button's text color as an outlined pill.
