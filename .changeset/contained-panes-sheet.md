---
'@envsemble/envui': patch
---

Panes' supporting pane, as a sheet inside a contained PortalContainer, such as a preview of a screen, belongs to the container as its other overlays do: it is not modal, so it no longer makes the rest of the page inert, takes focus, keeps Tab in itself or locks the page's scroll, which it did there.
