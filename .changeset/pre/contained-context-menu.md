---
'@envsemble/envui': patch
---

A ContextMenu inside a contained PortalContainer, such as a preview of a screen, is part of the container as its other overlays are: it opens at the pointer or below the focused element without hiding the rest of the page from assistive technology, locking the page's scroll or moving the page, which a modal context menu did there.
