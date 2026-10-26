---
title: Adapting to width
summary: Components follow the space they sit in, and four window classes name where a layout changes.
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
avoidWhen:
  - text: How space groups things, and the compact scale.
    see: spacing
  - text: Two panes that sit side by side once there is room.
    use: Panes
  - text: A readable column whose gutters follow the window class.
    use: Page
  - text: A task over the page, sized to the window.
    use: Dialog
  - text: A list of actions that opens over the page.
    use: Menu
  - text: A short label over the page.
    use: Tooltip
  - text: A notification over the page.
    use: Toast
examples:
  Widths: example
---

# Adapting to width

## Options

### Four window classes

envUI names four widths of window, so you and an agent can say where a layout changes. Each is measured on the window around the app, not on the screen.

| Window class | Use for                                     |
| ------------ | ------------------------------------------- |
| Compact      | A phone held upright, or a narrow pane.     |
| Medium       | A tablet held upright, or a narrow window.  |
| Expanded     | A tablet held sideways, or a laptop window. |
| Large        | A desktop window.                           |

## Behaviour

### Components follow their space

An envUI component lays itself out for the space it sits in, not for the screen.

- In a narrow pane it looks as it would on a phone.
- Where there is room it spreads out, with nothing for an app to adjust.

```tsx figure=Widths

```

1. **In a narrow pane**: The actions move under the name, and each label sits above its value.
2. **With room to spare**: The same components spread out: the actions beside the name, labels beside values.

### Popups fit the window

Menus, dialogs and sheets size themselves to the window they open in, not to the pane they open from, so they always have room.

### Larger text, narrower class

The window classes follow the reader's text size: with larger text, a window counts as a narrower class, so its layout never gets cramped.

## Rules

Start from the phone: a screen is laid out for the compact class first, and spreads out from a class up. A list shows its details beside it from Expanded up, and above it below.

## Words to use

Ask an agent for a layout that adapts in these words; envUI turns each into a window class or a layout that follows its space.

| Words                      | In code                                                                                   | Use for                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| On a phone                 | The `compact` window class, the default layout every query starts from                    | The compact window class: the narrowest layout, which every screen starts from.           |
| In a narrow pane           | The pane's own width; a region of your own becomes a window with `container="env-window"` | The same layout as on a phone, wherever the pane is.                                      |
| Side by side from expanded | `@container env-window (width >= 52.5rem)` around the two-column layout                   | Two parts next to each other in a laptop or desktop window, one above the other below it. |
| Stack on a phone           | The default, one-column layout, before any `width >=` query                               | Puts parts one above the other in the compact window class.                               |
| Wrap                       | `wrap` on Row, so its children run onto the next line                                     | Lets a row of buttons or tags run onto the next line instead of squeezing.                |

## Compose

### Usage

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
/* Details beside the report from the expanded window class up; compact first. */
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

| Name                                | Takes                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `windowClasses`                     | `{ compact: '0rem', medium: '37.5rem', expanded: '52.5rem', large: '75rem' }`: where each window class starts |
| `WindowClass`                       | `'compact'`, `'medium'`, `'expanded'` or `'large'`                                                            |
| `env-window`                        | The container the outermost theme boundary is; a query on it measures the window class                        |
| `useContainerSize(target, { box })` | An element's `{ inlineSize, blockSize }` in CSS pixels, measured before it paints; undefined on the server    |
| `--env-z-base` … `--env-z-tooltip`  | The stacking order of envUI's layers and the application's own, lowest first                                  |

#### Window classes

| Window class | Width                  | Where it falls                             |
| ------------ | ---------------------- | ------------------------------------------ |
| `compact`    | Narrower than 37.5 rem | A phone held upright, or a narrow pane     |
| `medium`     | 37.5 to 52.5 rem       | A tablet held upright, or a narrow window  |
| `expanded`   | 52.5 to 75 rem         | A tablet held sideways, or a laptop window |
| `large`      | From 75 rem            | A desktop window                           |

- The classes are Material's window size classes. They start at 600, 840 and 1200 px at the default text size, and are in rem, so they follow the reader's text size: with larger text, a window counts as a narrower class.
- Measured on a container, never the viewport: a page embedded in a smaller frame gets the class of its own width. Menus, dialogs and sheets measure the window they open in.
- `container="env-window"` on a primitive makes a region a window of its own, such as a preview. Don't give envUI's other `env-*` container names to your own.
- Compact first: write the compact layout as the default and switch up with `width >=`. Where no `env-window` is found, no query matches and the compact layout shows. CSS can't read the `--env-window-class-*` tokens inside a query, so write the width.

#### The words of the figures

- **Components follow their space**: nothing to do; envUI components query their container, never the viewport.
- **Popups fit the window**: nothing to do; menus, dialogs and sheets measure the window they open in.

### Composition

#### Containers only

envUI has no width media queries: components respond to their container, so a component in a narrow pane lays out as on a phone.

- Do the same for a region of your own with `container: my-region / inline-size` and `@container my-region (width >= 37.5rem)`.
- Media queries not about width stay: pointer, forced colors, reduced motion, contrast and color scheme.
- `useContainerSize` is for what CSS can't do, such as rendering something else when a panel is narrow. Where only styles change, a container query does it without script and without a first render that differs.

### Customize

#### Stacking order

| Token             | Value | For                                                                              |
| ----------------- | ----- | -------------------------------------------------------------------------------- |
| `--env-z-base`    | 0     | The flow of a page or a component                                                |
| `--env-z-raised`  | 1     | A part over its siblings inside a component, such as a sticky table header       |
| `--env-z-sticky`  | 20    | The frame's sticky parts that content scrolls under: the top bar, the navigation |
| `--env-z-peek`    | 30    | A pane over the content that doesn't dock, such as a supporting pane as a sheet  |
| `--env-z-overlay` | 90    | The scrim behind a modal layer                                                   |
| `--env-z-modal`   | 100   | Dialogs, sheets and the command palette                                          |
| `--env-z-popover` | 110   | Menus, popovers and the lists of Select and Combobox                             |
| `--env-z-toast`   | 120   | Notifications                                                                    |
| `--env-z-tooltip` | 130   | Tooltips                                                                         |

- Take a level for what a layer is: a sticky toolbar of your own takes `var(--env-z-sticky)`. A step between levels is a small `calc()`, such as `calc(var(--env-z-sticky) + 1)`.
- envUI's popups are portaled to the end of the document; keep your own layers below `--env-z-overlay`. envUI's Stylelint config reports a literal z-index.

TypeScript declarations provide the complete public API.
