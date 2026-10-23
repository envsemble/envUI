---
components:
  - installDevMode
aliases:
  - layout readout
  - envui.layout
---

# Dev mode

Dev mode describes and checks a page's layout while you develop it: as text for agents, and in 3D with an inspector for people. It reads the rendered page, changing nothing but the root's width while `at()` measures, and lives in its own entry point, `@envsemble/envui/dev`, so a production build contains none of it.

Below is dev mode's 3D view of a small application. Try dev mode opens the real dev mode over it at once, with `root` set to the application: its three fixed columns squeeze the cards at a narrow width, and the problems name them.

<!-- demo: DevModeDemo -->

## Opening it

The Dev mode button in the corner of the page, or <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> outside a field, opens dev mode over the page: the node tree on one side, the 3D view in the middle and the inspector on the other side. <kbd>Esc</kbd> closes it and gives focus back. The handle `installDevMode()` returns opens it from code too, with `open()`, `close()` and `toggle()`.

## The readout, for agents

`window.envui.layout` measures the page when it is called and leaves it as it was. An agent runs it from the browser's console or a test; code imports the same object as `layout` from `@envsemble/envui/dev`, which works without `installDevMode()`:

```js
envui.layout.describe(); // the page as text: every layout node, then the problems
envui.layout.check(); // the problems only; [] when there are none
envui.layout.at(['22rem', '40rem', '60rem', '80rem']); // both, at each width in turn
envui.layout.at([{ width: 393, height: 852 }]); // or at a width and height, such as a phone's
```

| Option         | What it does                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `root`         | The element to measure, or a selector; by default the outermost theme boundary, else the body.                        |
| `width`        | Measure at this width, `describe` and `check` only: a px number or a length such as `'40rem'`; `em` is read as `rem`. |
| `height`       | Measure at this height too, as `width` takes it; the root takes the height and scrolls what is taller.                |
| `minTextChars` | The fewest characters a line of text may hold before it counts as squeezed; 8 by default.                             |

### describe()

One line per layout node, indented by nesting: its kind and name, its size and window class, the container and the thresholds its queries test, its display, gap and padding, and what scrolls or sticks. Siblings that read the same fold into one line. The application above at 40 rem:

```text
root div · 40×30rem · medium · window 89.19×50.56rem · 1rem = 16px
scaffold "env-scaffold" · 40×30rem · medium · container env-scaffold (queried at 37.5, 52.5, 75rem) · grid · columns 2 = 5 | 35rem · rows 3 = 3.25 | 26.75 | 0rem · holds div.env-scaffold-rail: scrolls (everything fits) · holds div.env-scaffold-body: scrolls (content 35×34.81rem, at 0,0rem)
  row "env-top-bar" · 35×3.25rem · compact · flex row · align center · gap 0.75rem · padding 0 1rem
    row "env-top-bar-actions" · 2.5×2.5rem · compact · flex row · align center · gap 0.5rem
  column "env-drawer" · hidden: inside div.env-scaffold-drawer, which is display: none (5 nodes inside)
  column "env-rail" · 5×30rem · compact · flex column · align center · gap 1rem · padding 0.75 0rem
    column "env-rail-list" · 5×16.63rem · compact · flex column · gap 0.25rem · scrolls (everything fits)
      column "env-rail-item" · 5×4rem · compact · flex column · align center · gap 0.25rem · padding 0.25 0.25 0.5 0.25rem
      … and 3 more like "env-rail-item" ("env-rail-item", "env-rail-item", "env-rail-item")
  row "env-bar-list" · hidden: inside div.env-scaffold-bar, which is display: none (4 nodes inside)
  page "env-page" · 35×34.81rem · compact · container env-page (queried at 37.5rem) · block · padding 2 1.5 3 1.5rem
    column "env-page-header" · 32×5.06rem · compact · container env-page-header (queried at 37.5rem) · flex column · gap 0.75rem
      row "env-page-header-row" · 32×5.06rem · compact · flex row wrap · align start · gap 1rem
        column "env-page-header-heading" · 32×1.56rem · compact · flex column · gap 0.25rem
          row "env-page-header-title-line" · 32×1.56rem · compact · flex row wrap · align center · gap 0.25 0.75rem
        row "env-page-header-actions" · 32×2.5rem · compact · flex row wrap · align center · gap 0.5rem
    column · 32×22.75rem · compact · flex column · gap 2rem
      grid "projects" · 32×12.69rem · compact · grid · gap 1rem · columns 3 = 10 | 10 | 10rem
        column "env-card" · 10×12.69rem · compact · flex column · gap 1rem · padding 1.5rem
          row "env-card-header" · 7×4.75rem · compact · flex row wrap · align center · gap 0.75rem
        … and 2 more like "env-card" ("env-card", "env-card")
      grid "env-list" · 32×8rem · compact · grid · gap 0.13rem · columns 1 = 32rem · rows 2 = 3.95 | 3.95rem
        row "env-list-item" · 32×3.94rem · compact · flex row wrap · align center · justify space-between · gap 0.75rem · padding 0.75 1.5rem
        … and 1 more like "env-list-item" ("env-list-item")

problems: none
```

A layout node is an element with `data-env-layout`, which every primitive and scaffold renders, and every open dialog, popover, menu or tooltip, listed after the page. It is named by its part class, else by the `name` prop, else by its kind.

### check()

A list of problems, each a plain object. The same application at 22 rem:

```json
{
  "rule": "text-squeezed",
  "node": "column \"env-card\"",
  "path": "scaffold \"env-scaffold\" > page \"env-page\" > column > grid \"projects\" > column \"env-card\"",
  "message": "column \"env-card\": the text of p.env-card-description is squeezed to 3rem, about 6 characters a line, under the 8 a line can take. Give it room, or let it wrap below its neighbours."
}
```

| `rule`                  | What it finds                                                                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content-overflow`      | Content wider than a node that doesn't scroll; only the deepest such node. What a negative margin, an absolute pseudo-element or a transform sets out on purpose, such as a hit area, doesn't count. |
| `child-overflow`        | A child in the flow that spills out of a node that neither scrolls nor clips, beyond what its negative margins set it out by.                                                                        |
| `overlay-off-window`    | An open overlay that reaches outside the window.                                                                                                                                                     |
| `layout-paints`         | A primitive, scaffold or Page without a part class that paints a background, border or shadow.                                                                                                       |
| `sticky-without-scroll` | A sticky element whose scroll container never scrolls, so it never sticks.                                                                                                                           |
| `text-squeezed`         | Text longer than `minTextChars` that wraps in a box narrower than that many characters.                                                                                                              |
| `skeleton-shift`        | Only from `skeletonShift()`: an element that moves or resizes when its skeleton loads.                                                                                                               |

### at()

`at(sizes)` sets the root's inline size to each width in turn, with an inline style, measures, and puts the style back as it was, without resizing the window or waiting for a frame. A size can be `{ width, height }`: the root then takes the height as its block size too, and scrolls what is taller, as a window of that size would. Container queries follow; what script decides on resize doesn't. Each result is `{ width, height, windowClass, text, problems }`, `height` only where one was asked. Fix every problem it returns, from the deepest node up. In a Playwright test:

```ts
const results = await page.evaluate(() =>
  window.envui!.layout!.at(['22rem', '40rem', '60rem', '80rem']),
);
expect(results.flatMap((result) => result.problems)).toEqual([]);
```

## The 3D view

Open dev mode on the application at the top of this page to try it.

Every visible layout node is a plane, lifted one level per step of nesting; sticky, absolute and fixed nodes sit half a level higher, and open overlays float above the page. Each plane carries a picture of what its node holds, with padding and gaps hatched and each child outlined.

The toolbar over the view turns it, chooses what the planes show, sets the page's size and dev mode's theme, and hides the side columns; View settings holds the spacing and levels. A legend in the corner says what the colors mean.

| Do this                                            | To                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Drag, <kbd>Shift</kbd>+drag, <kbd>Ctrl</kbd>+wheel | Turn, pan and zoom; the wheel scrolls the page under the pointer, else zooms. |
| A view in the toolbar, or Fit                      | Look tilted, straight on, from the top or a side; bring it all back.          |
| Names, Padding and gaps                            | Show or hide the planes' names, and the hatching of padding and gaps.         |
| Click a plane, or a node in the tree               | Select the node; the inspector shows it.                                      |
| Only the selected                                  | Show only the selected node and what is inside it.                            |
| Color by window class                              | Color each node by the window class its width falls in, not by its kind.      |
| Rest on a plane                                    | See its size and container; colored by window class, a ruler of its width.    |
| Responsive frame                                   | Show the frame, and drag its handles to lay the page out at another size.     |
| Device, Rotate                                     | Lay the page out at a phone's, tablet's or screen's size; swap its sides.     |
| Dev mode theme                                     | Show dev mode itself light or dark, or as the page is, with high contrast.    |
| View settings: spacing, from and to level          | Show a range of levels, with the spacing between them.                        |
| Nodes, Inspector                                   | Hide or show the side columns; the view takes their room.                     |

### The responsive frame

The page is laid out at its real size, with no frame, until you turn on Responsive frame in the toolbar or pick a device from Device. Then a frame above the planes marks the page's size, labelled in px and rem with its window class and the device it came from. Drag a handle on its left, right or bottom edge, or a bottom corner, to lay the page out at another size, as a browser's responsive mode does: dev mode resizes the page's root, as `at()` does, measures it again and rebuilds the planes, while the window and the view keep their size. Given a height, the root takes it and scrolls what is taller, as a window would; a page shorter than the frame leaves the rest of it empty. A width snaps to the window class boundaries; with focus on an edge's handle, the arrow keys step by 1 rem and <kbd>Shift</kbd>+arrow by 5 rem.

Device lists common phones, tablets, laptops and screens at their CSS viewport sizes; dragging afterwards makes the frame a free one, Responsive. Rotate swaps the width and the height. The inspector and the readout follow the size. The frame's ×, a double-click on a handle, Responsive frame again or the page's own size in Device turns the frame off and brings the page back to its own size, and closing dev mode does too.

### Dev mode's theme

Dev mode's own UI, its toolbar, side columns, popovers and the view's background, takes the page's theme as it opens. Dev mode theme in the toolbar sets it to light or dark instead, with or without high contrast, and remembers the choice in this browser across reloads; Same as the page goes back. The page keeps its own theme, and the planes show it as it is.

A red outline marks a node with problems; coloured by window class, a solid outline is a size container.

## The node tree and the inspector

- **Nodes**, the sidebar beside the view: the nodes as a tree, with problems counted and containers marked. Hovering a node lights up its plane; clicking it selects it.
- **Details**, a tab of the inspector across the view: the selected node's part, component and description, its size, window class and `data-*` states, its container and which queries hold, its problems, the `--env-*` tokens its styles use with their values, and its line of the readout.
- **Readout**, the inspector's other tab: the text of `describe()`, kept current, with a copy button.

Each side column has a button that hides it, and closing both of the inspector's tabs hides it too; the toolbar's Nodes and Inspector buttons show them again.

## Skeleton shift

A skeleton should take the room its content will, so nothing moves when the content arrives. `envui.layout.skeletonShift(root, { tolerance })` shows `root` as a skeleton and loaded in turn, measures both and returns what moves or resizes by more than `tolerance` px (1 by default), as `skeleton-shift` problems. It also reports media without an aspect ratio, which has no size until it loads.

```js
envui.layout.skeletonShift('[data-testid="projects"]');
// [{ rule: 'skeleton-shift', node: 'env-text', path: 'env-surface > env-text',
//    message: 'It changes from 20rem×3.31rem to 20rem×1.31rem when the skeleton loads, …' }]
```

Run it on the loaded page. It can't see what real data changes, such as more items than placeholders.

## Load it in development

Import the entry point behind your bundler's development flag, so production builds leave it out:

```ts
if (import.meta.env.DEV) {
  void import('@envsemble/envui/dev').then(({ installDevMode }) => installDevMode());
}
```

| Option     | Default | What it does                                                                       |
| ---------- | ------- | ---------------------------------------------------------------------------------- |
| `root`     | found   | The element the 3D view and the inspector show, or a selector; the readout's root. |
| `parts`    | fetched | The parts' descriptions, `docs/generated/parts.json`'s content or a URL to it.     |
| `button`   | `true`  | Show the Dev mode button in the corner.                                            |
| `shortcut` | `true`  | Toggle dev mode with <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>.                 |
| `open`     | `false` | Open the 3D view and the inspector at once.                                        |

`installDevMode()` returns a handle with `open()`, `close()`, `toggle()`, `uninstall()`, `layout` and `ready`, which settles once the parts' descriptions have loaded. Calling it again returns the same handle.

Dev mode fetches `parts.json` from beside its own module. Where the bundler moves the package's files, as Vite's dependency optimizer does, hand the data in yourself, or the inspector shows no descriptions:

```ts
import parts from './parts.json'; // a copy of docs/generated/parts.json

installDevMode({ parts });
```

### Limits

- It measures only a rendered page in a browser; on the server, `installDevMode()` does nothing.
- A modal `<dialog>` or an open `popover` in the top layer shows above the 3D view and makes it inert; the readout still works. envUI's dialogs and popups, built on Base UI, aren't in the top layer: the 3D view covers them like the rest of the page.
- The planes' pictures are copies frozen from computed styles: animations, canvases, videos and frames show as empty boxes.
- `at()` resizes the root, not the window, so viewport units and width media queries stay as they are. Open overlays stay where they were placed for the real window, so the window in the first line and `overlay-off-window` are the real window's; check overlays at a real window size, such as with Playwright's `setViewportSize`.
