---
title: Scaffold
summary: The invisible frame of an application's screen, around its top bar, its navigation and the page.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - AppShell
  - app shell
  - app frame
  - application frame
  - app layout
  - shell
  - frame
  - layout
  - skip links
  - WindowFrame
  - collapsible sidebar
  - collapse navigation
  - icon strip
useWhen:
  - An application's screen, with a top bar, its navigation and the page
  - A window without navigation, such as a start page, under its title bar
avoidWhen:
  - text: A readable column for a page's content, with its gutters.
    use: Page
  - text: Two panes side by side inside the body, such as a list and its detail.
    use: Panes
  - text: A whole frame to copy, with the navigation and a top bar, or an installed app's window.
    see: app-frame
components:
  - Scaffold
  - resolveNavigationForms
examples:
  NavigationForms:
    role: overview
    stage: shaded
  ChooseForms:
    role: example
    caption: A drawer only, and none on a phone.
  NarrowNavigation: example
  TitleBarAcross: example
  TopBarOnThePage: example
  ScaffoldAnatomy: anatomy
  FormsByWidth: example
---

# Scaffold

## Variants

### The navigation for each width

Scaffold shows the [navigation](drawer.md) that fits its own width: the bar on a phone, the rail on a tablet and the drawer on wider windows.

- The application can choose another form for a width, or none, such as on a phone where the top bar opens the navigation.
- Where it asks for a form it didn't give, the nearest one shows.

```tsx figure=ChooseForms stage=shaded widths="44 30" sweep classes

```

### A button that narrows the navigation

A button can narrow the navigation to a strip of icons by asking for the rail in place of the drawer, and the application keeps the choice.

- Don't build a narrow drawer of your own: the Scaffold already has both forms.

```tsx figure=NarrowNavigation stage=shaded

```

### A title bar across

The top bar can run across the whole width, above the rail or the drawer, as a window's title bar needs.

```tsx figure=TitleBarAcross stage=shaded

```

### Backgrounds

The navigation and the top bar share one fill, flush with the window's edges and the body, with no line between them.

- Either can sit on the page's background instead, such as a top bar beside a drawer.

```tsx figure=TopBarOnThePage stage=shaded

```

## Anatomy

```tsx figure=ScaffoldAnatomy stage=shaded

```

1. **Root** (`env-scaffold`)
2. **Top bar** (`env-scaffold-top-bar`, `topBar`)
3. **Navigation** (`env-scaffold-rail`, `navigation`)
4. **Body** (`env-scaffold-body`, `children`)

Not shown: the skip links, and the places of the bar and the drawer.

## Behaviour

### Scrolling

The bars stay in view as the page scrolls.

### Adapting to width

The Scaffold follows its own width, not the window's.

- Focus in a navigation that hides moves to the one that shows.

```tsx figure=FormsByWidth stage=shaded widths="24 44 54" sweep classes

```

## Rules

Scaffold paints nothing itself: what goes in its top bar, its navigation and its body does.

### One for the whole application

One Scaffold sits at the application's root and stays as the pages change.

- The current page, usually a [Page](page.md) or [Panes](panes.md), is its body.

## Accessibility

### Keyboard

| Key                                                         | Action                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd> on a fresh page                              | Shows Skip to content, then Skip to navigation.                                       |
| <kbd>Enter</kbd> on a skip link                             | Moves focus to the body, or to the navigation form that shows.                        |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>  | Scroll the page, or the body where it scrolls alone, also with focus on the document. |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | The same, unless a field or a widget that uses the key has focus.                     |

### envUI provides

- The top bar as the banner and the body as the main landmark; `landmarks={false}` renders divs and no skip links, for a preview inside another page.
- Skip links, named in the provider's language.
- Only the form that shows in the accessibility tree and the tab order.

### You provide

- The navigation forms, each a named `nav`, with the current destination marked.
- The page's one `h1`, usually its PageHeader's title, and focus and `document.title` after a navigation.

## Compose

### Usage

Render one Scaffold at the application's root, around the router's outlet, and keep it mounted as the pages change.

- `topBar` holds the top bar, usually a TopBar.
- `navigation` holds the forms, such as `{ bar: <Bar … />, rail: <Rail … />, drawer: <Drawer … /> }`, with the same destinations.
- `children` is the body, the current page, usually a Page or Panes.
- One form shows at a time, chosen by the Scaffold's own width, in CSS; give only the forms the application uses, and don't pick one in script from the window's width.

```tsx source=NavigationForms

```

#### Which form shows

`forms` sets which form shows at each window class, `compact`, `medium`, `expanded` and `large`, or `none`; the default is `{ compact: 'bar', medium: 'rail', expanded: 'drawer', large: 'drawer' }`.

- The window classes are those of the Scaffold's own width: `compact` below 37.5 rem, `medium` from 37.5 to 52.5 rem, `expanded` from 52.5 to 75 rem and `large` from 75 rem.
- `{ compact: 'none' }` suits an application that opens its navigation from the top bar on a phone.
- Where the form a window class asks for wasn't given, the nearest given form shows: a rail for a drawer and the other way round, then the bar.

```tsx
<Scaffold
  forms={{ compact: 'none' }}
  topBar={<TopBar title="Settings" />}
  navigation={{ drawer: <Drawer aria-label="Settings" destinations={destinations} /> }}
>
  …
</Scaffold>
```

#### A button that narrows the navigation

A button that narrows the navigation sets `forms={{ expanded: 'rail', large: 'rail' }}`, and the application keeps the choice, such as in `localStorage`.

```tsx
<Scaffold
  forms={narrow ? { expanded: 'rail', large: 'rail' } : undefined}
  topBar={
    <TopBar
      start={
        <IconButton
          icon={narrow ? <LeftPanelOpen /> : <LeftPanelClose />}
          aria-label={narrow ? 'Show full navigation' : 'Narrow navigation'}
          onClick={toggle}
        />
      }
      title="Northwind"
    />
  }
  navigation={{ bar: <Bar … />, rail: <Rail … />, drawer: <Drawer … /> }}
>
  …
</Scaffold>
```

#### Top bar span and backgrounds

- `topBarSpan` is `body`, the default, where the top bar sits above the body beside the rail or drawer, which run the full height, or `full`, where it runs across the whole width above the navigation, as a window's title bar must.
- `background="page"` on a TopBar, a Rail or a Drawer puts it on the page's background instead of the navigation's, the default; on a surface, such as a Sheet, both values take the surface's color.

```tsx
<Scaffold topBar={<TopBar title="Northwind" background="page" />} navigation={{ drawer }}>
  …
</Scaffold>
```

#### Scrolling

`scroll` is `document`, the default, where the page scrolls: a phone collapses its address bar, pull to refresh and a tap on the status bar work, the browser restores the scroll position, the top bar and the bar stick to the window's edges and the rail or the drawer stays in view, in a Scaffold at least as tall as the window.

- With `scroll="body"`, the body alone scrolls under the top bar, in a Scaffold that fills its container's height, `100dvh` unless a class gives it another, with the keyboard scrolling the body as it would the document.
- It suits a preview or an embedded frame, a window with its own title bar, or a body of Panes whose panes scroll on their own. Give the Scaffold a block size then, as these examples do.
- `bodyRef` reaches the body, to read or restore its scroll position.

#### Landmarks and skip links

The top bar is the banner landmark and the body the main one, with the id `bodyId`, `main` by default, the target of the skip link.

- `skipLabel` and `skipNavigationLabel` name the skip links, Skip to content and Skip to navigation by default, from EnvUIProvider's `messages.scaffold`.
- `landmarks={false}` renders divs and no skip links, for a preview of an application inside another page's main content.
- `name` names the node for dev mode, as `data-env-name`.

### Composition

The parts are the root, `env-scaffold`, the top bar, `env-scaffold-top-bar`, the navigation's places, `env-scaffold-bar`, `env-scaffold-rail` and `env-scaffold-drawer`, the body, `env-scaffold-body`, and the skip links, `env-scaffold-skip-links`.

- The page's title and actions go in its PageHeader, not the top bar, which belongs to the frame; the [app frame](../patterns/app-frame.md) pattern puts them together.

## Changelog

- **1.0.0**: Scaffold, which replaces AppShell and WindowFrame: a top bar region, the navigation forms by window class, and the body, with the document or the body scrolling.
