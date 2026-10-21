---
title: Navigation
summary: Let people move between the places of an application, see where they are, and find their way back.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - navigation
  - primary navigation
  - sidebar navigation
  - wayfinding
  - current page
  - route change
  - breadcrumb trail
  - quick open
  - tabs or navigation
useWhen:
  - An application has several places, and people move between them.
  - People need to see where they are, how they got there and how to go back up.
avoidWhen:
  - text: Narrowing a long list or a table to the items people want.
    see: filtering
  - text: Showing more of the page's content without leaving the page.
    see: progressive-disclosure
  - text: Moving between pages of one long list.
    use: Pagination
composes:
  - AppShell
  - Sidebar
  - SidebarTrigger
  - NavList
  - CounterBadge
  - Breadcrumbs
  - Page
  - PageHeader
  - Tabs
  - Pager
  - SearchTrigger
  - CommandPalette
  - ListDetail
  - LinkProvider
  - Link
  - List
  - DescriptionList
  - Badge
  - Button
  - Column
  - Row
  - Text
related:
  - filtering
  - loading
  - app-shell
  - sidebar
  - nav-list
  - breadcrumbs
---

# Navigation

## Overview

Use this pattern to give an application one way around and a clear sense of place: one primary navigation that marks the current page, a trail back up for pages deep in a hierarchy, tabs only for views of one thing, and a quick way to open anything by name. After every change of page, focus and the window's title follow.

```tsx example=PrimaryNavigation

```

## Anatomy

1. **Frame:** [AppShell.Root](../components/app-shell.md) around everything, with `AppShell.SkipLinks` as the first tab stop, an `AppShell.Header` with `mobileOnly` for phones, and `AppShell.Main` for the page.
2. **Primary navigation:** one [Sidebar.Root](../components/sidebar.md) with `label="Primary"`, a [SidebarTrigger](../components/sidebar.md) in its `Sidebar.Header`, and a [NavList](../components/nav-list.md) in `Sidebar.Content`. Mark the current page with `selected` on its `NavList.Item`. Put less frequent places under a `Sidebar.Group` with a `label`, and a count on an item with `end`, such as a [CounterBadge](../components/badge.md).
3. **Trail:** [Breadcrumbs](../components/breadcrumbs.md) with `wrap={false}` in the `breadcrumbs` of the page's [PageHeader](../components/page-header.md), for a page two or more levels below a place in the primary navigation.
4. **Views of one thing:** [Tabs](../components/tabs.md) under the PageHeader, for views of the object the page is about, such as a project's tasks and files.
5. **Sequence:** a [Pager](../components/pager.md) at the end of the content, for pages read in order, such as a guide's chapters.
6. **Quick open:** a [SearchTrigger](../components/search-trigger.md) at the top of the sidebar, with `fullWidth`, that opens a [CommandPalette](../components/command-palette.md) of places, projects, documents and people.
7. **List and detail:** [ListDetail](../components/split-pane.md) for a list whose items open beside it, as in an inbox, which shows one at a time with a back button on narrow screens.
8. **Links:** `href` on every NavList item, Breadcrumbs level and [Link](../components/link.md), rendered by the router's link through [LinkProvider](../setup.md#connect-your-router).

## States and behaviour

- **One primary navigation.** The sidebar lists the places of the application, and stays the same on every page. Don't add a second list of the same places elsewhere, such as in the header.
- **The current page.** The item of the page shown is `selected`. On a page below it, such as one project, keep its place selected, Projects, and let the trail say the rest.
- **Changing the page.** The router shows the new page. Then move focus to `AppShell.Main`, which takes focus without being a tab stop, or to the page's `h1`, and set `document.title` to the page's name and the application's, "Projects – Northwind". A page that loads first shows its progress with `loading` on AppShell.Root; see [Loading](loading.md).
- **The trail.** Breadcrumbs show the levels above the page, each a link; the last level names the page and is no link. Show it from the second level down; a top-level page needs none.
- **Tabs or navigation.** Tabs switch what shows below them, in place, for one object. A different place, even a related one such as a project's settings, is a link, in the NavList or as a button with `href`.
- **Quick open.** The trigger's shortcut, <kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>⌘</kbd>+<kbd>K</kbd>, opens the palette from anywhere. Choosing a result opens it as a link would; the palette closes and focus moves to the new page.
- **Narrow windows.** Below the frame's breakpoint the sidebar becomes a drawer that the SidebarTrigger in the phone's header opens; a press on a link in it closes it. ListDetail shows the list or the detail, one at a time.
- **Connect your router.** Wire `LinkProvider` to the router's link once, at the root, as [setup](../setup.md#connect-your-router) describes; envUI's links then navigate without loading the page again. The examples keep the page in state instead.

## Content guidelines

- Name each place with a short noun, the same word as the page's title: "Projects" in the sidebar opens the page "Projects".
- Name the navigation after its role, "Primary", rather than after its look, such as "Sidebar".
- Use the page's own title as its level in the trail, cut short only by the component.
- Label tabs with nouns for the views, "Tasks" and "Files", in sentence case, as [Capitalisation and punctuation](../foundations/content.md#capitalisation-and-punctuation) describes.
- Name a link after its destination, as [Buttons and actions](../foundations/content.md#buttons-and-actions) describes: "Project settings", not "More".

## Do and don't

### Do

- Keep one primary navigation, in the same order on every page.
- Mark the current page, and move focus to it after it opens.
- Set the window's title on every page.
- Use links for places, so people can open them in a new tab and share their address.

### Don't

- Don't use tabs to move between places of the application.
- Don't put the current page in the trail as a link.
- Don't hide the primary navigation behind a menu on wide screens.
- Don't make a NavList item a button that changes the page without an address.

## Accessibility

### Focus and keyboard

The skip links come first: "Skip to content" moves focus to Main, and "Skip to Primary" to the sidebar. <kbd>Tab</kbd> moves through the NavList items, each a tab stop. After a press on an item, focus moves to Main or to the new page's heading, so the screen reader reads the new page from its start. A press on a Breadcrumbs level does the same. In the phone's drawer, focus stays inside while it is open, <kbd>Esc</kbd> closes it, and a press on a link closes it too. Tabs are one tab stop: the arrow keys move between them, and <kbd>Tab</kbd> goes on to the panel. The palette takes focus into its field, keeps it inside, and returns it as it closes; after a result opens a page, move focus to that page. In a stacked ListDetail, opening an item moves focus to the back button, and the back button returns it to the item.

### envUI provides

- A sidebar that is a `nav` landmark named by its `label`, a skip link to it and to Main, and a drawer that traps focus and closes with <kbd>Esc</kbd>.
- `aria-current="page"` on the selected NavList item, and on the last Breadcrumbs level, in a `nav` named "Breadcrumb".
- A SidebarTrigger that reports `aria-expanded` and the sidebar it controls, with its name in a tooltip.
- `AppShell.Main` with `tabIndex={-1}`, so it can take focus without becoming a tab stop.
- Tabs with the tab, tab list and tab panel roles, and a roving tab stop.
- A CommandPalette that announces the number of results, and a SearchTrigger that announces its shortcut with `aria-keyshortcuts`.
- ListDetail's focus moves between the list and the detail while stacked.

### You provide

- One primary navigation, labelled "Primary", and `selected` on the current page.
- Focus on Main or the page's heading after each change of page, and `document.title`.
- `LinkProvider` with the router's link, and an `href` on every place.
- `aria-current` on the chosen item's link in a ListDetail list, where its back button returns focus.
- Names for icon-only items, and a CounterBadge `aria-label` that says what it counts, such as "3 unread".

## Examples

### Hierarchy

Breadcrumbs in the PageHeader show the levels above the page, and each level below links one level down. A press on a level opens it, and focus moves to its heading.

```tsx example=Hierarchy

```

### Views of one thing

Tabs switch the views of one project in place. Its settings are another page, so they are a link in the header's actions, not a tab.

```tsx example=ViewsOfOneThing

```

### Quick open

The SearchTrigger opens a CommandPalette of pages, projects, documents and people. In an application its shortcut opens it too; here it takes `listen={false}`, so <kbd>Ctrl</kbd>+<kbd>K</kbd> stays with the catalogue's own search. Choosing a result opens it, and focus moves to the new page's heading once the palette has closed.

```tsx example=QuickOpen

```

### List and detail

A list of projects, as narrow as a phone, shows its detail in place of the list. The back button names where it goes, "All projects", and returns focus to the project that was open.

```tsx example=ListAndDetail

```
