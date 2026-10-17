---
'@envsemble/envui-codemods': minor
---

The rename map covers the shell, dock, editors and code:

- WindowFrame: `TitleBar` is `WindowFrame.TitleBar` and `WindowFrame` is `WindowFrame.Root`; `v1-structure` makes a `titleBar` prop the first child and wraps the children in `WindowFrame.Content`, which takes `scrollRef` as its `ref`. `env-title-bar*` is `env-window-frame-title-bar*`.

`v1-structure` lifts a prop's value into an element's children (`lift`), wraps the children in a part that takes some of the element's props (`wrapChildren`), matches a prop set to any value (`"*"` in `when`) and writes a namespace's part as an element, such as `WindowFrame.Content`.
