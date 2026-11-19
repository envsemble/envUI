---
'@envsemble/eslint-plugin-envui': minor
---

`no-link-in-clickable-row` reports a link in a List.Item only when the row itself takes the click, with `href` or `onClick`, and passes a link in a clickable `List.Item`'s `start` or `control`, as it did in `end`: those slots sit above the row's target, so an Avatar in `start` that links to the person's profile works beside a row that opens the item. Links beside an interactive row's `data-row-target` pass too, since they now stay clickable above it. An `interactive` Card with a `data-row-target` inside counts as clickable: a link in its title or description, under the target, is reported, and links in its `meta`, `end` and `actions` pass. See [no-link-in-clickable-row](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-link-in-clickable-row).
