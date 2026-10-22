---
components:
  - installDevMode
aliases:
  - layout readout
  - envui.layout
---

# Dev mode

Dev mode describes and checks a page's layout while you develop it: as text for agents, and in 3D with an inspector for people. It reads the rendered page, changing nothing but the root's width while `at()` measures, and lives in its own entry point, `@envsemble/envui/dev`, so a production build contains none of it.

This page runs the real dev mode, with `root` set to the application below. Its three fixed columns squeeze the cards at a narrow width; turn them off and the problems go.

<!-- demo: DevModeDemo -->

## Opening it

The Dev mode button in the corner of the page, or Alt+Shift+D outside a field, opens the 3D view with the inspector beside it, over the page. Escape closes it and gives focus back. The handle `installDevMode()` returns opens it from code too, with `open()`, `close()` and `toggle()`.

## The readout, for agents

`window.envui.layout` measures the page when it is called and leaves it as it was. An agent runs it from the browser's console or a test; code imports the same object as `layout` from `@envsemble/envui/dev`, which works without `installDevMode()`:

```js
envui.layout.describe(); // the page as text: every layout node, then the problems
envui.layout.check(); // the problems only; [] when there are none
envui.layout.at(['22rem', '40rem', '60rem', '80rem']); // both, at each width in turn
```

| Option         | What it does                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `root`         | The element to measure, or a selector; by default the outermost theme boundary, else the body.                        |
| `width`        | Measure at this width, `describe` and `check` only: a px number or a length such as `'40rem'`; `em` is read as `rem`. |
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

| `rule`                  | What it finds                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `content-overflow`      | Content wider than a node that doesn't scroll; only the deepest such node.                     |
| `child-overflow`        | A child that spills out of a node that neither scrolls nor clips.                              |
| `overlay-off-window`    | An open overlay that reaches outside the window.                                               |
| `layout-paints`         | A primitive, scaffold or Page without a part class that paints a background, border or shadow. |
| `sticky-without-scroll` | A sticky element whose scroll container never scrolls, so it never sticks.                     |
| `text-squeezed`         | Text longer than `minTextChars` that wraps in a box narrower than that many characters.        |
| `skeleton-shift`        | Only from `skeletonShift()`: an element that moves or resizes when its skeleton loads.         |

### at()

`at(widths)` sets the root's inline size to each width in turn, with an inline style, measures, and puts the style back as it was, without resizing the window or waiting for a frame. Container queries follow; what script decides on resize doesn't. Each result is `{ width, windowClass, text, problems }`. Fix every problem it returns, from the deepest node up. In a Playwright test:

```ts
const results = await page.evaluate(() =>
  window.envui!.layout!.at(['22rem', '40rem', '60rem', '80rem']),
);
expect(results.flatMap((result) => result.problems)).toEqual([]);
```

## The 3D view

Open dev mode on the application at the top of this page to try it.

Every visible layout node is a plane, lifted one level per step of nesting; sticky, absolute and fixed nodes sit half a level higher, and open overlays float above the page. Each plane carries a picture of what its node holds, with padding and gaps hatched and each child outlined.

| Do this                       | To                                                                   |
| ----------------------------- | -------------------------------------------------------------------- |
| Drag, Shift+drag, Ctrl+wheel  | Turn, pan and zoom; the wheel scrolls the page under the pointer.    |
| Choose a preset, or Fit       | Look tilted, straight on, from the top or a side; bring it all back. |
| Color by kind or window class | See what each node is, or which window class its width falls in.     |
| Set From level and To level   | Show a range of levels, with the spacing between them.               |
| Rest on a plane               | Show only it and what is inside it, with a ruler of its thresholds.  |
| Click a plane                 | Select its node in the inspector.                                    |

A red outline marks a node with problems; coloured by window class, a solid outline is a size container.

## The inspector

- **Nodes**: the nodes as a tree, with problems counted and containers marked. A chosen node shows its part, component and description, its size, window class and `data-*` states, its container and which queries hold, its problems, the `--env-*` tokens its styles use with their values, and its line of the readout.
- **Readout**: the text of `describe()`, kept current, with a copy button.

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
| `shortcut` | `true`  | Toggle dev mode with Alt+Shift+D.                                                  |
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
