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

Dev mode reads a rendered page's layout and names its problems: as text for agents, and as a 3D view with an inspector for people. It lives in `@envsemble/envui/dev`, so a production build holds none of it.

```tsx figure=TryDevMode

```

## Load it in development

```ts
if (import.meta.env.DEV) {
  void import('@envsemble/envui/dev').then(({ installDevMode }) => installDevMode());
}
```

`installDevMode({ root, parts, button, shortcut, open })` adds a Dev mode button and <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>, which open the page in a new tab with dev mode over it, and returns a handle with `open()`, `close()`, `toggle()`, `openInNewTab()`, `uninstall()`, `layout` and `ready`. Where the bundler moves the package's files, as Vite's dependency optimizer does, pass the parts yourself:

```ts
import parts from '@envsemble/envui/parts.json';

installDevMode({ parts });
```

## The readout, for agents

`window.envui.layout`, or `layout` from `@envsemble/envui/dev`, measures the page when called and leaves it as it was. Fix every problem it returns, from the deepest node up.

```js
envui.layout.describe(); // the page as text: every layout node, then the problems
envui.layout.check(); // the problems only; [] when there are none
envui.layout.at(['22rem', '40rem', '60rem', '80rem']); // both, at each width in turn
envui.layout.skeletonShift('[data-testid="projects"]'); // what moves when a skeleton loads
```

`describe` and `check` take `root`, `width`, `height` and `minTextCharacters`. `at` sets the root's width, not the window's, so viewport units and overlays stay as they were.

| `rule`                  | What it finds                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `content-overflow`      | Content wider than a node that doesn't scroll.                                       |
| `child-overflow`        | A child that spills out of a node that neither scrolls nor clips.                    |
| `overlay-off-window`    | An open overlay that reaches outside the window.                                     |
| `layout-paints`         | A primitive, scaffold or Page without a part class that paints.                      |
| `sticky-without-scroll` | A sticky element whose scroll container never scrolls.                               |
| `text-squeezed`         | Text that wraps in a box narrower than `minTextCharacters`.                          |
| `skeleton-shift`        | Only from `skeletonShift()`: an element that moves or resizes as its skeleton loads. |

## The 3D view

Each layout node is a plane, lifted one level per step of nesting, its padding and gaps hatched and its problems outlined in red. The toolbar lays the page out at a device's size or one you drag; the inspector shows the selected node's part, size, states and tokens.

```tsx figure=DevModeWholePicture

```

```tsx figure=DevModeButtonPicture

```

```tsx figure=DevModeToolbarPicture

```

```tsx figure=DevModeInspectorPicture

```

```tsx figure=DevModeSpacingPicture

```

```tsx figure=DevModeProblemsPicture

```

```tsx figure=DevModeFramePicture

```
