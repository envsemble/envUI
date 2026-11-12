---
'@envsemble/envui': patch
---

Pages restyle less as they change and hydrate. AvatarGroup, Checkbox, Radio, Switch, Page, Table and Tabs no longer have the browser work out the style of the whole page again whenever anything on it changes, such as a node added or a section of a navigation drawer opening: their style rules name the parts they style rather than any child or a pseudo-element after a `:has()`. A label cut short in a NavigationDrawer, Breadcrumbs or a full-width SegmentedControl no longer renders its tooltip again as the page hydrates, and ThemePreferenceProvider reads the canvas color only where the page has a `theme-color` tag. Nothing looks different.
