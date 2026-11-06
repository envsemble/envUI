---
title: App frame
summary: Frame an application's screens and their navigation by the width of the window.
status: beta
since: 1.0.0
intent: Frame the application
aliases:
  - app frame
  - application frame
  - app layout
  - AppShell
  - app shell
  - shell
  - sidebar layout
  - main navigation
  - WindowFrame
  - window frame
  - title bar
  - Window Controls Overlay
  - installed app
  - desktop app
useWhen:
  - A handful of destinations, each with a page
  - An installed app that draws its own title bar
avoidWhen:
  - text: Moving between views of one object, such as its overview and its activity.
    use: Tabs
  - text: Choosing between a bar, a rail and a drawer by the window's width.
    use: Scaffold
  - text: A page's own title and actions.
    use: PageHeader
composes:
  - Scaffold
  - TopBar
  - NavigationBar
  - NavigationRail
  - NavigationDrawer
  - Sheet
  - Panes
  - List
  - Menubar
  - Tooltip
  - CommandPalette
  - Menu
  - AvatarButton
  - Avatar
  - ThemeMenuRadioGroup
  - Page
  - PageHeader
  - IconButton
  - Button
  - Row
  - Column
  - Text
  - useContainerSize
examples:
  AppFrame:
    role: overview
    stage: shaded
    device: window
  WithDetails: example
  InstalledWindow: example
  MenuOnPhones: example
  AppFrameAnatomy: anatomy
  DestinationsInNavigation:
    role: do
    caption: Every destination in the navigation, and the page's own action in its header.
  DestinationsInTopBar:
    role: dont
    caption: 'More destinations in the top bar: people look for them in two places.'
---

# App frame

## Variants

### Details beside the page

Side content that is not navigation goes in a supporting pane of [Panes](../components/panes.md), in the body.

```tsx figure=WithDetails stage=shaded motion device=window

```

### An installed app's window

An installed app that draws its own title bar runs it across the whole window, above the navigation.

- A [Menubar](../components/menubar.md) goes at its start, where the app has one.
- Only the body scrolls below it, so the window's controls never cover a scrollbar.

```tsx figure=InstalledWindow stage=shaded widths="40"

```

## Anatomy

```tsx figure=AppFrameAnatomy stage=shaded

```

1. **Top bar** (`env-top-bar`)
2. **Search** (`env-top-bar-actions > env-icon-button`)
3. **Account menu** (`env-avatar-button`)
4. **Navigation** (`env-navigation-rail`)
5. **Page header** (`env-page-header`)
6. **Page** (`env-page`)

The app frame is one [Scaffold](../components/scaffold.md) at the application's root, around the router's outlet.

- A [TopBar](../components/top-bar.md) holds the name, [search](../components/command-palette.md#opening-it-the-button-and-the-shortcut) and the [account menu](account-and-organizations.md).
- The navigation sits beside the body.
- The page is in the body.
- The search opens a [CommandPalette](../components/command-palette.md), not shown.

## Behaviour

### Adapting to width

The navigation takes the form the frame's width calls for: a bar on a phone, a rail on a tablet and a drawer on wider windows.

- With many destinations, or none with icons, a phone shows no bar.
- A menu button in the top bar then opens the same NavigationDrawer in a [Sheet](../components/sheet.md).

```tsx figure=MenuOnPhones stage=shaded widths="22 44" sweep classes motion

```

## Rules

Every destination has one place, the navigation, so people never look for it in two.

```tsx figure=DestinationsInNavigation stage=shaded

```

```tsx figure=DestinationsInTopBar stage=shaded

```

### Content

Name each destination with one or two nouns, the words of its page's title.

- In an installed app, title the bar as the window's title would read, the document's or the application's name.
- Order the menubar's menus as the platform does: File, Edit, View.

## Accessibility

### Focus and keyboard

After a destination opens its page, move focus to the body or the page's heading.

### envUI provides

- The banner and main landmarks, the skip links, and only the form that shows in the accessibility tree.
- A `nav` per form, with `aria-current="page"` on the current destination.
- In an installed app's title bar, controls that stay clickable where the window drags.

### You provide

- Which destination is current, and `document.title` for each page, also in an installed app's window.
- The page's one `h1`, in its PageHeader.
- Names for icon-only controls in the title bar.

## Compose

### Usage

Render one Scaffold at the application's root, around the router's outlet.

- Its `topBar` is a TopBar with the application's `title` and, in `actions`, the search IconButton in a Tooltip and the account menu's AvatarButton.
- Its `navigation` takes `bar`, `rail` and `drawer`, a NavigationBar, a NavigationRail and a NavigationDrawer given the same array of destinations, with `current` set from the router.
- The router's page, a Page with its PageHeader, is the Scaffold's children.
- The Scaffold shows the bar on a `compact` window, the rail on a `medium` one and the drawer from `expanded`, by its own container's width, and `navigationForms` changes the form for a window class; don't choose the form in script from the window's width.

```tsx source=AppFrame

```

#### A menu on phones

`navigationForms={{ compact: 'none', medium: 'drawer' }}` shows no navigation on a compact window and the drawer from medium. A menu IconButton in the TopBar's `start` opens a Sheet with `side="start"` holding the same NavigationDrawer, which closes the sheet when a destination is chosen.

```tsx
import { IconMenu } from '@envsemble/envui/icons/Menu';

<Scaffold
  navigationForms={{ compact: 'none', medium: 'drawer' }}
  topBar={
    <TopBar
      title="Guide"
      start={
        <IconButton
          icon={<IconMenu />}
          aria-label="Open the chapters"
          onClick={() => setMenu(true)}
        />
      }
    />
  }
  navigation={{ drawer: <NavigationDrawer aria-label="Chapters" destinations={destinations} /> }}
>
  {page}
  <Sheet side="start" aria-label="Chapters" open={menu} onOpenChange={setMenu}>
    <NavigationDrawer aria-label="Chapters" destinations={destinationsThatCloseTheSheet} />
  </Sheet>
</Scaffold>;
```

#### Details beside the page

`Panes.Root` with `behavior="supporting"` fills the Scaffold's body: `Panes.Main` holds the page, with a `Panes.Trigger` that opens `Panes.Supporting`, and each pane scrolls on its own.

#### An installed app's window

Give the Scaffold `topBarSpan="full"`, so its `topBar` runs across the whole window above the navigation, and `scroll="body"`, so only the body scrolls under it.

- The `topBar` is a TopBar with `titleBar` and the window's `title`.
- In a window that draws its own title bar, through the Window Controls Overlay, it fills the title bar area, leaves room for the system's window controls, drags the window by its empty space and centres its title.
- Its controls are small, with buttons that set no variant ghost.
- A Menubar goes in the TopBar's `start`; give the page's PageHeader `sticky` to keep it at the top of the scrolling body.
- In a browser tab the title bar area is undefined, and the TopBar falls back to its own height across the full width.
- Zoomed in, the window reports a smaller area, which the small controls still fit.

```tsx
<Scaffold
  scroll="body"
  topBarSpan="full"
  topBar={
    <TopBar
      titleBar
      title="Northwind"
      start={
        <Menubar.Root aria-label="Application menu">
          <Menubar.Menu label="File">
            <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
          </Menubar.Menu>
        </Menubar.Root>
      }
    />
  }
  navigation={{ drawer: <NavigationDrawer destinations={destinations} /> }}
>
  <Page header={<PageHeader title="Home" sticky />}>{content}</Page>
</Scaffold>
```

### Composition

The parts are the top bar, `env-top-bar`, the search button, `env-top-bar-actions > env-icon-button`, the account menu's `env-avatar-button`, the rail, `env-navigation-rail`, and the page, `env-page`, with its `env-page-header`. Search opens a [CommandPalette](../components/command-palette.md#opening-it-the-button-and-the-shortcut), and the account menu is the [account and organizations](account-and-organizations.md) pattern. In an installed app's window, the title bar is the Scaffold's `env-top-bar`, its menubar `env-menubar` and its title `env-top-bar-title`, above the body, `env-scaffold-body`.

## Changelog

- **1.0.0**: The app frame is a pattern built from Scaffold, TopBar and the navigation forms, in place of AppShell, the app frame template and the WindowFrame component; the window frame pattern is its installed app's window. The page is on the figure template.
