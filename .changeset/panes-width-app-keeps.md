---
'@envsemble/envui': major
---

Panes leaves where a pane's width is kept to the application: it no longer writes or reads a cookie. Panes takes `width`, `defaultWidth` and `onWidthChange`, so an application keeps the width people choose wherever it likes, such as in a cookie its server reads, in localStorage or in the user's account, and passes it back. See [Panes](https://github.com/envsemble/envUI/blob/main/docs/components/panes.md).

Breaking changes:

- Panes.Root's `persist` and `persistedWidth` and the export `readPanesWidth` are removed. Keep the width in the application and pass it back: `<Panes.Root width={width} onWidthChange={(next, { committed }) => { setWidth(next); if (committed) storeWidth(next); }}>` in place of `<Panes.Root persist="inbox" persistedWidth={readPanesWidth(cookieHeader, 'inbox')}>`, where `width` starts from the width the application stored, such as one its server read from its own cookie, and `storeWidth` keeps it there. A double click on the handle still calls `onWidthChange` with `defaultWidth`.
