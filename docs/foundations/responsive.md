---
components:
  - useContainerSize
statuses: # Never released before 1.0, so beta until a release has used them.
  useContainerSize: beta
aliases:
  - window class
  - window classes
  - size class
  - breakpoint
  - breakpoints
  - compact
  - medium
  - expanded
  - large
  - media query
  - responsive
  - mobile layout
  - container query
  - container size
  - element size
  - resize observer
  - z-index
  - stacking order
  - layers
---

# Responsive layout & stacking

## React usage

```tsx
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { useContainerSize, windowClasses } from '@envsemble/envui';

function ChartPanel({ chart, legend }: { chart: ReactNode; legend: ReactNode }) {
  // The legend moves under the chart when the panel itself is narrow, wherever it is placed.
  const panel = useRef<HTMLDivElement>(null);
  const size = useContainerSize(panel);
  const narrow = size !== undefined && size.inlineSize < 480;
  return (
    <div ref={panel}>
      {chart}
      {narrow ? <details>{legend}</details> : legend}
    </div>
  );
}

// The width where a window class starts, for code of your own: '37.5rem'.
const medium = windowClasses.medium;
```

```css
/* A region of your own that puts its details beside the report from the expanded window class up,
   measured on the theme boundary around it. */
.report {
  display: grid;
  gap: var(--env-space-6);
}
@container env-window (width >= 52.5rem) {
  .report {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
}
```

### Props & contracts

| Name                                   | Contract                                                                                                                                                                                                                                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `windowClasses`                        | `{ compact: '0rem', medium: '37.5rem', expanded: '52.5rem', large: '75rem' }`: the width where each window class starts                                                                                                                                                                                  |
| `WindowClass`                          | `'compact'`, `'medium'`, `'expanded'` or `'large'`                                                                                                                                                                                                                                                       |
| `env-window`                           | The container that every theme boundary (`.env-theme`) is: a Theme, the themed document root, a dialog's portal. A query on it measures the window classes                                                                                                                                               |
| `--env-window-class-medium` … `-large` | The same widths as tokens, for reference: CSS can't read a custom property inside `@container`, so a style sheet writes the width itself                                                                                                                                                                 |
| `useContainerSize(target, { box })`    | An element's `{ inlineSize, blockSize }` in CSS pixels along its writing mode, from a ResizeObserver: its content box, or its border box with `box: 'border-box'`. Undefined on the server and until the element is measured, before it paints; an element that stops being rendered keeps its last size |
| `--env-z-base` … `--env-z-tooltip`     | The stacking order of envUI's layers and the application's own, lowest first; below                                                                                                                                                                                                                      |

## Window classes

| Window class | Width                  | Where it falls                                                |
| ------------ | ---------------------- | ------------------------------------------------------------- |
| `compact`    | Narrower than 37.5 rem | A phone held upright, or a narrow pane                        |
| `medium`     | 37.5 to 52.5 rem       | A tablet held upright, a phone held sideways, a narrow window |
| `expanded`   | 52.5 to 75 rem         | A tablet held sideways, a laptop window beside another one    |
| `large`      | From 75 rem            | A desktop window                                              |

- The window classes are Material's, in rem: 600, 840 and 1200 px at the default text size. They follow the reader's text size, so at a larger text size a window reaches a class later.
- A window class is measured on a container, never on the viewport. Every theme boundary is the `env-window` container: the document root that a ThemePreferenceProvider or the theme bootstrap themes, a Theme around a region, and the portal of a dialog. A page embedded in a smaller frame, or shown in a narrow preview, gets the class of its own width.
- Write the width from the table in the query, such as `@container env-window (width < 37.5rem)` for compact or `@container env-window (width >= 52.5rem)` from expanded up. The `--env-window-class-*` tokens hold the values but can't be read inside a query.
- A container is as wide as its context makes it, never as its content: a theme boundary that is a flex item, or in an `auto` grid track, needs a width of its own, such as `flex: 1` or a `1fr` track.
- Menus, popovers and other popups have no boundary of their own: their content queries the next `env-window` around their portal, such as the themed document root.

## Containers only

envUI has no width media queries. Components respond to the width of their container, not the window's: a component in a narrow pane of a wide window lays out as it would on a phone. A Card in the feature layout puts its action on a row of its own when the card itself is compact, and a PageHeader moves its actions under its title. Do the same for a region of your own: give it `container: my-region / inline-size` and write `@container my-region (width < 37.5rem)` rules, at a window class where one fits, so it adapts wherever it is placed. Query `env-window` for decisions about the whole window.

Media queries that are not about width stay: pointer and hover, forced colors, reduced motion, contrast and the color scheme.

## Measuring in script

`useContainerSize` is for what CSS can't do: rendering something else when a panel is narrow, or moving content into another slot below a width, which a container query can't do. Pass a ref object, read once the element mounts, or the element itself, such as one a callback ref keeps in state. It measures before the browser paints, so the first paint already has the size; on the server it returns undefined, so render the wide layout there or nothing that depends on the size. To keep one set of widths, compare it with a window class in pixels: `parseFloat(windowClasses.medium)` times the root font size.

Where only styles change, a container query does it without JavaScript and without a first render that differs.

## Stacking order

Every z-index in envUI comes from these tokens, and an application's own layers should too, so they keep one order with envUI's popups and dialogs:

| Token             | Value | For                                                                                                    |
| ----------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| `--env-z-base`    | 0     | The flow of a page or a component                                                                      |
| `--env-z-raised`  | 1     | A part raised over its siblings inside a component: a sticky table header, a resize handle             |
| `--env-z-sticky`  | 20    | The frame's sticky and fixed parts that content scrolls under: the app header and the sidebar columns  |
| `--env-z-peek`    | 30    | A collapsed sidebar that opens over the content without docking                                        |
| `--env-z-overlay` | 90    | The scrim behind a modal layer                                                                         |
| `--env-z-modal`   | 100   | Dialogs, drawers and the command palette                                                               |
| `--env-z-popover` | 110   | Menus, popovers, hover cards and the lists of Select and Combobox, also when they open inside a dialog |
| `--env-z-toast`   | 120   | Notifications, over the dialog they report on                                                          |
| `--env-z-tooltip` | 130   | Tooltips, over everything they can describe                                                            |

- Take a level for what a layer is, not for the number: a sticky toolbar of your own takes `var(--env-z-sticky)`, a floating panel that opens from a button `var(--env-z-popover)`.
- A step between two levels, or a part above or below its siblings, takes `calc()` of a level, such as `calc(var(--env-z-sticky) + 1)` for a header that must stay above its sidebar. Keep such steps small, so they stay between the levels.
- envUI's popups are portaled to the end of the document, outside the application's stacking contexts. A layer of your own that should stay under them, such as a sticky header, must not create a stacking context above them: give it a level below `--env-z-overlay`.
- envUI's Stylelint config reports a literal z-index and names these tokens.

## Guidelines

- Let components and regions adapt to their container; query `env-window` for the page as a whole.
- Prefer CSS to script wherever only styles change, so the server's markup is already right.
- Use the window classes across an application, so its pages and envUI agree about what a compact window is.
- Take every z-index from a stacking token.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Scale & density](../foundations/scale.md)
- [Dialog](../components/dialog.md)
- [Menu](../components/menu.md)
- [Tooltip](../components/tooltip.md)
- [Toast](../components/toast.md)
