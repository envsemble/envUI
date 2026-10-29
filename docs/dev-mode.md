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

Dev mode takes a page apart, layer by layer, to show how it is built and what is wrong with it: as text for agents, and in 3D with an inspector for people. It reads the rendered page, changing nothing but the root's width while `at()` measures, and lives in its own entry point, `@envsemble/envui/dev`, so a production build contains none of it.

Below is dev mode's 3D view of a small application. Try dev mode opens the real dev mode over it, with `root` set to the application: its three fixed columns squeeze the cards at a narrow width, and the problems name them.

<!-- demo: DevModeDemo -->

## What it helps you notice

Mistakes that hide in a finished screen stand out once its boxes are pulled apart, and dev mode names the ones it can find:

- **Uneven spacing.** Padding and gaps are hatched, so a gap wider or narrower than its neighbours shows at a glance.
- **Squeezed or spilling content.** A box whose text is squeezed into a narrow column, or whose content spills out, is outlined in red.
- **A layout that breaks at a width.** Lay the page out at a phone's or a tablet's size, or drag the frame's edges, and watch it change.

<!-- demo: DevModeSpacingPicture -->

<!-- demo: DevModeProblemsPicture -->

<!-- demo: DevModeFramePicture -->

A coding agent reads the same page as text, with the same problems, at any width: ask it to check a page with dev mode at a phone's width and a wide screen's.

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

Dev mode fetches `parts.json` from beside its own module. Where the bundler moves the package's files, as Vite's dependency optimizer does, hand the data in yourself, or the inspector shows no descriptions:

```ts
import parts from './parts.json'; // a copy of docs/generated/parts.json

installDevMode({ parts });
```

### Opening it

The Dev mode button in the corner of the page, or <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> outside a field, opens the page in a new tab with dev mode over the whole window: the node tree on one side, the 3D view in the middle and the inspector on the other. The tab's address is the page's with the `envui-dev` query parameter, where dev mode is open from the start and shows no button; close the tab to end it, or reload it to measure the page afresh. The page you came from stays as it was.

<!-- demo: DevModeButtonPicture -->

<!-- demo: DevModeWholePicture -->

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

One line per layout node, indented by nesting: its kind and name, its size and window class, the container and the thresholds its queries test, its display, gap and padding, and what scrolls or sticks. Siblings that read the same fold into one line. A layout node is an element with `data-env-layout`, which every primitive and scaffold renders, and every open overlay, listed after the page; it is named by its part class, else by the `name` prop, else by its kind. Part of the application above at 40 rem:

```text
root div · 40×30rem · medium · window 89.19×50.56rem · 1rem = 16px
scaffold "env-scaffold" · 40×30rem · medium · container env-scaffold (queried at 37.5, 52.5, 75rem) · grid · columns 2 = 5 | 35rem · rows 3 = 3.25 | 26.75 | 0rem
  row "env-top-bar" · 35×3.25rem · compact · flex row · align center · gap 0.75rem · padding 0 1rem
  column "env-drawer" · hidden: inside div.env-scaffold-drawer, which is display: none (5 nodes inside)
  column "env-rail" · 5×30rem · compact · flex column · align center · gap 1rem · padding 0.75 0rem
    column "env-rail-list" · 5×16.63rem · compact · flex column · gap 0.25rem · scrolls (everything fits)
      column "env-rail-item" · 5×4rem · compact · flex column · align center · gap 0.25rem · padding 0.25 0.25 0.5 0.25rem
      … and 3 more like "env-rail-item" ("env-rail-item", "env-rail-item", "env-rail-item")
  page "env-page" · 35×34.81rem · compact · container env-page (queried at 37.5rem) · block · padding 2 1.5 3 1.5rem
    column · 32×22.75rem · compact · flex column · gap 2rem
      grid "projects" · 32×12.69rem · compact · grid · gap 1rem · columns 3 = 10 | 10 | 10rem
        column "env-card" · 10×12.69rem · compact · flex column · gap 1rem · padding 1.5rem
        … and 2 more like "env-card" ("env-card", "env-card")

problems: none
```

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

`at(sizes)` sets the root's inline size to each width in turn, with an inline style, measures, and puts the style back, without resizing the window or waiting for a frame. A size can be `{ width, height }`: the root then takes the height too, and scrolls what is taller. Container queries follow; what script decides on resize doesn't. Each result is `{ width, height, windowClass, text, problems }`, `height` only where one was asked. Fix every problem it returns, from the deepest node up. In a Playwright test:

```ts
const results = await page.evaluate(() =>
  window.envui!.layout!.at(['22rem', '40rem', '60rem', '80rem']),
);
expect(results.flatMap((result) => result.problems)).toEqual([]);
```

### skeletonShift()

A skeleton should take the room its content will, so nothing moves when the content arrives. `envui.layout.skeletonShift(root, { tolerance })` shows `root` as a skeleton and loaded in turn, and returns what moves or resizes by more than `tolerance` px (1 by default), as `skeleton-shift` problems, and media without an aspect ratio. Run it on the loaded page; it can't see what real data changes, such as more items than placeholders.

```js
envui.layout.skeletonShift('[data-testid="projects"]');
// [{ rule: 'skeleton-shift', node: 'env-text', path: 'env-surface > env-text',
//    message: 'It changes from 20rem×3.31rem to 20rem×1.31rem when the skeleton loads, …' }]
```

## The 3D view

Every visible layout node is a plane, lifted one level per step of nesting, with open overlays above the page; each plane carries a picture of what its node holds, its padding and gaps hatched and a red outline where it has problems. The toolbar turns the view, chooses what the planes show, lays the page out in a responsive frame at a device's size or one you drag, and sets the levels shown; its help button says how to move around, and a legend what the colors mean. Beside the view, the node tree lists the nodes with their problems counted, and the inspector shows the selected node's part, size, window class, states, container, tokens and its line of the readout. Dev mode takes the page's theme, or the one its Dev mode theme setting chooses.

<!-- demo: DevModeToolbarPicture -->

<!-- demo: DevModeInspectorPicture -->

| Do this                                            | To                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Drag, <kbd>Shift</kbd>+drag, <kbd>Ctrl</kbd>+wheel | Turn, pan and zoom; the wheel scrolls the page under the pointer, else zooms. |
| Click a plane, or a node in the tree               | Select the node; the inspector shows it.                                      |
| Rest on a plane                                    | See its size and container.                                                   |
| Drag the responsive frame's edges                  | Lay the page out at another size; arrow keys on a handle step by 1 rem.       |

## Limits

- It measures only a rendered page in a browser; on the server, `installDevMode()` does nothing.
- A modal `<dialog>` or an open `popover` in the top layer shows above the 3D view and makes it inert; the readout still works. envUI's dialogs and popups aren't in the top layer.
- The planes' pictures are copies frozen from computed styles: animations, canvases, videos and frames show as empty boxes.
- `at()` resizes the root, not the window, so viewport units and width media queries stay as they are, and open overlays stay where they were placed for the real window; check overlays at a real window size, such as with Playwright's `setViewportSize`.
