---
'@envsemble/envui': minor
---

NavigationRail: `labels="tooltip"` makes an icon-only rail, such as a code editor's activity bar: each label shows only in a tooltip on hover and keyboard focus, and still names its destination. A destination's `label` also takes content, such as a name with a small Beta mark, with its text in `textValue`; `itemProps` sets more props on its link or button, such as `target`, `rel` or data attributes; `disabled` dims it and takes it out of reach; and a `count` of true shows a dot with no number, named as Activity, new, from the new `messages.navigation.itemNew`. These destination fields work in NavigationBar and NavigationDrawer too. See [NavigationDrawer](https://github.com/envsemble/envUI/blob/main/docs/components/navigation-drawer.md).
