---
'@envsemble/envui': minor
---

New: `useContainerSize(target, { box })`, an element's inline and block size in CSS pixels along its writing mode, kept up to date by a ResizeObserver: its content box, or its border box. It is measured before the element paints, is undefined on the server, and keeps the last size while the element isn't rendered. Prefer a container query where only styles change.
