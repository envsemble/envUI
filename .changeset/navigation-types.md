---
'@envsemble/envui': major
---

Pagination requires `onPageChange`, `pageHref` or both, so a pager that leads nowhere doesn't compile. See [Pagination](https://github.com/envsemble/envUI/blob/main/docs/components/pagination.md).

Breaking changes:

- `PaginationProps` is a type instead of an interface, a union of `onPageChange` and `pageHref`. An interface that extends it writes a type alias with an intersection instead.
- `TreeRowElementProps` is renamed `TreeItemElementProps`, the type of a Tree row's `itemProps`.
- `NavigationLabels` is removed: NavigationRail and NavigationBar take `visibleLabel={false}` in place of `labels="tooltip"`.
