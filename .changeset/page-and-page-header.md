---
'@envsemble/envui': minor
---

New: `Page` and `PageHeader`, the page column and its heading.

- `Page` is the column a page's content sits in, centered at `width` `sm` (40 rem), `md` (60 rem), `lg` (76 rem, the default) or `full`, with the page gutter at its inline edges (`gutter`, from 1 to 2 rem with the viewport) and its `header` at the top. It adds no landmark, and takes `render` for its element, such as `render={<article />}`. The widths are `--env-page-width-sm`, `-md` and `-lg` on `.env-page`.
- `PageHeader` holds a page's `title`, at `headingLevel` 1 unless set, with `breadcrumbs` above it, `description` under it, `start` before it, `meta` beside it, `actions` at the end of its row and a `toolbar` row below. It responds to its own width: below 32 rem the actions move under the title and wrap. `controlSize` gives its buttons the `md` or `sm` size. `sticky` keeps it at the top of the page, at `--env-frame-sticky-top`, and publishes its height on its Page as `--env-page-header-block-size`, so content can stick below both.
