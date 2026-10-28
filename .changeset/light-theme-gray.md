---
'@envsemble/envui': minor
---

The light theme takes a nearly neutral gray, after One UI's, and orders its surfaces as the dark theme does: the page is the deepest surface (`--env-color-bg-page`, `#eaeaec`), panes, the navigation, sheets and tables a step lighter (`bg-default` and `bg-raised`, `#f4f4f6`), and cards and list rows white (`bg-muted`, `color.list-item.bg`). The recessed surface is a shade lighter than the page and the panes (`#f8f8fa`), popups take `#f5f5f7`, and accent text and links are a grade deeper (`fg-accent` and `fg-link`, `#0053b5`); text, edges and hairlines keep their grades in the new gray. At high contrast the page is `#f1f1f3`, surfaces and the recessed surface `#f8f8fa`, and cards and list rows white. No token is added or renamed, and the dark theme is unchanged. An application that set its own colors against the light surfaces checks them on the gray page.
