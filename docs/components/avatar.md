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

## AvatarGroup

```tsx
import { AvatarGroup } from '@envsemble/envui';

<AvatarGroup
  people={[
    { id: 'alex', name: 'Alex Morgan', src: pictureUrl },
    { id: 'sam', name: 'Sam Lee' },
    { id: 'priya', name: 'Priya Shah' },
    { id: 'jordan', name: 'Jordan Rivera' },
  ]}
  max={3}
/>

<AvatarGroup
  people={firstMembers}
  total={memberCount}
  max={3}
  size="small"
  onPersonClick={(person) => openProfile(person.id)}
/>
```

| Name                | Contract                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| people              | `{ name, src?, fallback?, id?, href? }` in display order; id is a stable key, the name and position by default                 |
| max                 | The most avatars to show; the overflow chip after them counts the rest. All by default                                         |
| total               | How many people there are in all, when people is only a preview of them                                                        |
| size                | small 1.5 rem, standard 2 rem (default), large 3 rem or display 5.5 rem, as Avatar                                             |
| onPersonClick       | Makes every avatar a button; receives the person and the click event                                                           |
| href                | Makes that person's avatar a link, rendered through LinkProvider                                                               |
| aria-label          | The group's name; by default the count and every name, such as 4 people: Alex Morgan, Sam Lee, Priya Shah, Jordan Rivera       |
| formatMore          | Text for people counted in total but missing from people, in the overflow tooltip and the default name; N more by default      |
| --avatar-group-ring | CSS custom property for the ring color; the envUI surface below by default, such as a Surface, Card or Dialog, else the canvas |
| Native div props    | ref, className, style and accessible attributes; role defaults to group                                                        |

- Use a group where space is short and who is involved matters more than each name, such as the members of a project in a table row. List people with their names where the names should be read.
- Avatars overlap by a quarter of their size, each lying over the one before, and a ring in the color of the surface below keeps them apart. On an envUI Surface, Card or Dialog the ring takes that surface's color, elsewhere the canvas color. Set `--avatar-group-ring` where the group sits on another fill, such as `--avatar-group-ring: var(--color-row)` in a grouped row.
- The overflow chip counts the people not shown, such as +2. Its tooltip lists the names it hides, then N more for people counted in total without a name. The chip is a tab stop, so the keyboard opens the tooltip as the pointer does, and <kbd>Esc</kbd> closes it.
- Without onPersonClick or href the avatars are decorative and the group's name counts and names everyone. With them, each avatar is a button or link named after the person, with the name in a tooltip on hover and keyboard focus. The avatar under the pointer or focus comes to the front, with a state layer over the picture and the shared focus ring.
- A group is as tall as its avatars: a standard group lines up with 2 rem compact controls in a toolbar or table row, and a small group fits beside them. It never wraps or shrinks; choose max to fit the space.
- On touch screens, pressable avatars keep at least 1.5 rem uncovered, so small ones sit side by side. In right-to-left text the avatars run from the right, and the chip still reads +2.

TypeScript declarations provide the complete public API.

## Related topics

- [Menus](../components/menu.md)
- [Grouped rows](../components/rows.md)
