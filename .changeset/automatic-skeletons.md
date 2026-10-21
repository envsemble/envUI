---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

Any surface can become its own skeleton, and the Skeleton component goes.

- `skeleton` on Surface, Card, List.Root and List.Item, Table.Root, Stat.Root and Stat.Group, Alert, Message, EmptyState, TopBar, Drawer, Rail, Bar, Dialog, Sheet, Popover, HoverCard, Menu.Root and Panes.Supporting shows the component, and everything inside it, as a skeleton: text becomes bars as long as the text, icons, avatars, media and controls become filled shapes of their size, a navigation's destinations bars and icon shapes, and backgrounds, borders and corners stay. Its root is marked `data-env-skeleton` and is the one busy region, `aria-busy`, that assistive technology hears; its content, in `env-skeleton-content`, a wrapper without a box of its own, is inert. A list, whose rows must be its children, is inert as a whole, with a visually hidden status, `env-skeleton-status`, beside it that says what is loading. Turning `skeleton` on or off renders the content anew. Every bar and shape pulses in step across the page, and keeps still with a reduced-motion preference.
- `placeholders<Item>(count)` returns stand-in items, `Placeholder<Item>`: an `id`, `envui-placeholder-0` and so on, and every other field of `Item` possibly undefined, so a page writes `items ?? placeholders<Item>(3)` and renders its normal components while the items load. Text given as undefined, such as `title={item.title}`, is a bar of its text style's usual length; `isPlaceholder(item)` tells a stand-in apart by its id, also once serialized, and `useSkeleton()` tells a component of the application's own that it is inside a skeleton.
- Skeleton and `SkeletonProps` are removed, with the `env-skeleton` class and its `data-emphasis`, and so is NavList.Skeleton, with `env-nav-list-skeleton`, `env-nav-list-skeleton-item` and its `data-icon-only`: render the components themselves with `skeleton`. LoadingState stays for loading with no known shape and is now a spinner with its label beside it, `env-loading-state-label`; it takes no children. CodeDiff shows a LoadingState while its highlighter loads.
- Dev mode's `envui.layout.skeletonShift(root)` toggles a skeleton and reports, as `skeleton-shift` problems, the elements that move or resize when it loads, and media without an aspect ratio or a size of its own.
- `v1-names` reports `Skeleton` and `SkeletonProps`, and `v1-classes` `env-skeleton` and `env-skeleton-highlight`, with what to use instead; Skeleton's `tone` no longer moves to `emphasis`. `envui/no-renamed-exports` reports Skeleton too.

Migration guide: [Skeletons](https://github.com/envsemble/envUI/blob/main/docs/migration.md#skeletons).
