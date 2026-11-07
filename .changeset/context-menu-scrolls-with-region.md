---
'@envsemble/envui': patch
---

A ContextMenu in a contained PortalContainer, such as in a preview of an interface, stays where it opened on its region as the page scrolls, rather than at the same place in the window, where it moved off what it was opened on. A point given by `anchorPoint` while controlled is taken on the region too, from the moment it is given.
