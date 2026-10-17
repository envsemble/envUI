---
'@envsemble/envui': major
---

Fields and popups have one anatomy each, at the sizes of the app's scale:

- **Fields take the control height.** TextField, SearchField, Combobox and DatePicker are pills as tall as a button of their size, whose label rests inside and floats into the outline without adding height, so they line up with buttons. The 3.5 rem field whose label floats above the value is the opt-in `variant="floating"`, for a long form on a page; plain fields and text areas keep that height. `showLabel` defaults to true, and SearchField's to false, as before; `showLabel={false}` hides a label and leaves the placeholder as the visible guidance.
- **Menus and the popups of Select and Combobox** share the raised popup of 0.7's compact menu: small corners, a hairline edge and rows of the scale's row height, 2.25 rem, or 1.75 rem compact, with 0.875 rem labels, which highlight on hover and keyboard focus. A check mark and a medium-weight label show a select's chosen option, in place of the selection fill. OrganizationSwitcher composes the same popup.
- **Menubar triggers** are as tall as a small control, and menus no longer have their own density.

Migration guide: [Fields and choice controls](../../docs/migration.md#fields-and-choice-controls).
