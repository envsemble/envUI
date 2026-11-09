---
'@envsemble/envui': patch
---

A resizable NavigationDrawer finds the labels cut short, which show in full in a tooltip, once the page is laid out, rather than laying the page out again for each label as it mounts: a long drawer no longer holds up the page as it renders or hydrates.
