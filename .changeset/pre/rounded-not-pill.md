---
'@envsemble/envui': patch
---

A tall element never keeps pill corners: Button, the single-line fields (TextField, SearchField, Combobox, the pickers and Field.Control), the command palette's search, Drawer's items, a disabled control's tooltip target and a Surface with `radius="full"` take a radius of half their single-line height rather than a full one, so a Combobox whose chips wrap, a button whose label wraps or a toolbar whose controls wrap keep the same corners and become rounded rectangles.
