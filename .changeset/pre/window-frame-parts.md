---
'@envsemble/envui': major
---

TitleBar and WindowFrame are one namespace, `WindowFrame`, with three parts:

- `WindowFrame.Root` fills the window and scrolls `WindowFrame.Content` with the keyboard as it would the document; the title bar is its first child instead of its `titleBar` prop.
- `WindowFrame.TitleBar` is 0.x's TitleBar, with the same `start`, centred `children` and `end`, also on its own. Buttons inside that set no variant are `ghost` and take the small height, as the window controls beside them; a button's own `variant` still wins, so an icon-only `variant="text"` button shows the link color now: drop the variant.
- `WindowFrame.Content` holds the content below the title bar; its `ref` is the scrolling element, which 0.x's `scrollRef` gave.
- The classes follow: `env-title-bar` is `env-window-frame-title-bar`, with its parts `-layout`, `-start`, `-center` and `-end`, and the custom properties `--env-title-bar-start` and `--env-title-bar-end` are `--env-window-frame-title-bar-start` and `-end`. `--env-title-bar-height` keeps its name.

The codemods cover it: `v1-names` renames `TitleBar` to `WindowFrame.TitleBar` and `<WindowFrame>` to `<WindowFrame.Root>`; `v1-structure` makes the `titleBar` prop the first child and wraps the children in `WindowFrame.Content`, which takes `scrollRef` as its `ref`; `v1-classes` renames the classes and custom properties.

Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
