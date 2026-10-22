---
'@envsemble/envui': minor
---

Dev mode, a new entry point for development only: `@envsemble/envui/dev`.

- `installDevMode()` adds `window.envui.layout` to the page, a Dev mode button in the corner and the shortcut Alt+Shift+D. Load it with a dynamic `import()` behind a development check, such as `import.meta.env.DEV`; no other entry point imports it, so production builds contain none of it.
- `envui.layout.describe()` writes the page's layout as text, for agents: every layout node (an element with `data-env-layout`) and open overlay with its size in rem and window class, whether it is a container and the thresholds its queries test, its display, gap, padding and grid columns, what scrolls and what sticks, and what is hidden, with identical siblings folded.
- `envui.layout.check()` returns the problems it measured: content wider than a node that doesn't scroll, a child sticking out, an overlay off the window, layout that paints, a sticky node with nothing scrolling and squeezed text. `envui.layout.at(['22rem', '40rem'])` returns both at each width, measured synchronously by resizing the root and putting it back.
- The button opens a 3D view of the page, a plane per node lifted by nesting, with its surfaces, padding and gaps, colours by kind or window class and a ruler of the thresholds queried, with a toolbar of view directions and a filter to the selected node; the nodes as a tree in a sidebar; and an inspector with the selected node's part, tokens, container and problems, and the readout. See [Dev mode](https://github.com/envsemble/envUI/blob/main/docs/dev-mode.md).
