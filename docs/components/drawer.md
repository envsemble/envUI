---
title: Drawer
summary: An application's main destinations, as a drawer with group headings, counts and sections that open and close on wider windows, a rail on tablets or a bar on phones.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - navigation drawer
  - Sidebar
  - sidebar
  - hamburger menu
  - nav drawer
  - side navigation
  - sidebar navigation
  - sidebar links
  - NavList
  - NavList.Item
  - NavigationItem
  - nav item
  - navigation list
  - nav links
  - navigation links
  - navigation
  - navigation rail
  - side rail
  - icon rail
  - collapsed sidebar
  - icon sidebar
  - NavigationRail
  - sidebar rail
  - navigation bar
  - bottom navigation
  - bottom bar
  - tab bar
  - bottom tabs
  - mobile navigation
  - NavigationBar
  - BottomNavigation
  - nested navigation
  - collapsible navigation
  - collapsible sidebar
  - docs navigation
  - sidebar sections
  - navigation tree
useWhen:
  - An application's main destinations, on a laptop or a wider window
  - Many destinations, in groups under headings, with counts
  - The sections of a guide or of the settings, beside their content
  - A documentation site's pages, in sections that open and close
  - The same destinations on a tablet, each an icon above a short label (Rail)
  - Three to five destinations on a phone, along the bottom of the window (Bar)
avoidWhen:
  - text: Switching between views of the same content in one place.
    use: Tabs
  - text: A deep hierarchy that people expand and collapse, such as folders and files.
    use: Tree
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
  - text: Actions, such as New or Share.
    use: Toolbar
components:
  - Drawer
  - Rail
  - Bar
examples:
  AppDestinations: overview
  TabletDestinations:
    role: overview
    caption: 'Rail: each destination an icon above a short label, for a tablet.'
  PhoneDestinations:
    role: overview
    caption: 'Bar: three to five destinations along the bottom of a phone.'
  GuideSections: example
  DrawerAnatomy: anatomy
  RailAnatomy: anatomy
  BarAnatomy: anatomy
  SectionAnatomy: anatomy
  OneListThreeForms: example
  NestedSections: example
  MoreDestinations: example
  ResizableDrawer: example
  SharedWidth: example
---

# Drawer

## Variants

### Backgrounds

Each form is a plain rectangle along the window's edge. On a surface it takes that surface's color; a [Sheet](sheet.md) is on the navigation's own, so a drawer looks the same in one.

| Background | Use for                                                          |
| ---------- | ---------------------------------------------------------------- |
| Navigation | The navigation's own fill, shared with the top bar. The default. |
| Page       | The page's color, such as beside a top bar with a fill.          |

### Without icons

A drawer's destinations can go without icons, such as the sections of a guide; the rail and the bar need them.

```tsx figure=GuideSections

```

## Anatomy

```tsx figure=DrawerAnatomy

```

1. **Drawer** (`env-drawer`)
2. **Header** (`env-drawer-header`, `header`)
3. **Item** (`env-drawer-item`)
4. **Label** (`env-drawer-label`)
5. **Count** (`env-drawer-count`, `count`)
6. **Group** (`env-drawer-section`, `group`)
7. **Heading** (`env-drawer-heading`)
8. **Footer** (`env-drawer-footer`, `footer`)

```tsx figure=RailAnatomy

```

1. **Rail** (`env-rail`)
2. **Header** (`env-rail-header`, `header`)
3. **Item** (`env-rail-item`)
4. **Indicator** (`env-rail-indicator`)
5. **Count** (`env-rail-count`, `count`)
6. **Label** (`env-rail-label`)
7. **Footer** (`env-rail-footer`, `footer`)

```tsx figure=BarAnatomy enlarge

```

1. **Bar** (`env-bar`)
2. **Item** (`env-bar li:nth-child(2) > env-bar-item`)
3. **Indicator** (`env-bar-icon`)
4. **Count** (`env-bar-count`, `count`)
5. **Label** (`env-bar-text`)

```tsx figure=SectionAnatomy

```

1. **Section** (`env-drawer-branch`)
2. **Item** (`env-drawer-branch-row > env-drawer-item`)
3. **Section button** (`env-drawer-toggle`)
4. **Chevron** (`env-drawer-toggle > env-drawer-chevron`)
5. **Nested destinations** (`env-drawer-children`)

## Behaviour

### One list, three forms

The drawer, the rail and the bar take the same list of destinations, and [Scaffold](scaffold.md) shows the one that fits its width.

- A group is a heading in the drawer only: the rail and the bar show its destinations one after another.
- Nested sections are the drawer's too: the rail and the bar show the top level, and mark the destination whose section holds the current page.

```tsx figure=OneListThreeForms stage=shaded widths="54 44 24" sweep classes fit

```

### Nested sections

A destination can hold others, such as the pages of a chapter: they sit under it, indented, in a section that opens and closes with its chevron.

- The section that holds the current page is open.
- A section without a page of its own is only a heading.

```tsx figure=NestedSections motion

```

### More than five

Past five destinations, the bar's fifth place is More, which opens the rest in a menu and takes the current fill when it holds the current page.

```tsx figure=MoreDestinations motion

```

### Resizable

People can resize the drawer by its end edge, with the same grip as between [Panes](panes.md).

- As it narrows, a label that no longer fits ends in an ellipsis and shows in full in a tooltip.
- A group heading cut short shows its full text on hover.

```tsx figure=ResizableDrawer motion

```

### Adapting to width

The bar's destinations share its width equally, and their labels stay on one line. A drawer or a rail in the sheet of a narrow window keeps its color, as a sheet is on the navigation's.

```tsx figure=SharedWidth widths="36 20" sweep

```

## Rules

Mark where people are, keep groups together, and keep labels short.

### The current destination

Mark the one destination people are on, from the address they are at.

### Header and footer

The drawer's and the rail's header holds the application's name, search or the main action, and the footer the account, such as an AvatarButton.

### Sections

Give a section a page of its own where it has an overview to show.

- Keep a group's destinations next to each other, under one heading.
- Keep to two levels, three at most: a deeper outline belongs on the page itself.

### Labels

Keep labels to a word or two, so they fit on one line in the drawer and under their icons in the rail and the bar.

### Its own background

Keep a resizable drawer on its own background, so its handle is the edge of a surface.

- Leave a drawer in a sheet of a narrow window at its own width.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination or section button; each is a tab stop, and an open section's destinations follow its button. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination that is a button; opens More; opens or closes a section on its button.                        |
| <kbd>Space</kbd>                                | Selects a destination that is a button; opens More; opens or closes a section on its button.                                           |
| <kbd>↑</kbd>, <kbd>↓</kbd> in More's menu       | Move between the destinations in the menu.                                                                                             |
| <kbd>Esc</kbd> in More's menu                   | Closes the menu and returns focus to More.                                                                                             |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle | Narrows or widens a resizable drawer a step; with <kbd>Shift</kbd>, more.                                                              |
| <kbd>Home</kbd>, <kbd>End</kbd> on the handle   | Resizes it to its smallest or largest width.                                                                                           |

### envUI provides

- A `nav` landmark named Main, of native links and buttons, with `aria-current="page"` on the current one.
- A count in its destination's name, such as Inbox, 12 new.
- The drawer's group headings at `headingLevel`, each naming its group's list.
- A section's button, with `aria-expanded` and the list it opens in `aria-controls`: the section's own item where it has no page, else a button at the end of its link, named with `messages.navigation.contents`, such as Projects contents. A closed section keeps its links in the page, hidden until found, so search engines follow them and find in page opens the section. The sections that hold the current destination open, and the expand animation and the chevron's flip stop under reduced motion.
- The bar's More as a menu button, named with its counts and whether it holds the current page.
- Items at least 2.75 rem tall in the bar, and a 2.75 rem touch target in the drawer on coarse pointers.
- With `resizable`, a focusable separator on the drawer's end edge, named Resize navigation, with its width as its value.

### You provide

- `current` from the router, on the nested destination itself where the page is in a section, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Unique labels, and `messages.navigation` in the application's language.
- Names for the controls in the header and the footer.

## Compose

### Usage

```tsx
const destinations: Destination[] = [
  { label: 'Inbox', href: '/inbox', icon: <Inbox />, count: 12, current: true },
  { label: 'Projects', href: '/projects', icon: <Folder />, group: 'Work' },
];

<Drawer destinations={destinations} header={<Text>Northwind</Text>} footer={account} />;
```

Drawer, Rail and Bar take `destinations`, one array of `Destination`s, each with its `label`, an `icon`, a `count` and a `group`. With `href`, a destination is a native link, through the router link from `LinkProvider`, and `onSelect` runs as it is followed; with `onSelect` alone it is a button, for a view without an address. Set `current` on one destination, from the router: a press doesn't select one by itself. `header` and `footer` hold content above and below the destinations of a Drawer or a Rail. Scaffold shows the form that fits its width, at the window's start or, for the bar, at its bottom.

#### One list, three forms

Pass the same array to each form. A heading starts each run of destinations of one `group` in the drawer, at `headingLevel`, 2 by default, so keep a group's destinations next to each other; the rail and the bar show no headings, so order the array. A `DrawerDestination` may leave its `icon` out: leave it out of every destination of a list, or of none. Rail and Bar need icons.

#### Nested sections

```tsx
const projects: DrawerDestination = {
  label: 'Projects',
  href: '/guide/projects',
  children: [
    { label: 'Create a project', href: '/guide/projects/create' },
    { label: 'Sharing', children: [{ label: 'Invite your team', href: '/guide/projects/invite' }] },
  ],
};
```

A destination's `children` nest under it, at any depth. A section with `href` or `onSelect` is a destination itself, with a button at its end that opens and closes it; one with neither is only its heading, a button that does. Drawer reads `group` at the top level only. In Rail and Bar, a destination whose `children` hold the current one takes the current fill and reports `aria-current="true"`, so give the top level an `href` where the same array goes to them.

The sections that hold the current destination open as it becomes current; the drawer keeps the rest as people open and close them, from `defaultExpanded`. To keep them yourself, such as for the next visit, pass `expanded` and update it from `onExpandedChange`, which also asks to open the sections of a new current destination. Both name a section by its `href`, or its label where it has none, so keep those labels unique.

```tsx
const [expanded, setExpanded] = useState<string[]>([]);
<Drawer destinations={destinations} expanded={expanded} onExpandedChange={setExpanded} />;
```

#### Rail and Bar

A Rail's `header` holds the main action or a button that opens the navigation, and `footer` the account's AvatarButton; Scaffold gives the rail the window's height. Give a Bar three to five destinations: past five it shows the first four and More.

#### Background and name

```tsx
<Bar background="page" aria-label="Project" destinations={destinations} />
```

`background` is `default`, the navigation's fill, the same as TopBar's, or `page`, the page's background. `aria-label` names the landmark, Main by default from EnvUIProvider's `messages.navigation`; give each navigation landmark of a page its own.

#### Resizable

With `resizable`, people resize a Drawer between `minWidth` and `maxWidth`, 15 and 30 rem by default, and never past half its container or the window; the arrow keys move the handle 1 rem, and 5 with <kbd>Shift</kbd>. It starts at `defaultWidth`, 17.5 rem, which a double click on the handle returns to. `width` and `onWidthChange` let the application keep the width for the next visit, in rem: `onWidthChange` reports each width while dragging, and with `committed` true as a drag ends, a key moves the handle or a double click resets it. A `width` that isn't a finite number is ignored. `resizeLabel` names the handle.

The example keeps the width in the browser's storage. It reads it once the drawer is in the browser, so a page rendered on a server starts at the default, and guards, since storage can be blocked or hold something that isn't a number.

```tsx source=ResizableDrawer

```

A heading cut short takes no focus, so it gives its full text as its `title`. Keep a resizable drawer off `background="page"`, so its handle doesn't float beside the page's content, and leave `resizable` off a drawer in a sheet of a narrow window.

### Composition

The parts the anatomy doesn't show: a section's row, `env-drawer-branch-row`, and the handle on a resizable drawer's end edge, `env-drawer-resize-handle`, the same grip as Panes.Divider's; the rail's list of destinations, `env-rail-list`, which scrolls where the rail is shorter; the bar's row of destinations, `env-bar-list`, and More, `env-bar-more`. The current item of each has `data-current`, a section's button `aria-expanded`, and a form on the page's background `data-background="page"`.

### Customize

`--env-drawer-item-container`, `--env-drawer-item-content`, `--env-drawer-item-icon`, `--env-drawer-item-selected` and `--env-drawer-item-selected-content` color one Drawer's items, through `style` or CSS: their fill, their label, their icon, and the current item's fill and its label and icon. Rail takes `--env-rail-item-container`, `--env-rail-item-content`, `--env-rail-item-icon`, `--env-rail-item-selected` and `--env-rail-item-selected-content`, and Bar `--env-bar-item-container`, `--env-bar-item-content`, `--env-bar-item-icon`, `--env-bar-item-selected` and `--env-bar-item-selected-content`. Hover, focus and press follow them; with none set, each keeps its own colors.

## Changelog

- **1.0.0-prerelease.5**: A Sheet is on the navigation's background, `--env-color-bg-default`, so a Drawer or a Rail in the sheet of a narrow window keeps its color.
- **1.0.0-prerelease.4**: A destination's `children` nest under it: Drawer shows them indented, in a section that opens and closes with a chevron, open while it holds the current destination, whose links stay in the page, hidden until found. A section without `href` or `onSelect` is only its heading. `expanded`, `defaultExpanded` and `onExpandedChange` keep the open sections. Rail and Bar show the top level, and mark a destination whose section holds the current one.
- **1.0.0-prerelease.3**: A resizable Drawer keeps each label and group heading on one line as it narrows: one that doesn't fit ends in an ellipsis, a label cut short shows in full in a tooltip, and a heading cut short gives its full text as its title. Bar and Rail are documented on this page, `drawer`, which their pages' addresses open.
- **1.0.0-prerelease.2**: With `resizable`, people resize it by its end edge, between `minWidth` and `maxWidth` and never past half its container, from `defaultWidth`; `width` and `onWidthChange` keep it. The handle is `env-drawer-resize-handle`, the same grip as Panes.Divider's.
- **1.0.0**: Drawer, the navigation drawer, Rail, the navigation rail, and Bar, the navigation bar; together they replace NavList and the sidebar's rail. NavList.Item's `selected` is a destination's `current`, its `end` count is `count`, and NavList.Group is a destination's `group`.
