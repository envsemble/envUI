---
title: PageHeader
summary: A page's heading row, with its title, an optional trail and description, its actions and a toolbar row, that wraps to its own width and can stick to the top.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - page header
  - page heading
  - page title
  - header bar
  - title bar
  - page toolbar
  - heading row
  - sticky header
useWhen:
  - A page opens with its title and the actions that apply to the whole page, such as New project.
  - A page needs its trail, a status or a count beside its title, or a row of search and filters under it.
  - The page's heading should stay in view as the page scrolls.
avoidWhen:
  - text: The application's bar across every page, with its name, search and account menu.
    use: TopBar
  - text: The heading of a section inside a page, with its own actions.
    use: Row
  - text: A heading with metadata and actions around a block of content.
    use: Card
  - text: Controls for one subject that the arrow keys move between.
    use: Toolbar
related:
  - page
  - breadcrumbs
  - toolbar
  - row
  - button
components:
  - PageHeader
---

# PageHeader

## Overview

PageHeader is the heading of a page: its title, with an optional trail above it, a description under it, something before it, such as an avatar, meta beside it, such as a status, the page's actions at the end of the row and an optional toolbar row of search and filters below. It responds to its own width, so it wraps the same way in a wide window and in a narrow pane, and it can stick to the top of the page as the page scrolls. Put it in a [Page](../components/page.md)'s `header`.

```tsx example=WithBreadcrumbs

```

## Anatomy

1. **Breadcrumbs** (`breadcrumbs`): the trail to the page, usually `<Breadcrumbs wrap={false} />`, which cuts long levels short on one line.
2. **Start** (`start`): an Avatar, an icon or a back IconButton before the title.
3. **Title** (`title`, `headingLevel`): the page's heading, an `h1` unless `headingLevel` says otherwise, in the headline style.
4. **Meta** (`meta`): Badges or a count beside the title, wrapping with it.
5. **Description** (`description`): a sentence in the smaller muted text under the title.
6. **Actions** (`actions`): the page's buttons at the end of the title row, the primary one last.
7. **Toolbar** (`toolbar`): a second row for search, filters and view switches.

## Variants and sizes

- **Control size**: `controlSize` gives the buttons and icon buttons in `actions` and `toolbar` that set no `size` the `md` height, 2.5 rem, by default, or `sm`, 2 rem, for a dense page, such as one in a small window. Fields take their own `size`: give a toolbar's fields the same one.
- **Sticky**: `sticky` keeps the header in view at the top of the area that scrolls, such as a Scaffold's body, with the page's background and a hairline under it.
- **Heading level**: the title looks the same at every level; set `headingLevel` to 2 or lower for a header inside a pane or a dialog that sits under another heading.

## States and behaviour

- **Wrapping**: the header is a container. Below 32 rem of its own width, the actions move under the title and description and wrap, from the inline start; the meta wraps beside the title. The title wraps, balanced across its lines, and is never cut short.
- **No overflow menu**: the header never hides actions on its own. A page with more actions than fit on a phone puts the rest in a [Menu](../components/menu.md) as its last action.
- **Sticky**: the header sticks at the top of the area that scrolls, such as a Scaffold's body. Nothing measures it: as a Page's header, what scrolls into view in the page's content, such as a field taking focus, keeps clear of it by a scroll margin that CSS reckons from the rows it has. Put content that should stay in view under it in its `toolbar`.

## Content guidelines

- Title a page with what it holds, in a few words, such as "Projects" or the item's name, not with an instruction.
- Keep the description to one sentence that says what the page is for; leave it out where the title says enough.
- Name actions with a verb and a noun, such as "New project"; keep to the few that apply to the whole page, with the primary one last.

## Do and don't

### Do

- Give a page one PageHeader, with the page's `h1`.
- Use `toolbar` for search, filters and view switches, laid out with a [Row](../components/row.md), as [Toolbar's layouts](../components/toolbar.md#layouts) describe.
- Use `controlSize="sm"` on dense pages instead of overriding control heights.

### Don't

- Don't put the application's navigation or account menu in a page's header; they belong to the frame.
- Don't wrap the toolbar row in a Toolbar when it holds a text field; the field needs its arrow keys.
- Don't put more than one primary action in `actions`.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the trail, the actions and the toolbar in reading order; PageHeader handles no keys of its own. |

### envUI provides

- A `div`, which is no landmark wherever the header sits, so a page never gets a second banner, with the title as a heading at `headingLevel`.
- The parts in reading order, the same as the visual order at every width, so focus never jumps back.
- The control size for the buttons and fields in `actions` and `toolbar`.

### You provide

- A title that names the page, and a `headingLevel` that fits the headings around it.
- Names for icon-only actions, and an `aria-label` on a Breadcrumbs trail where a page has several.
- Labels for the fields in the toolbar.

## Examples

### Search and filters

A toolbar row under the title holds the search field and a view switch, with small controls.

```tsx example=WithToolbar

```

### Sticky

The header stays at the top as the page scrolls under it.

```tsx example=Sticky

```

### In a narrow pane

In a side panel the actions move under the title and wrap; an avatar leads the title.

```tsx example=InANarrowPane

```

## Changelog

- **1.0.0**: PageHeader, with `title`, `headingLevel`, `description`, `breadcrumbs`, `start`, `meta`, `actions`, `toolbar`, `sticky` and `controlSize`.
