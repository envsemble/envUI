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
  - text: A status or a count beside a label.
    use: Badge
  - text: An icon for a thing or an action, not a person.
    use: Icon
  - text: Every name of a list of people that should be read.
    use: List
related:
  - menu
  - list
  - tooltip
  - app-shell
  - combobox
components:
  - Avatar
  - AvatarButton
  - AvatarGroup
  - avatarHue
---

# Avatar

## Overview

An avatar is a round picture of a person or an organization. Beside a visible name it is decorative; with `named` it is an image named after them.

```tsx example=PersonWithName

```

```tsx example=AccountButton caption="AvatarButton: an avatar as a button, with the name in a tooltip."

```

```tsx example=ProjectMembers caption="AvatarGroup: overlapping avatars, and a count of the rest."

```

### Pressable avatars

With `onPersonClick` each avatar in a group is a button; a person with `href` is a link. The count lists the people it hides.

```tsx example=PressableAvatars

```

## Variants

```tsx example=Sizes

```

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

The name chooses one of eight colors, the same on every page; `hue` sets another, such as an organization's own. The colors only tell people apart.

<!-- specimen: Hues -->

## When to use

```tsx do=NamesBeside caption="The name beside the avatar, wherever there is room."

```

```tsx dont=AvatarsAlone caption="Avatars alone: people must hover each one to learn who it is."

```

```tsx do=RoleAsBadge caption="A role in a Badge, beside the name."

```

```tsx dont=RoleAsColor caption="A role in the avatar's color: nobody can read it."

```

- Use AvatarButton, not an Avatar inside your own button.
- Choose a group's `max` so it fits without wrapping.
- Pass the person's full name as `name`, the same everywhere: it names the image and chooses the initials and the color.

## Anatomy

```tsx anatomy=AvatarAnatomy

```

1. **Group** (`env-avatar-group`)
2. **Avatar** (`env-avatar`)
3. **Initials** (`env-avatar-fallback-initials::text`)
4. **Person picture** (`env-avatar-person`)
5. **Overflow** (`env-avatar-group-overflow`, `max`)

Not shown: a picture, `env-avatar-image`; a pressable avatar, `env-avatar-group-item`; and AvatarButton, `env-avatar-button`.

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

- **1.0.0**: An avatar without a picture takes a solid color that its name chooses, one of eight, with white initials or a white figure; `hue` sets the color, and `avatarHue` returns the one a name chooses. Initials are semibold. Sizes are `sm`, `md`, `lg` and `xl` (were `small`, `standard`, `large` and `display`), set as `data-size` rather than the `env-avatar-{size}` classes. AvatarButton's `detail` is `description`, and it takes the touch height on touch screens. AvatarGroup's strings come from `messages.avatarGroup`, with the counts in the locale's digits, and it rings its avatars through the `--env-avatar-ring` hook. `getInitials` is internal; Avatar shows initials with `fallback="initials"`. Avatar's `label`, which named it as an image, is `named`.
- **0.6.0**: AvatarGroup.
- **0.4.0**: AvatarButton; initials use the avatar blue of the default person picture.
- **0.2.0**: Avatar, with the default person picture or initials as fallback.
