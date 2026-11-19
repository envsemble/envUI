---
'@envsemble/envui': major
---

Pagination's `formatRange` is renamed `renderRange`, since it returns content, as every function prop that draws a part is named `render<Part>`; a function named `format<Part>` returns text.

Breaking changes:

- Pagination's `formatRange` is now `renderRange`, with the same argument and return type: write `renderRange={({ start, end, total }) => …}`.
