---
title: Drawer
summary: A full-height panel that slides in from the start or end edge of the window, for filters, details, an inspector or a phone's navigation.
status: beta
since: 1.0.0
category: Feedback & overlays
aliases:
  - side panel
  - sheet
  - inspector
  - off-canvas
  - flyout
  - navigation drawer
  - right panel
  - Dialog placement right
useWhen:
  - An item's details or settings open beside the list they belong to, modal or with the page usable beside them.
  - Filters for a list or a table, applied when people close the panel.
  - The navigation of a narrow window, such as a phone's, slides in from the start edge.
avoidWhen:
  - text: A focused task or a decision in the middle of the window.
    use: Dialog
  - text: Details or a few fields beside the control that opens them.
    use: Popover
  - text: Items people keep open and work on beside the page, such as drafts.
    use: PanelDock
related:
  - dialog
  - popover
  - close-button
  - panel-dock
components:
  - Drawer
---

# Drawer

## Overview

A drawer is a full-height panel at an edge of the window, over the page or beside it. It holds what belongs next to the page rather than in front of it: an item's details, filters, an inspector, or the navigation of a narrow window. Drawer is built on Base UI's drawer, which moves focus into it, keeps focus inside a modal drawer, returns focus when it closes, and closes it on <kbd>Esc</kbd>, outside presses and a swipe toward its edge.

Here a drawer at the end edge holds the filters of a list, and a DialogClose shows the result and closes it. Its `side` is logical: `end`, the default, is the right edge in left-to-right text and the left in right-to-left text, and `start` the other. It shares Dialog's surface, title, description and actions, and DialogClose closes it as it closes a dialog.

```tsx example=FilterPanel

```

## Anatomy

1. **Backdrop** (modal drawers): a translucent overlay over the page. A press on it closes the drawer.
2. **Surface**: the dialog's raised surface with square corners and 1.5 rem padding, the window's full height, and a hairline border at its inner edge only, which it drops across the whole width of a narrow window. The ref and other `div` props, such as `id`, `className` and `style`, reach the surface.
3. **Title** (optional, `title`): an `h2` in the page heading type, which names the drawer. Without one, name it with `aria-label`.
4. **Close button** (`closeButton`, on by default): a CloseButton at the end of the heading, named by `closeLabel`.
5. **Description** (optional, `description`): muted small text under the title, which describes the drawer.
6. **Content** (`children`): 1.5 rem below the heading. It scrolls inside the surface.
7. **Actions** (optional, `actions`): a row aligned to the end of the content, with the primary action last.

## Variants and sizes

| Side            | Use for                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `end` (default) | Details, settings, filters and inspectors, beside the content they belong to. |
| `start`         | Navigation, where the application's sidebar is, such as a phone's menu.       |

| Width          | Size                      | Use for                                                                                   |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| `md` (default) | 24 rem                    | Details, settings and filters.                                                            |
| `lg`           | 44 rem                    | Tables, comparisons and longer forms.                                                     |
| A CSS length   | As given, such as `20rem` | A drawer the application sizes itself, such as a navigation drawer that fits its sidebar. |

| `modal`          | Use for                                                         |
| ---------------- | --------------------------------------------------------------- |
| `true` (default) | A panel people finish or close before they go back to the page. |
| `false`          | A panel beside a page that stays usable, such as an inspector.  |

- A `md` drawer takes the whole width of a window narrower than 28 rem, and a `lg` one of a window narrower than 48 rem, with its content clear of the safe areas on both sides, such as a phone's rounded corners in landscape. A drawer with a CSS length never grows past the window.
- At its outer edge the content keeps clear of that edge's safe area, also at the top and bottom of the window.

## States and behaviour

- **Opening**: `trigger` opens the drawer and reports it with `aria-haspopup`, `aria-expanded` and `aria-controls`; `defaultOpen` opens it on the first render. To control it, pass `open` and `onOpenChange`, which receives the requested state and, in its second argument, the `reason`: `trigger-press`, `escape-key`, `outside-press`, `close-press`, `focus-out` or `swipe`.
- **Closing**: <kbd>Esc</kbd>, a press outside, the close button, a DialogClose and a swipe toward the drawer's edge on a touch screen close it. `actions` don't close it by themselves: set `open` to false, or use DialogClose.
- **Non-modal**: with `modal={false}` the page stays usable beside the drawer, which has no backdrop and closes when focus or a press goes outside it, unless `disablePointerDismissal`, as an inspector needs.
- **Pending**: while `pending` is true, nothing dismisses the drawer, its close button is disabled and it reports `aria-busy`.
- **Focus on open**: focus moves to `initialFocus`, a ref or a function of how the drawer was opened, or else, opened by keyboard or mouse, to the first element inside that takes Tab, such as the close button. Opened by touch, or with nothing inside that takes focus, the drawer itself takes focus, so a field inside doesn't open the on-screen keyboard.
- **Focus on close**: focus returns to `finalFocus`, a ref or a function of how it closed, or else to the trigger, or to the element that had focus when it opened.
- **Direction**: the drawer reads the text direction at its trigger as it opens, or the nearest EnvUIProvider's `dir`, so its side, its slide and its swipe follow it.
- **Theme**: the drawer renders in a portal in the theme of the place it opens from.
- **Motion**: the drawer slides in from its edge over a backdrop that fades in, and follows a finger that swipes it toward its edge. With a reduced-motion preference it only fades.

## Content guidelines

- Name the drawer after what it holds, in sentence case: "Filters", "Alex Morgan", "Notification settings".
- Name the close button after what it closes where the page has several panels, such as "Close filters".
- Name the primary action after its result, such as "Show 12 projects", rather than "Apply".

## Do and don't

### Do

- Give a drawer a title, or an `aria-label` where a visible heading would repeat what the page shows, as for navigation.
- Use a non-modal drawer with `disablePointerDismissal` for an inspector, and `finalFocus` to return focus to the row it showed.
- Keep the close button unless the drawer holds its own control that closes it, such as a sidebar's toggle.

### Don't

- Don't use a drawer for a decision that needs the page's attention; use [Dialog](../components/dialog.md).
- Don't open a drawer from another drawer; show the next level inside it.
- Don't put the only way to do something in a drawer that opens on hover.

## Accessibility

### Keyboard

| Key                                                                       | Action                                                                                                                                                                       |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger                       | Opens the drawer and moves focus into it.                                                                                                                                    |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                           | Moves focus to the next or previous element in the drawer. A modal drawer keeps focus inside, from its last element to its first; a non-modal one lets it go on to the page. |
| <kbd>Esc</kbd>                                                            | Closes the drawer, or first closes what is open inside it. Does nothing while `pending`.                                                                                     |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the close button or a DialogClose | Closes the drawer; focus returns to the trigger or `finalFocus`.                                                                                                             |

### envUI provides

- `role="dialog"`, named by the title or by `aria-label`, and described by the description.
- `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` on the trigger.
- Focus moved into the drawer on open, kept inside a modal drawer and returned on close.
- In a modal drawer, the rest of the page hidden from assistive technology, closed to presses and locked from scrolling.
- A close button named Close in the provider's language, also for touch screen reader users, who can't press <kbd>Esc</kbd>.
- `aria-busy` and a disabled close button while `pending`.
- Its side, slide and swipe in the text direction, and the originating theme in the portal.

### You provide

- A `title`, or an `aria-label`, that names the drawer.
- A `closeLabel` where several panels close nearby.
- `finalFocus` when the trigger is gone, or when something other than `trigger` opened the drawer.

## Examples

### Inspector beside the page

A non-modal drawer with `disablePointerDismissal` stays open while people choose another row, and shows that row. `finalFocus` returns focus to the row the drawer showed last.

```tsx example=InspectorPanel

```

### Navigation in a narrow window

A drawer at the start edge holds the navigation, named by `aria-label` and sized with a CSS length. Choosing a section closes it.

```tsx example=NavigationDrawer

```

## Changelog

- **1.0.0**: Drawer, for the panels that were Dialog's `placement="right"`, with `side`, `width`, a swipe to close and the text direction.
