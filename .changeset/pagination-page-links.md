---
'@envsemble/envui': minor
---

Pagination: `pageHref` gives each page its address, such as `?page=3`, and the previous and next controls are then links through the LinkProvider, which open in a new tab, are crawlable and work before hydration; a control with no page to go to reports aria-disabled and has no destination. `onPageChange` is optional with `pageHref`. See [Pagination](https://github.com/envsemble/envUI/blob/main/docs/components/pagination.md).
