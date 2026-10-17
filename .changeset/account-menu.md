---
'@envsemble/envui': minor
---

AccountMenu and ThemeRadioGroup.

- `AccountMenu.Root` is the signed-in person's menu: their avatar, or a row with the avatar, `name` and `description` (`trigger="row"`, or `auto`, a row in an expanded sidebar and the avatar elsewhere), opens a Menu with a header that shows who is signed in, then its children. It is named "Account" from `messages.accountMenu.label`.
- `AccountMenu.ThemeSubmenu` holds the theme choice, and `AccountMenu.OrganizationSubmenu` switches between the person's organizations with OrganizationSwitcher's rows, the active one named under its row. OrganizationSwitcher stays a component of its own.
- `ThemeRadioGroup` is the theme choice, System, Light and Dark, as radio items for any Menu. Inside a ThemePreferenceProvider it checks and stores the provider's preference; `value` and `onValueChange` connect it to a theme the application stores itself. The menu stays open after a choice unless `closeOnClick`. Its labels come from the new `messages.themeToggle.system`, `light` and `dark`.
