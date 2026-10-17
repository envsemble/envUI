---
components:
  - useMediaQuery
  - useBreakpoint
  - breakpointQuery
  - useContainerSize
statuses: # Never released before 1.0, so beta until a release has used them.
  useMediaQuery: beta
  useBreakpoint: beta
  breakpointQuery: beta
  useContainerSize: beta
aliases:
  - breakpoint
  - breakpoints
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
import { breakpointQuery, useBreakpoint, useContainerSize, useMediaQuery } from '@envsemble/envui';

function ReportLayout({ report, details }: { report: ReactNode; details: ReactNode }) {
  // From 64 rem up the details sit beside the report; below, they follow it.
  const beside = useBreakpoint('lg');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <div
      className={beside ? 'report-columns' : 'report-stack'}
      data-still={reducedMotion || undefined}
    >
      {report}
      {details}
    </div>
  );
}

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

// The same query for a matchMedia listener of your own.
window.matchMedia(breakpointQuery('md', 'down'));
```

### Props & contracts

| Name                                          | Contract                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `breakpoints`                                 | `{ sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' }`, the values of the breakpoint tokens                                                                                                                                                                                                            |
| `breakpointQuery(breakpoint, direction)`      | The media query from a breakpoint up, `(width >= 48rem)`, the default, or below it, `(width < 48rem)` with `'down'`; one of the two always matches                                                                                                                                                       |
| `useMediaQuery(query, { defaultValue })`      | Whether the viewport matches `query`, kept up to date. On the server and while hydrating it returns `defaultValue` (false), then the browser's answer                                                                                                                                                    |
| `useBreakpoint(breakpoint, { defaultValue })` | Whether the viewport is at least as wide as the breakpoint, as `useMediaQuery(breakpointQuery(breakpoint))`                                                                                                                                                                                              |
| `useContainerSize(target, { box })`           | An element's `{ inlineSize, blockSize }` in CSS pixels along its writing mode, from a ResizeObserver: its content box, or its border box with `box: 'border-box'`. Undefined on the server and until the element is measured, before it paints; an element that stops being rendered keeps its last size |
| `--env-breakpoint-sm` … `-xl`                 | The same widths as tokens, for reference: CSS can't read a custom property inside `@media`, so a style sheet writes the width itself                                                                                                                                                                     |
| `--env-z-base` … `--env-z-tooltip`            | The stacking order of envUI's layers and the application's own, lowest first; below                                                                                                                                                                                                                      |

## Breakpoints

| Breakpoint | Width  | Where it falls                                                                   |
| ---------- | ------ | -------------------------------------------------------------------------------- |
| `sm`       | 40 rem | A large phone held sideways, or a narrow window                                  |
| `md`       | 48 rem | A tablet held upright: the default line between a phone's layout and a wider one |
| `lg`       | 64 rem | A tablet held sideways, or a laptop                                              |
| `xl`       | 80 rem | A desktop window                                                                 |

- Breakpoints are viewport widths, in rem, so they follow the reader's text size: at a larger text size a window reaches a layout's breakpoint later.
- In a style sheet, write the width in the query from the table, such as `@media (width >= 48rem)`, the same query `breakpointQuery('md')` returns. A custom property such as `--env-breakpoint-md` holds the value but can't be read inside `@media`.
- Use them for the page and the app frame: whether sidebars dock or become drawers, how many columns a page has, whether a detail pane sits beside its list.

## Container queries first

envUI's components respond to the width of their container, not the window's: a component in a narrow pane of a wide window lays out as it would on a phone. A Card in the feature layout, for one, puts its action on a row of its own in a narrow container. Do the same for a region of your own: give it `container-type: inline-size` and write `@container (width < 30rem)` rules, so it adapts wherever it is placed. Keep viewport breakpoints for decisions about the whole window.

## The hooks

`useMediaQuery` and `useBreakpoint` are for what CSS can't do: rendering different components, or none, at a width, such as a list beside its detail on a wide window and a list that opens its detail on a narrow one. Where only styles change, a media or container query does it without JavaScript and without a first render that differs.

`useContainerSize` is the same for an element's own size: rendering something else when a panel is narrow, or moving content into another slot below a width, which a container query can't do. Pass a ref object, read once the element mounts, or the element itself, such as one a callback ref keeps in state. It measures before the browser paints, so the first paint already has the size; on the server it returns undefined, so render the wide layout there or nothing that depends on the size.

A server can't know the window's width, so on the server and in the first render that hydrates its markup the hooks return `defaultValue`, false unless you set it; the browser's answer follows in the next render. Set `defaultValue` to the layout most visitors get, such as `true` for a desktop app, so the first paint matches it. A page rendered only in the browser gets the answer in its first render.

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

- Let components adapt to their container; use a viewport breakpoint only for the frame and the page.
- Prefer CSS to the hooks wherever only styles change, so the server's markup is already right; reach for `useContainerSize` before a window breakpoint when what changes is a region's own content.
- Use the same breakpoints across an application, so its frame, its pages and envUI agree about what a narrow window is.
- Take every z-index from a stacking token.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Scale & density](../foundations/scale.md)
- [Dialog](../components/dialog.md)
- [Menu](../components/menu.md)
- [Tooltip](../components/tooltip.md)
- [Toast](../components/toast.md)
