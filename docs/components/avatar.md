---
title: Avatar
summary: A round picture of a person or organization, with the default person picture or initials as fallback, as a button, or overlapping in a group.
status: stable
since: 0.2.0
category: Content & guidance
aliases:
  - profile picture
  - profile photo
  - user image
  - user picture
  - account picture
  - initials
  - persona
  - account button
  - avatar button
  - avatar group
  - avatar stack
  - facepile
  - people stack
useWhen:
  - A person or an organization is pictured beside their name, such as in a list of members or a comment.
  - The signed-in account opens its menu from a picture in the application's chrome (AvatarButton).
  - Who is involved matters more than each name where space is short, such as a project's members in a row (AvatarGroup).
avoidWhen:
  - text: An icon for a thing or an action, not a person.
    use: Icon
  - text: Every name of a list of people that should be read.
    use: List
components:
  - Avatar
  - AvatarButton
  - AvatarGroup
  - avatarHue
---

# Avatar

## Overview

Beside a visible name an avatar is decorative; with `named` it is an image named after them.

```tsx example=PersonWithName

```

```tsx example=AccountButton caption="AvatarButton: an avatar as a button, with the name in a tooltip."

```

```tsx example=ProjectMembers caption="AvatarGroup: bunched avatars with the count of the rest, which spread along an arch under the pointer."

```

Where a pointer can hover, a group rests bunched, each avatar a little off the line and turned, with the count of the rest under the last, and spreads into a row with gaps along a gentle arch under the pointer or while focus is inside; the keyboard reaches the count, which spreads it too. The group always keeps the room its spread takes, so spreading never moves what is around it; at rest the avatars gather at the start of that room, or at its end with `gather="end"`, for a group that ends a row, as in a list row's action. Pressable avatars bunch less, so each keeps a target of at least 1.5 rem uncovered at rest. On touch screens it stays a plain overlapping row with the count shown. With a reduced-motion preference it spreads at once.

### Chosen

`selected` shows an avatar as chosen, such as in a list of people to pick from: a ring around it and a check at its bottom end, in the accent of a checked box, so the choice never rests on color alone. It is a look only: the control around it, such as a checkbox, says it is chosen. A person in an AvatarGroup takes `selected` too.

```tsx example=ChooseReviewers

```

### Pressable avatars

With `onPersonClick` each avatar in a group is a button; a person with `href` is a link. The count lists the people it hides.

```tsx example=PressableAvatars

```

## Variants

```tsx variants=Sizes

```

1. **sm**
2. **md**
3. **lg**
4. **xl**

| Size | Use for                                               |
| ---- | ----------------------------------------------------- |
| `sm` | Compact text, such as a combobox option.              |
| `md` | Lists, comments and toolbars. The default.            |
| `lg` | A name with a second line, such as an account header. |
| `xl` | A profile page. Not for AvatarButton.                 |

### Pictures and fallbacks

Without a picture, or while it loads or after it fails, an avatar shows the default person picture; `fallback="initials"` shows initials, for an organization.

```tsx example=Fallbacks

```

### Colors

The name chooses one of eight colors, the same on every page; `hue` sets another, such as an organization's own. Each is a tonal pair from one pastel palette, powder blue, seafoam, sage, butter, blush, periwinkle, orchid and a warm oat: a soft fill with the initials or the figure in a deep shade of the same hue, slightly deeper in the dark theme. `hue` takes their names, `powder` to `oat`; the powder hue is also the unsuffixed tokens, `--env-color-avatar-bg`, `-fg` and `-figure`. The colors only tell people apart.

<!-- specimen: Hues -->

`--env-avatar-container` and `--env-avatar-content` set the colors of one avatar, its fill and its initials or figure, through `style` or CSS, in place of its hue.

## When to use

```tsx do=NamesBeside caption="The name beside the avatar, wherever there is room."

```

```tsx dont=AvatarsAlone caption="Avatars alone: people must hover each one to learn who it is."

```

- Use AvatarButton, not an Avatar inside your own button.
- Choose a group's `max` so it fits without wrapping, and pass `gather="end"` to a group at the end of a row.
- Pass the person's full name as `name`, the same everywhere: it names the image and chooses the initials and the color.

## Anatomy

```tsx anatomy=AvatarAnatomy

```

1. **Group** (`env-avatar-group`)
2. **Avatar** (`env-avatar`)
3. **Initials** (`env-avatar-fallback-initials::text`)
4. **Person picture** (`env-avatar-person`)
5. **Overflow** (`env-avatar-group-overflow`, `max`)

Not shown: a picture, `env-avatar-image`; the check of a chosen avatar, `env-avatar-check`; a pressable avatar, `env-avatar-group-item`; and AvatarButton, `env-avatar-button`.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to an AvatarButton, each pressable avatar and the count. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses an AvatarButton or a pressable avatar.                 |
| <kbd>Esc</kbd>                                  | Closes a tooltip.                                              |

### envUI provides

- A decorative avatar hidden, or with `named` an image named by `name`.
- A group named with its count and every name, such as 4 people: Alex Morgan, Sam Lee…
- Pressable avatars as native buttons and links, named after each person.
- The count as a tab stop, so the hidden names can be reached.

### You provide

- The name beside a decorative avatar, or `named`.
- An `aria-label` on an AvatarButton that says what it opens.
- `messages.avatarGroup` in the application's language.

## Changelog

- **1.0.0-prerelease.2**: The eight colors are a new pastel palette of tonal pairs: a soft fill with initials and a figure in a deep shade of the same hue, rather than white. The hues are named for their colors, in `hue`, `data-hue` and the tokens: `blue` is `powder`, `teal` `seafoam`, `green` `sage`, `amber` `butter`, `red` `blush`, `violet` `periwinkle`, `purple` `orchid` and `slate` `oat`; `v1-props` rewrites a literal `hue`. `selected` shows an avatar as chosen, with a ring and a check, `env-avatar-check`. AvatarGroup rests bunched where a pointer can hover, with the count of the rest under the last avatar, and spreads along an arch under the pointer or with focus inside, within the room it keeps for the spread; `gather` sets where the avatars gather at rest. Avatars in a group and the count take no ring; `--env-avatar-ring` is gone, and `--env-avatar-group-ring` sets only the gap in a chosen avatar's ring.
- **1.0.0**: An avatar without a picture takes a solid color that its name chooses, one of eight, with white initials or a white figure; `hue` sets the color, and `avatarHue` returns the one a name chooses. Initials are semibold. Sizes are `sm`, `md`, `lg` and `xl` (were `small`, `standard`, `large` and `display`), set as `data-size` rather than the `env-avatar-{size}` classes. AvatarButton's `detail` is `description`, and it takes the touch height on touch screens. AvatarGroup's strings come from `messages.avatarGroup`, with the counts in the locale's digits. `getInitials` is internal; Avatar shows initials with `fallback="initials"`. Avatar's `label`, which named it as an image, is `named`.
- **0.6.0**: AvatarGroup.
- **0.4.0**: AvatarButton; initials use the avatar blue of the default person picture.
- **0.2.0**: Avatar, with the default person picture or initials as fallback.
