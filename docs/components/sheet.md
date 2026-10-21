---
title: Sheet
summary: A panel that slides in over the page from the end, the start or the bottom edge of the window, for filters, details, an inspector or a short set of choices.
status: beta
since: 1.0.0
category: Feedback & overlays
aliases:
  - side sheet
  - bottom sheet
  - side panel
  - inspector
  - off-canvas
  - flyout
  - right panel
  - Dialog placement right
useWhen:
  - An item's details or settings open beside the list they belong to, modal or with the page usable beside them.
  - Filters for a list or a table, applied when people close the panel.
  - A short set of choices from the bottom of the window, such as the ways to share.
avoidWhen:
  - text: A focused task or a decision in the middle of the window.
    use: Dialog
  - text: Details or a few fields beside the control that opens them.
    use: Popover
  - text: Items people keep open and work on beside the page, such as drafts.
    use: PanelDock
  - text: Side content that sits beside the main content in a wide window, such as details.
    use: Panes
related:
  - panes
  - dialog
  - popover
  - close-button
  - panel-dock
components:
  - Sheet
---

# Sheet

## Overview

A sheet is a panel at an edge of the window, over the page or beside it, after Material's side and bottom sheets. It holds what belongs next to the page rather than in front of it: an item's details, filters, an inspector, or a short set of choices. Sheet is built on Base UI's drawer primitive, which moves focus into it, keeps focus inside a modal sheet, returns focus when it closes, and closes it on <kbd>Esc</kbd>, outside presses and a swipe toward its edge. An application's navigation is no sheet: [Scaffold](scaffold.md) places the navigation forms.

Here a side sheet at the end edge holds the filters of a list, and a DialogClose shows the result and closes it. Its `side` is logical: `end`, the default, is the right edge in left-to-right text and the left in right-to-left text, `start` the other, and `bottom` the bottom edge. It shares Dialog's surface, title, description and actions, and DialogClose closes it as it closes a dialog.

```tsx example=FilterPanel

```

## Anatomy

1. **Backdrop** (modal sheets, `env-sheet-backdrop`): a translucent overlay over the page. A press on it closes the sheet.
2. **Surface** (`env-sheet-popup`): the dialog's raised surface with 1.5 rem padding. A side sheet has square corners, the window's full height and a hairline border at its inner edge only, which it drops across the whole width of a compact window; a bottom sheet has rounded top corners and its content's height. The ref and other `div` props, such as `id`, `className` and `style`, reach the surface.
3. **Title** (optional, `title`): an `h2` in the page heading type, which names the sheet. Without one, name it with `aria-label`.
4. **Close button** (`closeButton`, on by default): a CloseButton at the end of the heading, named by `closeLabel`.
5. **Description** (optional, `description`): muted small text under the title, which describes the sheet.
6. **Content** (`children`): 1.5 rem below the heading. It scrolls inside the surface.
7. **Actions** (optional, `actions`): a row aligned to the end of the content, with the primary action last.

## Variants and sizes

| Side            | Use for                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `end` (default) | Details, settings, filters and inspectors, beside the content they belong to. |
| `start`         | Panels about what sits at the start of the page, such as a tree's options.    |
| `bottom`        | A short set of choices or actions, as tall as its content.                    |

| Width          | Size                      | Use for                                    |
| -------------- | ------------------------- | ------------------------------------------ |
| `md` (default) | 24 rem                    | Details, settings and filters.             |
| `lg`           | 44 rem                    | Tables, comparisons and longer forms.      |
| A CSS length   | As given, such as `20rem` | A side sheet the application sizes itself. |

| `modal`          | Use for                                                         |
| ---------------- | --------------------------------------------------------------- |
| `true` (default) | A panel people finish or close before they go back to the page. |
| `false`          | A panel beside a page that stays usable, such as an inspector.  |

- The width is a side sheet's; a bottom sheet is as wide as the window up to 40 rem, centred.
- A `md` side sheet takes the whole width of a compact window, narrower than 37.5 rem, and a `lg` one of a compact or a medium window, narrower than 52.5 rem, with its content clear of the safe areas on both sides, such as a phone's rounded corners in landscape. The window class is measured on the `env-window` container, never the viewport. A side sheet with a CSS length never grows past the window.
- At its outer edge the content keeps clear of that edge's safe area, also at the top and bottom of the window.

## States and behaviour

- **Opening**: `trigger` opens the sheet and reports it with `aria-haspopup`, `aria-expanded` and `aria-controls`; `defaultOpen` opens it on the first render. To control it, pass `open` and `onOpenChange`, which receives the requested state and, in its second argument, the `reason`: `trigger-press`, `escape-key`, `outside-press`, `close-press`, `focus-out` or `swipe`.
- **Closing**: <kbd>Esc</kbd>, a press outside, the close button, a DialogClose and a swipe toward the sheet's edge on a touch screen close it. `actions` don't close it by themselves: set `open` to false, or use DialogClose.
- **Non-modal**: with `modal={false}` the page stays usable beside the sheet, which has no backdrop and closes when focus or a press goes outside it, unless `disablePointerDismissal`, as an inspector needs.
- **Pending**: while `pending` is true, nothing dismisses the sheet, its close button is disabled and it reports `aria-busy`.
- **Focus on open**: focus moves to `initialFocus`, a ref or a function of how the sheet was opened, or else, opened by keyboard or mouse, to the first element inside that takes Tab, such as the close button. Opened by touch, or with nothing inside that takes focus, the sheet itself takes focus, so a field inside doesn't open the on-screen keyboard.
- **Focus on close**: focus returns to `finalFocus`, a ref or a function of how it closed, or else to the trigger, or to the element that had focus when it opened.
- **Direction**: the sheet reads the text direction at its trigger as it opens, or the nearest EnvUIProvider's `dir`, so its side, its slide and its swipe follow it. A bottom sheet swipes down.
- **Theme**: the sheet renders in a portal in the theme of the place it opens from.
- **Motion**: the sheet slides in from its edge over a backdrop that fades in, and follows a finger that swipes it toward its edge. With a reduced-motion preference it only fades.

## Content guidelines

- Name the sheet after what it holds, in sentence case: "Filters", "Alex Morgan", "Notification settings".
- Name the close button after what it closes where the page has several panels, such as "Close filters".
- Name the primary action after its result, such as "Show 12 projects", rather than "Apply".

## Do and don't

### Do

- Give a sheet a title, or an `aria-label` where a visible heading would repeat what the page shows, as for a panel whose heading the page already shows.
- Use a non-modal sheet with `disablePointerDismissal` for an inspector, and `finalFocus` to return focus to the row it showed.
- Keep the close button unless the sheet holds another control that closes it.

### Don't

- Don't use a sheet for a decision that needs the page's attention; use [Dialog](../components/dialog.md).
- Don't open a sheet from another sheet; show the next level inside it.
- Don't put the only way to do something in a sheet that opens on hover.
- Don't put an application's navigation in a sheet; a Scaffold shows the navigation forms.
- Don't use a sheet for side content that fits beside the main content in a wide window; use [Panes](panes.md), whose supporting pane becomes a sheet only where there is no room.

## Accessibility

### Keyboard

| Key                                                                       | Action                                                                                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger                       | Opens the sheet and moves focus into it.                                                                                                                                   |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                           | Moves focus to the next or previous element in the sheet. A modal sheet keeps focus inside, from its last element to its first; a non-modal one lets it go on to the page. |
| <kbd>Esc</kbd>                                                            | Closes the sheet, or first closes what is open inside it. Does nothing while `pending`.                                                                                    |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the close button or a DialogClose | Closes the sheet; focus returns to the trigger or `finalFocus`.                                                                                                            |

### envUI provides

- `role="dialog"`, named by the title or by `aria-label`, and described by the description.
- `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` on the trigger.
- Focus moved into the sheet on open, kept inside a modal sheet and returned on close.
- In a modal sheet, the rest of the page hidden from assistive technology, closed to presses and locked from scrolling.
- A close button named Close in the provider's language, also for touch screen reader users, who can't press <kbd>Esc</kbd>.
- `aria-busy` and a disabled close button while `pending`.
- Its side, slide and swipe in the text direction, and the originating theme in the portal.

### You provide

- A `title`, or an `aria-label`, that names the sheet.
- A `closeLabel` where several panels close nearby.
- `finalFocus` when the trigger is gone, or when something other than `trigger` opened the sheet.

## Examples

### Inspector beside the page

A non-modal sheet with `disablePointerDismissal` stays open while people choose another row, and shows that row. `finalFocus` returns focus to the row the sheet showed last.

```tsx example=InspectorPanel

```

### Choices from the bottom

A bottom sheet holds a short set of choices, as tall as its content; choosing one closes it.

```tsx example=ShareChoices

```

## Changelog

- **1.0.0**: Sheet, which was Drawer in 1.0.0-prerelease.0, adds `side="bottom"`, and its widths follow the window classes of its container. Drawer, for the panels that were Dialog's `placement="right"`, with `side`, `width`, a swipe to close and the text direction.
