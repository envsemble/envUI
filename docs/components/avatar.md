# Avatars

## React usage

```tsx
import { Avatar, Stack } from '@envsemble/envui';

<Stack gap={2}>
  <Avatar name="Alex Morgan" src={pictureUrl} />
  <Avatar name="Sam Lee" size="large" label />
</Stack>;
```

### Props & contracts

| Name  | Contract                                                                                  |
| ----- | ----------------------------------------------------------------------------------------- |
| name  | Person or organization name; supplies the initials fallback                               |
| src   | Optional picture URL; initials show while it loads and when it is missing or fails        |
| size  | small 1.5 rem, standard 2 rem (default), large 3 rem or display 5.5 rem                   |
| label | Announce the name as an image; omit when adjacent text already names the person (default) |

`getInitials(name)` returns the same initials for custom layouts.

## Guidelines

- Pictures load without a referrer. A failed picture falls back to initials without an error.
- Pair an avatar with the visible name in lists; the avatar is then decorative.

TypeScript declarations provide the complete public API.

## Related topics

- [Grouped rows](../components/rows.md)
