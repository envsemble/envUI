---
'@envsemble/envui': minor
---

envUI works with React Server Components. Every module that keeps state, runs effects, reads context or uses Base UI, and every icon that follows a selection's fill, starts with `'use client'`; the entry points carry no directive. A server component imports from `@envsemble/envui` as before: `Menu.Item` and the other client parts arrive as client references, markup-only components such as `Card`, `Badge`, `Text`, `Button` and `Alert` render on the server, and `createThemeBootstrapScript` and `formatRelativeTime` run there. The setup guide says what runs where.

- `NavList.Item` renders its `<li>` only as an item of `NavList.Root` or `NavList.Group`, also through the application's components, and no longer inside the application's own `<li>` or inside another item; the list styles select only the lists' own items.
- The package no longer ships `dist/generated`, the internal token module that no export reached.
