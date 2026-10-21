---
components:
  - installDevMode
aliases:
  - layout readout
  - envui.layout
---

# Dev mode

Dev mode shows and checks how a page is laid out, while you develop it. For people it draws the page in 3D, with every layout node lifted by how deeply it is nested, and an inspector beside it. For agents, which can't look at the page, it writes the layout as text and lists the problems it measured, at any width, from the browser's console or a test.

It reads the rendered page, so it only works in a browser, and it is for development only: it lives in its own entry point, `@envsemble/envui/dev`, which nothing else in envUI imports. An application's production build contains none of it unless the application imports it.

## Load it in development

Load the entry point with a dynamic `import()` behind your bundler's development flag, so that production builds leave it out, and install it once the page has started:

```ts
if (import.meta.env.DEV) {
  void import('@envsemble/envui/dev').then(({ installDevMode }) => installDevMode());
}
```

`installDevMode()` adds three things to the page:

- `window.envui.layout`, the readout below;
- a small button in the bottom corner, named Dev mode, that opens the 3D view and the inspector over the page;
- the shortcut Alt+Shift+D, which does the same, except while typing in a field.

It takes these options:

| Option     | Default | What it does                                                                                                                  |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `parts`    | fetched | The part names and descriptions, as `docs/generated/parts.json` holds them, or a URL to fetch them from. See [Parts](#parts). |
| `button`   | `true`  | Show the button in the corner.                                                                                                |
| `shortcut` | `true`  | Toggle dev mode with Alt+Shift+D.                                                                                             |
| `open`     | `false` | Open the 3D view and the inspector at once.                                                                                   |
| `root`     | found   | The element dev mode's view measures, or a selector for it. By default, the same root as the readout's.                       |

It returns a handle with `open()`, `close()`, `toggle()`, `uninstall()` and `layout`. Calling it again returns the same handle.

## What it reads

Dev mode reads the DOM, not the React tree:

- **Layout nodes** are the elements with a `data-env-layout` attribute, which every primitive and scaffold renders on its root with its kind: `box`, `row`, `column`, `grid`, `scaffold`, `panes` or `page`. A node is inside the nearest node around it.
- **Open overlays** are the dialogs, popovers, menus and tooltips that are open and float: a `dialog` that is open, an open `popover`, and envUI's popups. They are nodes at the top, after the page's, with the layout nodes inside them.
- **Names.** A node is named by its part class (an `env-*` class, such as `env-card-actions`), else by its `data-env-name`, which a primitive's `name` prop sets, else by its kind. The readout writes a node as its kind and its name, `row "env-card-actions"`, or its kind alone when it has no other name.
- **The root.** Everything is measured under one element: the outermost theme boundary that is the `env-window` container, else the first theme boundary, else the body. Open overlays count wherever they are in the document. Pass `root` to measure another element.
- Dev mode's own UI is left out of everything it reads.

## The readout, for agents

`window.envui.layout` has three functions. Each measures the page synchronously when it is called; none changes the page.

```js
envui.layout.describe(); // the page as text: every node, then the problems
envui.layout.check(); // the problems only, as a list; [] when there are none
envui.layout.at(['22rem', '40rem', '60rem', '80rem']); // both, at each width in turn
```

Each takes an options object:

| Option         | What it does                                                                               |
| -------------- | ------------------------------------------------------------------------------------------ |
| `root`         | The element to measure, or a selector for it, in place of the default root.                |
| `width`        | Measure at this width (`describe` and `check`): a px number or a length such as `'40rem'`. |
| `minTextChars` | The fewest characters a line of text may hold before it counts as squeezed; 8 by default.  |

### At other widths

`at(widths)` sets the root's inline size to each width in turn, `!important` in its style attribute, measures, and puts the root's own style back before the next width and before it returns. The browser lays the page out again synchronously, and container queries follow, so the page is measured as it would be at that width, without resizing the window and without waiting for a frame. What script decides on resize, such as a ResizeObserver's callback, runs only later and isn't part of the measurement, which is the point: envUI arranges with CSS, and the readout checks what CSS does.

It returns one result per width:

```ts
interface LayoutAtResult {
  width: string; // as given, such as '40rem'
  windowClass: 'compact' | 'medium' | 'expanded' | 'large';
  text: string; // as describe() returns it
  problems: LayoutProblem[]; // as check() returns them
}
```

A check at the four widths the docs use:

```js
envui.layout
  .at(['22rem', '40rem', '60rem', '80rem'])
  .flatMap(({ width, problems }) => problems.map((problem) => `${width}: ${problem.message}`));
```

### The text

The first line describes the root: its size in rem and window class, the window's size and what 1 rem is. Then each node gets a line, indented by its nesting:

```text
root div.env-theme · 63×14.13rem · expanded · window 64×45rem · 1rem = 16px
scaffold "app" · 63×14.13rem · expanded · container env-scaffold (queried at 37.5rem) · block
  grid "frame" · 63×14.13rem · expanded · grid · gap 1rem · padding 1rem · columns 2 = 12 | 48rem
    column "nav" · 12×12.13rem · compact · flex column · gap 0.5rem
    page · 48×12.13rem · medium · flex column · gap 0.5rem
      row "cards" · 48×2.31rem · medium · flex row wrap · gap 0.75rem
        column "first" · 8×2.31rem · compact · block · padding 0.5rem
        … and 2 more like "first" ("second", "third")
      box "filters" · hidden (display: none) (1 node inside)

open overlays (1):
  menu "env-menu-popup" · 15×10rem · compact · flex column · at 3,4rem in the window · side bottom

problems: none
```

A line holds, where they apply:

- the node's size in rem, and the window class of its width: compact below 37.5rem, medium below 52.5rem, expanded below 75rem, large from 75rem;
- whether it is a size container, with its name and the thresholds its container queries test, found by reading the page's `@container` rules for that name;
- its display (flex row or column, wrapping, grid), alignment, gap and padding, and a grid's resolved columns and rows in rem;
- whether it scrolls, with its content's size and how far it is scrolled;
- whether it is sticky, the edge, the offset and what it sticks in, and whether it is stuck now; or absolute or fixed;
- elements inside it that aren't nodes but scroll or stick, such as a component's scroll region or sticky header (`holds header.env-page-header: sticks top at 0rem in …`);
- for an overlay, where it landed in the window and the side of its anchor it took;
- why a hidden node isn't shown, and how many nodes are inside it, which aren't listed.

Siblings whose lines, and everything inside them, read the same apart from their names are folded into one line: `… and 2 more like "first"`.

### The problems

`check()` returns a list of problems, each a plain object:

```ts
interface LayoutProblem {
  rule: ProblemRule; // what it is about, below
  node: string; // the node, as the readout writes it: 'grid "cards"'
  path: string; // from the top down to it: 'scaffold "app" > page > grid "cards"'
  message: string; // what is wrong and what to do, in a sentence or two
}
```

| `rule`                  | What it finds                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `content-overflow`      | Content wider than a node that doesn't scroll. Only the deepest such node is reported; the nodes around it overflow because of it.            |
| `child-overflow`        | A child that sticks out of a node that neither scrolls nor clips, and so spills over its neighbours.                                          |
| `overlay-off-window`    | An open overlay that reaches outside the window.                                                                                              |
| `layout-paints`         | A primitive, scaffold or Page that paints a background, a border or a shadow. Layout never paints: the look belongs to a component inside it. |
| `sticky-without-scroll` | A sticky node, or a sticky element in one, whose nearest clipping ancestor never scrolls, so it never sticks.                                 |
| `text-squeezed`         | Text of its own, longer than `minTextChars`, that wraps in a box narrower than that many characters.                                          |

An agent checking its work runs `envui.layout.at(['22rem', '40rem', '60rem', '80rem'])` and fixes every problem it returns, from the deepest node up. In a Playwright test:

```ts
const results = await page.evaluate(() =>
  window.envui!.layout!.at(['22rem', '40rem', '60rem', '80rem']),
);
expect(results.flatMap((result) => result.problems)).toEqual([]);
```

## The 3D view, for people

The button in the corner, or Alt+Shift+D, opens dev mode over the page: the 3D view, with the inspector beside it. It updates as the page changes, scrolls and resizes, at most once an animation frame.

- **Planes.** Every visible node is a plane, lifted one level per step of nesting, so what is inside what reads as what is above what. Sticky, absolute and fixed nodes sit half a level higher; open overlays float two levels above the whole page. A plane shows only the part of its node that is visible inside what clips it.
- **Surfaces.** Each plane carries what its node holds that isn't a node itself: the node's own paint and copies of its other children, with the nodes inside them left as empty space, since they have planes of their own. The copies keep the computed layout and look of the originals, but are only pictures: they don't respond.
- **Padding and gaps.** A node's padding is hatched one way, the space between and around its children the other, and each child is outlined with dots.
- **Color.** By kind (box, row, column, grid, scaffold and panes, page, overlay), or by the window class of each node's width. Coloured by window class, a solid outline is a size container and a dotted one is not, and hovering a node shows a ruler above it: the window classes, a dashed line at each threshold its container's queries test, its width now and how far it is from the next threshold. A red outline means the node has problems.
- **Moving around.** Drag to turn and Shift+drag, or the middle button, to pan. The wheel scrolls the scroller under the pointer, on the page itself, and the planes follow; Ctrl+wheel zooms. Presets turn the view tilted, straight on, from the top, the left or the right, and Fit brings the whole page back into view.
- **Levels.** From level and To level show a range of levels only, and the spacing sets the distance between them.
- **Only the hovered.** Resting on a plane shows only it and what is inside it; moving off every plane shows everything again. Hovering a row of the inspector's tree does the same at once.
- Clicking a plane selects its node in the inspector, and clicking it again clears the selection.

## The inspector

The inspector has two tabs:

- **Nodes**: the nodes as a tree, with each one's problems counted and the containers marked. Hovering a row highlights its plane; choosing one shows its details:
  - its part class, and the component and description parts.json gives it;
  - its size and window class, and its state attributes (`data-*`);
  - its container, the queries that ask about it and whether each holds now;
  - its problems;
  - the `--env-*` tokens its styles use, with their values on it now, read from the style rules it matches;
  - its line of the readout.
- **Readout**: the text `envui.layout.describe()` returns, kept current, with a button that copies it.

## Parts

The part names and their descriptions come from `docs/generated/parts.json`, which the package ships. Dev mode fetches it from beside its own module, which works where the package's files are served as they are. Where the bundler moves them, as Vite's dependency optimizer does, hand the data in yourself, or a URL to it; without it, dev mode names parts by their classes alone.

```ts
import parts from './parts.json'; // a copy of docs/generated/parts.json

installDevMode({ parts });
```

## Limits

- Dev mode measures the rendered page, so it says nothing about a page that hasn't rendered, and runs in a browser only. On the server, `installDevMode()` does nothing.
- An overlay in the top layer, such as an open `popover` or modal `dialog`, shows above dev mode's view. While a modal dialog makes the rest of the page inert, dev mode's UI is inert too; the readout still works from the console.
- The surfaces are copies frozen from computed styles: animations, canvases, videos and frames show as empty boxes of their size.
- `at()` resizes the root, not the window: what depends on the window's own size, such as a viewport unit or a width media query, stays as it is. envUI uses container queries for width.
