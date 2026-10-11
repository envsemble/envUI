# Avatars

## React usage

```tsx
import { Avatar, Stack } from '@envsemble/envui';

<Stack gap={2}>
  <Avatar name="Alex Morgan" src={pictureUrl} />
  <Avatar name="Sam Lee" size="large" label />
  <Avatar name="Northwind Labs" fallback="initials" />
</Stack>;
```

### Props & contracts

| Name     | Contract                                                                                  |
| -------- | ----------------------------------------------------------------------------------------- |
| name     | Person or organization name; the accessible name with label and the source of initials    |
| src      | Optional picture URL; the fallback shows while it loads and when it is missing or fails   |
| fallback | person, the default envsemble account picture (default), or initials                      |
| size     | small 1.5 rem, standard 2 rem (default), large 3 rem or display 5.5 rem                   |
| label    | Announce the name as an image; omit when adjacent text already names the person (default) |

`getInitials(name)` returns the same initials for custom layouts.

## Guidelines

- Pictures load without a referrer. A missing or failed picture shows the fallback without an error.
- People keep the default person picture. Use initials for organizations and other non-person entities. Initials use the same avatar blue, in a deeper shade that reads at 5:1.
- Use AvatarButton when the avatar opens something, such as the account menu.
- Pair an avatar with the visible name in lists; the avatar is then decorative.

## AvatarButton

```tsx
import { AvatarButton, Menu, MenuItem } from '@envsemble/envui';

<Menu
  aria-label="Account"
  trigger={
    <AvatarButton
      name="Alex Morgan"
      detail="alex@example.com"
      src={pictureUrl}
      aria-label="Open account menu"
    />
  }
>
  <MenuItem onClick={signOut}>Sign out</MenuItem>
</Menu>;
```

| Name                  | Contract                                                                          |
| --------------------- | --------------------------------------------------------------------------------- |
| name                  | The person's name: the tooltip and the accessible name unless aria-label is set   |
| detail                | Optional second tooltip line, such as the e-mail address of the signed-in account |
| src / fallback / size | As Avatar; size is small, standard (default) or large                             |
| Native button props   | onClick, aria-label, disabled and ref; a Menu supplies them to its trigger        |

- A halo shows on hover, while pressed and while the button's menu is open, so the avatar reads as a control on any surface.

TypeScript declarations provide the complete public API.

## Related topics

- [Menus](../components/menu.md)
- [Grouped rows](../components/rows.md)
