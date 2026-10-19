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

An avatar is a round picture of a person or an organization. Without a picture it shows the default person picture, or initials for an organization, on a solid color that its name chooses. Beside a visible name it is decorative; with `named` it is an image named after the person.

The family builds on it:

- **AvatarButton** is an avatar as a button, such as the account menu's trigger, with a halo on hover, press and while its menu is open, and the name in a tooltip.
- **AvatarGroup** overlaps the avatars of a set of people, with a chip that counts the people it doesn't show and lists them in its tooltip.

```tsx example=PersonWithName

```

## Anatomy

1. **Picture** (`src`): the image, cut to a circle and covering it, loaded without a referrer.
2. **Fallback** (`fallback`): the default person picture, a white figure, or the initials of `name` in white, on the solid color of the avatar's hue.
3. **Halo** (AvatarButton): a round state layer 0.25 rem around the avatar.
4. **Ring** (AvatarGroup): a ring in the color of the surface below each avatar, which keeps overlapping avatars apart.
5. **Overflow chip** (AvatarGroup with `max` or `total`): the count of people not shown, such as +2, in a pill.

## Variants and sizes

### Sizes

| Size | Use for                                                                          |
| ---- | -------------------------------------------------------------------------------- |
| `sm` | 1.5 rem, beside compact text, such as in a combobox option or a dense table row. |
| `md` | 2 rem, in lists, comments and toolbars. The default.                             |
| `lg` | 3 rem, beside a name and a second line, such as an account menu's header.        |
| `xl` | 5.5 rem, on a profile page or a sign-in screen. Not for AvatarButton.            |

### Fallbacks

| Fallback   | Use for                                                      |
| ---------- | ------------------------------------------------------------ |
| `person`   | People. The default.                                         |
| `initials` | Organizations, teams and other things that are not a person. |

### Colors

An avatar without a picture takes one of eight solid colors: blue, teal, green, amber, red, violet, purple or slate. Its `name` chooses the color, so a person or an organization has the same color on every page and in every session, and a list of people spreads across the colors. `hue` sets the color instead, such as an organization's own. The colors only tell people apart; they mean nothing else.

<!-- specimen: Hues -->

### Groups

<!-- specimen: Groups -->

### Measurements

- Initials are the first letters of the first and last words of `name`, or the first two letters of a single word, in capitals, semibold at 0.38 of the avatar's size. They are white, at least 4.5:1 on every color, and 7:1 at high contrast, where the colors are a grade darker.
- An AvatarButton is its avatar plus 0.25 rem of halo on every side, and at least 2.75 rem on touch screens.
- In an AvatarGroup, each avatar lies over the one before it by an eighth of its size, and initials center in the part it leaves uncovered, so they stay clear; and the ring is an eighth of a rem, or a sixteenth of the size for larger avatars. An `md` group is as tall as a small control, 2 rem. A group never wraps or shrinks; choose `max` to fit the room.
- On touch screens, each pressable avatar in a group is a target of at least 2.75 rem with its picture in the middle, and keeps that much uncovered, so smaller ones sit apart and larger ones overlap less.

## States and behaviour

- **Loading and failing**: the fallback shows while the picture loads and stays when it is missing or fails, without an error.
- **AvatarButton**: a halo shows on hover, while pressed and while its menu is open (`aria-expanded`), and keyboard focus shows a focus outline. The tooltip, below the button, shows `name` and, on a second line, `description`. A menu supplies its `onClick` and the menu button semantics.
- **AvatarGroup without actions**: the avatars are decorative, and the group is named with the count and every name, such as "4 people: Alex Morgan, Sam Lee, Priya Shah, Jordan Ellis".
- **Pressable avatars**: with `onPersonClick` each avatar is a button, and a person with `href` is a link through the `LinkProvider`; each is named after the person, with the name in a tooltip on hover and keyboard focus. The avatar under the pointer or focus comes to the front with a state layer over its picture, and shrinks slightly while pressed without a reduced-motion preference.
- **Overflow**: `max` sets how many avatars show; the chip counts the rest of `people` and of `total`, when `people` is only a preview of more. Its tooltip lists the hidden names, then "N more" (`messages.avatarGroup.more`, or `formatMore`) for people counted in `total` without a name. A `max` or `total` that is not a count, such as NaN, shows and counts everyone passed.
- **Ring**: the ring takes the fill of the envUI surface the group sits on, such as a Card, a Surface or a Dialog, and the page's color elsewhere; set `--env-avatar-group-ring` for any other fill, such as `var(--env-color-list-item-bg)` on a List row.
- **Right-to-left**: avatars run from the right, and the chip still reads +2.

## Content guidelines

- Pass the person's full name as `name`: it is the image's name, the tooltip, the source of the initials and what chooses the color. Pass the same name everywhere, so the color stays the same.
- Name an AvatarButton after what it opens, such as "Open account menu", and use `description` for what tells accounts apart, such as the e-mail address.
- Translate the group's name and the overflow text with `messages.avatarGroup` on EnvUIProvider, such as "4 personnes"; `formatLabel` and `formatMore` override them for one group.

## Do and don't

### Do

- Write the person's name beside an avatar wherever there is room; the avatar then stays decorative.
- Use the default person picture for people and initials for organizations.
- Let the name choose the color; set `hue` only for an organization with a color of its own.
- Use AvatarButton for the account menu's trigger, and give it an `aria-label` that says what it opens.
- Choose `max` so a group fits its place without wrapping.

### Don't

- Don't use an avatar as the only place a name appears, unless it is named or in a group that names everyone.
- Don't put an Avatar inside your own button; use AvatarButton, or `onPersonClick` in a group.
- Don't give an avatar's color a meaning, such as a status or a role; use a Badge.
- Don't use a group where people need to read every name; list them with their names.

## Accessibility

### Keyboard

| Key                                                       | Action                                                                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>           | Moves focus to an AvatarButton, to each pressable avatar of a group and to a group's overflow chip, whose tooltip opens on focus. |
| <kbd>Enter</kbd>                                          | Presses an AvatarButton or a pressable avatar, or follows an avatar's link.                                                       |
| <kbd>Space</kbd>                                          | Presses an AvatarButton or a pressable avatar that is a button.                                                                   |
| <kbd>Esc</kbd> on the overflow chip or a pressable avatar | Closes its tooltip.                                                                                                               |

### envUI provides

- A decorative avatar hidden from assistive technology, or with `named` an image named by `name`.
- AvatarButton as a native button named by `aria-label` or `name`, with the shared focus outline.
- An AvatarGroup named with the count and every name, as a `group`; pressable avatars as native buttons and links named after each person.
- The overflow chip as a tab stop and an image named by the people it stands for, so the keyboard and assistive technology reach the hidden names.
- Pictures loaded without a referrer.

### You provide

- The person's name beside a decorative avatar, or `named`.
- An `aria-label` on an AvatarButton that says what it opens, and the menu or action behind it.
- `messages.avatarGroup` in the application's language, or an `aria-label` for the group.
- `--env-avatar-group-ring` where a group sits on a fill that is not an envUI surface.

## Examples

### Colors

The eight colors of an avatar without a picture, with initials and with the default person picture; each holds white at 4.5:1 or more.

```tsx example=Colors

```

### Sizes

Four sizes, from a compact row to a profile page; each is named here, with no name beside it.

```tsx example=Sizes

```

### Pictures and fallbacks

A picture covers the circle. One that fails to load shows the default person picture, and an organization shows its initials.

```tsx example=Fallbacks

```

### Colors from names

Each name chooses its color, the same wherever the name appears.

```tsx example=ColorsFromNames

```

### An organization's own color

`hue` sets the color, such as an organization's own, instead of the one its name would choose.

```tsx example=OwnColor

```

### Account menu

AvatarButton opens the account menu; its tooltip shows the name and the e-mail address, and its halo stays while the menu is open.

```tsx example=AccountButton

```

### Members in a row

Groups on List rows show three or two avatars and count the rest, also people who are counted in `total` but not passed. The ring takes the row's fill.

```tsx example=ProjectMembers

```

### Pressable avatars

With `onPersonClick` every avatar is a button named after the person; a person with `href` is a link. The chip lists the people it hides.

```tsx example=PressableAvatars

```

## Changelog

- **1.0.0**: An avatar without a picture takes a solid color that its name chooses, one of eight, with white initials or a white figure; `hue` sets the color, and `avatarHue` returns the one a name chooses. Initials are semibold. Sizes are `sm`, `md`, `lg` and `xl` (were `small`, `standard`, `large` and `display`), set as `data-size` rather than the `env-avatar-{size}` classes. AvatarButton's `detail` is `description`, and it takes the touch height on touch screens. AvatarGroup's strings come from `messages.avatarGroup`, with the counts in the locale's digits, and it rings its avatars through the `--env-avatar-ring` hook. `getInitials` is internal; Avatar shows initials with `fallback="initials"`. Avatar's `label`, which named it as an image, is `named`.
- **0.6.0**: AvatarGroup.
- **0.4.0**: AvatarButton; initials use the avatar blue of the default person picture.
- **0.2.0**: Avatar, with the default person picture or initials as fallback.
