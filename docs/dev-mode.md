---
status: alpha
components:
  - installDevMode
aliases:
  - layout readout
  - envui.layout
  - layout inspector
  - 3D view
  - check a layout
---

# Dev mode

Dev mode takes a page apart, layer by layer, to show how it is built and what is wrong with it. It describes and checks a page's layout while you develop it: as text for agents, and in 3D with an inspector for people. It reads the rendered page, changing nothing but the root's width while `at()` measures, and lives in its own entry point, `@envsemble/envui/dev`, so a production build contains none of it.

Below is dev mode's 3D view of a small application. Try dev mode opens the real dev mode over it at once, with `root` set to the application: its three fixed columns squeeze the cards at a narrow width, and the problems name them.

<!-- demo: DevModeDemo -->

## What it helps you notice

Mistakes that hide in a finished screen stand out once its boxes are pulled apart, and dev mode names the ones it can find:

- **Uneven spacing.** The padding inside each box and the gaps between boxes are hatched, so a gap wider or narrower than its neighbours shows at a glance.
- **Squeezed or spilling content.** A box whose text is squeezed into a narrow column, or whose content spills out of it, is outlined in red, and the node tree counts the problems of each box.
- **A layout that breaks at a width.** Lay the page out at a phone's or a tablet's size, or drag the frame's edges, and watch it change.

<!-- demo: DevModeSpacingPicture -->

<!-- demo: DevModeProblemsPicture -->

<!-- demo: DevModeFramePicture -->

A coding agent reads the same page as text, with the same problems, at any width, and fixes what it finds: ask it to check a page with dev mode at a phone's width and a wide screen's.

## Opening it

The Dev mode button in the corner of the page, or <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> outside a field, opens the page in a new tab with dev mode over the whole window: the node tree on one side, the 3D view in the middle and the inspector on the other side. The tab's address is the page's with the `envui-dev` query parameter, which `installDevMode()` reads there, and its title starts with Dev mode. The page you came from stays as it was. Dev mode's tab has no close button, and <kbd>Esc</kbd> doesn't leave it: close the tab to end dev mode, or reload it to measure the page afresh.

<!-- demo: DevModeButtonPicture -->

<!-- demo: DevModeWholePicture -->

From code, the handle `installDevMode()` returns opens dev mode the same way with `openInNewTab()`, or over the page itself with `open()`, as the example above and a test do; opened over the page, <kbd>Esc</kbd> or `close()` closes it and gives focus back.

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

The toolbar over the view has four dropdowns, each an icon whose name shows at once on hover: View turns the view, Show chooses what the planes show, Responsive sets the page's size and View settings holds the spacing and levels. View opens the angles laid out as they look at the page, Top above Front, Left and Right beside it and Tilted, which looks from above and to the right, in the top right corner, the one the view is at marked. Each turns the view there with the whole page in view, so picking the angle the view is at brings the page back after zooming or panning. Each control has one place. How to move around is the button in the view's top right corner, and a legend in its bottom corner says what the colors mean.

<!-- demo: DevModeToolbarPicture -->

| Do this                                            | To                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Drag, <kbd>Shift</kbd>+drag, <kbd>Ctrl</kbd>+wheel | Turn, pan and zoom; the wheel scrolls the page under the pointer, else zooms. |
| View: an angle                                     | Look tilted, from the front, the top or a side, with the whole page in view.  |
| Show: Names, Padding and gaps                      | Show or hide the planes' names, and the hatching of padding and gaps.         |
| Click a plane, or a node in the tree               | Select the node; the inspector shows it.                                      |
| Show: Only the selected                            | Show only the selected node and what is inside it.                            |
| Show: Color by window class                        | Color each node by the window class its width falls in, not by its kind.      |
| Rest on a plane                                    | See its size and container; colored by window class, a ruler of its width.    |
| Responsive: Responsive frame                       | Show the frame, and drag its handles to lay the page out at another size.     |
| Responsive: Device, Orientation                    | Lay the page out at a phone's, tablet's or screen's size, upright or turned.  |
| View settings: spacing, from and to level          | Show a range of levels, with the spacing between them.                        |
| View settings: Performance                         | Show the frame rate, and how often and how long dev mode measures the page.   |
| A sidebar's button in its top corner               | Hide or show the sidebar; the view takes its room.                            |

### The responsive frame

The page is laid out at its real size, with no frame, until you turn on Responsive frame in the toolbar's Responsive dropdown. Then a frame above the planes marks the page's size, labelled in px and rem with its window class and the device it came from. Drag a handle on its left, right or bottom edge, or a bottom corner, to lay the page out at another size, as a browser's responsive mode does: dev mode resizes the page's root, as `at()` does, measures it again and rebuilds the planes, while the window and the view keep their size. Given a height, the root takes it and scrolls what is taller, as a window would; a page shorter than the frame leaves the rest of it empty. A width snaps to the window class boundaries; with focus on an edge's handle, the arrow keys step by 1 rem and <kbd>Shift</kbd>+arrow by 5 rem.

While the frame is on, Device, in the same dropdown, lists common phones, tablets, laptops and screens at their CSS viewport sizes; dragging afterwards makes the frame one of any size, Any size. Orientation turns the frame upright or on its side, swapping the width and the height. The inspector and the readout follow the size. Responsive frame again turns the frame off and brings the page back to its own size, and closing dev mode does too.

### Keeping up with the page

The planes follow the page as it changes, at most once an animation frame: a resize, a scroll, a transition that ends, content that changes. The pictures on the planes are copied once the page settles, a few each frame, so dragging the frame or a sidebar stays smooth; while the page is being resized, a plane whose picture is of another size shows its outline, name and spacing alone. The frame lays the root out at any size, wider or taller than the window and whatever holds the root: the planes are whole, cut off only by what clips inside the root. Performance, in View settings, shows the frame rate and the measurements' cost.

### Dev mode's theme

Dev mode's own UI, its toolbar, sidebars, popovers and the view's background, takes the page's theme as it opens: the theme of the boundary around its `root`, so a page in a nested `Theme` of another theme than the document's has dev mode in its theme too. Dev mode theme, at the foot of the node tree, sets it to light or dark instead, with or without high contrast, and remembers the choice in this browser across reloads; Same as the page goes back. The page keeps its own theme, and the planes show it as it is.

A red outline marks a node with problems; coloured by window class, a solid outline is a size container.

## The node tree and the inspector

- **Nodes**, the sidebar beside the view: the nodes as a tree, with problems counted and containers marked. Hovering a node lights up its plane; clicking it selects it.
- **Details**, a tab of the inspector across the view: the selected node's part, component and description, its size, window class and `data-*` states, its container and which queries hold, its problems, the `--env-*` tokens its styles use with their values, and its line of the readout.
- **Readout**, the inspector's other tab: the text of `describe()`, kept current, with a copy button. Each line wraps to the sidebar's width, indented under its own start; the copy is the text as it is.

<!-- demo: DevModeInspectorPicture -->

Each sidebar has a button in its header, in the window's top corner on its side, that hides it; while it is hidden the button stays in that corner, over the view, to show it again. Drag a sidebar's inner edge, by the same grip as a resizable [Drawer](components/drawer.md)'s, to make it wider or narrower, up to all the window leaves beside the other sidebar and a narrow view: the arrow keys on the grip step by 1 rem, <kbd>Shift</kbd>+arrow by 5 rem, and a double-click gives it its first width back. Dev mode remembers the widths and which sidebars are hidden in this browser.

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
| `button`   | `true`  | Show the Dev mode button in the corner, which opens dev mode in a new tab.         |
| `shortcut` | `true`  | Open dev mode in a new tab with <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>.      |
| `open`     | `false` | Open the 3D view and the inspector over this page at once, as `open()` does.       |

`installDevMode()` returns a handle, and calling it again returns the same one:

| Member           | What it does                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `openInNewTab()` | Opens the page in a new tab with dev mode over the whole window, as the button does; where the browser blocks it, `open()`. |
| `open()`         | Opens dev mode over this page, such as in a test or an example; <kbd>Esc</kbd> closes it.                                   |
| `close()`        | Closes dev mode opened over this page.                                                                                      |
| `toggle()`       | Opens or closes dev mode over this page.                                                                                    |
| `uninstall()`    | Removes the button, the shortcut, the style sheet and `envui.layout`.                                                       |
| `layout`         | The readout, as on the window.                                                                                              |
| `ready`          | Settles once the parts' descriptions have loaded, or failed to.                                                             |

In dev mode's own tab, the one with `envui-dev` in its address, dev mode is open from the start whatever `open` says, and shows no button.

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
