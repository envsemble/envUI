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
- People keep the default person picture. Use initials for organizations and other non-person entities.
- Pair an avatar with the visible name in lists; the avatar is then decorative.

TypeScript declarations provide the complete public API.

## Related topics

- [Menus](../components/menu.md)
- [Grouped rows](../components/rows.md)
