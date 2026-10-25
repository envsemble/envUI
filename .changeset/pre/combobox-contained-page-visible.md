---
'@envsemble/envui': patch
---

Combobox in a contained PortalContainer leaves the rest of the page in reach of assistive technology while its list is open, as the other contained overlays do. Elsewhere its open list still hides the page around it, as before.
