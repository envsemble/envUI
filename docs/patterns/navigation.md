---
title: Navigation
summary: Let people move between the places of an application, see where they are, and find their way back.
status: beta
since: 1.0.0
intent: Frame the application
aliases:
  - navigation
  - primary navigation
  - navigation forms
  - wayfinding
  - current page
  - route change
  - breadcrumb trail
  - quick open
  - tabs or navigation
useWhen:
  - Several places people move between
  - Showing where people are and the way back up
avoidWhen:
  - text: Showing more of the page's content without leaving the page.
    see: progressive-disclosure
  - text: Moving between pages of one long list.
    use: Pagination
  - text: A list beside the detail of its selected item.
    use: Panes
  - text: A whole frame to copy, with the navigation and a top bar.
    see: app-frame
composes:
  - Scaffold
  - TopBar
  - NavigationBar
  - NavigationRail
  - NavigationDrawer
  - Breadcrumbs
  - Page
  - PageHeader
  - Tabs
  - Pager
  - IconButton
  - Tooltip
  - CommandPalette
  - Panes
  - Surface
  - LinkProvider
  - Link
  - List
  - DescriptionList
  - Badge
  - Button
  - Column
  - Row
  - Text
examples:
  PrimaryNavigation:
    role: overview
    stage: shaded
    motion: true
  Hierarchy: example
  ViewsOfOneThing: example
  ListAndDetail: example
  NavigationAnatomy: anatomy
  TabsForViews:
    role: do
    caption: Tabs for the views of the one thing the page is about.
  TabsForPlaces:
    role: dont
    caption: 'Tabs for places of the application: they have no address of their own.'
---

# Navigation

## Variants

### Hierarchy

The trail shows the levels above the page, each a link; the page itself is the last level and no link.

```tsx figure=Hierarchy

```

### Views of one thing

Tabs switch the views of one project in place. Its settings are another page, so they are a link in the header's actions.

```tsx figure=ViewsOfOneThing motion

```

### List and detail

As narrow as a phone, the detail shows in place of the list, with a back button that names where it goes.

```tsx figure=ListAndDetail motion

```

## Anatomy

```tsx figure=NavigationAnatomy stage="shaded"

```

1. **Primary navigation** (`env-navigation-rail`)
2. **Quick open** (`env-top-bar-actions > env-icon-button`)
3. **Trail** (`env-breadcrumbs`)
4. **Views** (`env-tabs-list`)

Not shown: the [Pager](../components/pager.md) at the end of a page read in order.

## Behaviour

### Changing the page

After the router shows the new page, the window's title names it, such as "Projects – Northwind". Every place has an address of its own, opened by the application's router.

## Rules

The primary navigation marks the current page, a trail leads back up from deep pages, and a search opens anything by name.

### Which to use

Each kind of navigation answers its own need, and a page can use several.

| Navigation      | Use for                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Destinations    | The places of the application: one list, which the [Scaffold](../components/scaffold.md) shows as a bar, a rail or a drawer. |
| Breadcrumbs     | A page two or more levels down, on one line in its [PageHeader](../components/page.md).                                      |
| Tabs            | Views of the object a page is about, under its header.                                                                       |
| Pager           | Pages read in order, at the end of the content.                                                                              |
| Command palette | Opening anything by name, as [CommandPalette](../components/command-palette.md) shows.                                       |
| List and detail | A list whose items open beside it, in [Panes](../components/panes.md).                                                       |

```tsx figure=TabsForViews

```

```tsx figure=TabsForPlaces

```

### One primary navigation

One primary navigation, in the same order on every page, and never hidden behind a menu on a wide window.

### Pages below a place

On a page below a place, such as one project, keep the place current and let the trail say the rest.

### Content

Name each place with a short noun, the word of its page's title.

- Name the navigation after its role, "Main", rather than its look.
- Name a link after its destination: "Project settings", not "More".

## Accessibility

### Focus and keyboard

After a page opens, from a destination, a trail level or a search result, focus moves to its body or heading, so a screen reader reads it from the start. Tabs are one tab stop whose arrow keys move between them.

### envUI provides

- Skip links, the banner and main landmarks, and a body that takes focus without being a tab stop.
- `aria-current="page"` on the current destination and the last trail level.
- Tabs with their roles and roving tab stop; a palette that announces the number of results.
- Panes' focus moves between the list and the detail while one shows at a time.

### You provide

- `current` on the place shown, focus after each change of page, and `document.title`.
- `LinkProvider` with the router's link, and an `href` on every place.

## Compose

### Usage

Build one array of destinations, each with its `label`, `icon` and `href`, `current` on the place shown, and optionally a `count`, a `group` and an `onClick`.

- Give the same array to a NavigationBar, a NavigationRail and a NavigationDrawer, in the Scaffold's `navigation` as `bar`, `rail` and `drawer`.
- Render every `href` through the router's link with `LinkProvider`.
- After the router shows the new page, set `document.title`, such as "Projects – Northwind", and move focus to the body or the page's heading.

```tsx source=PrimaryNavigation

```

#### Hierarchy

Pass Breadcrumbs with `wrap={false}` to the PageHeader's `breadcrumbs`, from two levels down. Each level above the page is an item with `label` and `href`; the last item, the page, has only its `label`.

```tsx
<PageHeader
  title="Brand guide"
  breadcrumbs={
    <Breadcrumbs
      wrap={false}
      items={[
        { label: 'Projects', href: '/projects' },
        { label: 'Website refresh', href: '/projects/website-refresh' },
        { label: 'Brand guide' },
      ]}
    />
  }
/>
```

#### Views and quick open

Tabs go under the PageHeader for the views of the object the page is about; a link to another page, such as its settings, goes in the PageHeader's `actions`. A CommandPalette, opened by a [search button](../components/command-palette.md#opening-it-the-button-and-the-shortcut) in the TopBar and by ⌘K or Ctrl+K, lists the destinations as items and opens the chosen one through the router.

#### List and detail

`Panes.Root` with `behavior="list-detail"` and a `backLabel` that names the list, such as "All projects", holds a `Panes.List`, a `Panes.Divider` and a `Panes.Detail`, each with its `label`.

```tsx
<Panes.Root
  behavior="list-detail"
  open={detailShown}
  onOpenChange={setDetailShown}
  backLabel="All projects"
>
  <Panes.List label="Projects">{list}</Panes.List>
  <Panes.Divider label="Resize project list" />
  <Panes.Detail label={chosen.name}>{detail}</Panes.Detail>
</Panes.Root>
```

### Composition

The primary navigation is a NavigationRail here, from Scaffold's `navigation`; the trail is Breadcrumbs in the PageHeader, the views Tabs below it, and quick open an IconButton in the TopBar's actions. A Pager ends a page read in order. The parts are the rail, `env-navigation-rail`, the quick-open button, `env-top-bar-actions > env-icon-button`, the trail, `env-breadcrumbs`, and the tabs, `env-tabs-list`.

## Changelog

- **1.0.0**: The page is on the figure template.
