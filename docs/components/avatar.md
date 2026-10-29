---
title: Avatar
summary: A round picture of a person or organization, with the default person picture or initials as fallback, as a button, or piled in a group.
status: stable
since: 0.2.0
category: Data display
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
  - A person or an organization beside their name, such as in a list of members
  - The signed-in account's menu in the application's chrome (AvatarButton)
  - A few people in a row where space is short, such as a project's members (AvatarGroup)
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
examples:
  PersonWithName: overview
  AccountButton:
    role: overview
    caption: 'AvatarButton: an avatar as a button, with the name in a tooltip.'
    motion: true
  Sizes: variants
  Fallbacks: example
  AvatarAnatomy:
    role: anatomy
    caption: Spread, as under the pointer, and held level.
  ProjectMembers: example
  ChooseReviewers: example
  PressableAvatars: example
  NamesBeside:
    role: do
    caption: The name beside the avatar, wherever there is room.
  AvatarsAlone:
    role: caution
    caption: 'Avatars alone, where room is short: people hover each one to learn who it is.'
---

# Avatar

## Variants

```tsx figure=Sizes

```

1. **Small**
2. **Medium**
3. **Large**
4. **Extra large**

| Size        | Use for                                               |
| ----------- | ----------------------------------------------------- |
| Small       | Compact text, such as a combobox option.              |
| Medium      | Lists, comments and toolbars. The default.            |
| Large       | A name with a second line, such as an account header. |
| Extra large | A profile page. Not for AvatarButton.                 |

### Pictures and fallbacks

Without a picture, or while it loads or after it fails, an avatar shows the default person picture, or initials for an organization.

```tsx figure=Fallbacks

```

### Colors from the name

The name chooses one of eight pastel colors, the same on every page.

- An organization can take another of them as its own.
- Each is a soft fill with the initials or the figure in a deep shade of the same hue.
- The colors only tell people apart.

<!-- specimen: Hues -->

## Anatomy

```tsx figure=AvatarAnatomy specimen

```

1. **Group** (`env-avatar-group`)
2. **Avatar** (`env-avatar`)
3. **Initials** (`env-avatar-fallback-initials::text`)
4. **Person picture** (`env-avatar-person-figure`)
5. **Overflow** (`env-avatar-group-overflow`, `max`)

## Behaviour

### A group as a pile

AvatarGroup rests as a compact pile, like stacked cards, with the count of the rest in a rounded square.

- Hovering, tapping or focusing it spreads the avatars along a gentle arch, so each one shows.
- It keeps the room its spread takes, so nothing around it moves.
- A faint shadow under each avatar and under the count parts each from the one it lies on.

```tsx figure=ProjectMembers motion

```

### Chosen

An avatar can show as chosen, such as in a list of people to pick from.

- A ring and a check, in the accent of a checked box, so the choice never rests on color alone.
- It is a look only: the control around it, such as a checkbox, says it is chosen.

```tsx figure=ChooseReviewers

```

### Pressable avatars

Each avatar in a group can open something, such as the person's profile.

- While piled, the whole pile is one target that spreads it, so a press never lands on someone hidden under another.
- Spread, each avatar is a target of its own, as large as a finger needs on a touch screen.

```tsx figure=PressableAvatars motion

```

## Rules

Beside a visible name an avatar is decorative; on its own it can be a picture named after the person.

```tsx figure=NamesBeside

```

```tsx figure=AvatarsAlone

```

### Names

Give each person their full name, the same everywhere: it names the picture and chooses the initials and the color.

### Groups and buttons

Show only as many people in a group as fit without wrapping, and use AvatarButton rather than an avatar inside a button of your own.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to an AvatarButton, each pressable avatar and the count; focus in a group spreads it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses an AvatarButton or a pressable avatar.                                              |
| <kbd>Esc</kbd>                                  | Closes a tooltip.                                                                           |

### envUI provides

- A decorative avatar hidden, or with `named` an image named by `name`.
- A group named with its count and every name, such as 4 people: Alex Morgan, Sam Lee…
- Pressable avatars as native buttons and links, named after each person.
- A piled group as one pointer target, which spreads; its avatars take presses only once spread, apart and whole, so no target lies under another (WCAG 2.5.8).
- The count as a tab stop, so the hidden names can be reached.

### You provide

- The name beside a decorative avatar, or `named`.
- An `aria-label` on an AvatarButton that says what it opens.
- `messages.avatarGroup` in the application's language.

## Compose

### Usage

Avatar takes the person's or organization's `name`, a picture in `src`, and `fallback="initials"` for initials instead of the default person picture. Beside a visible name it is decorative; `named` makes it an image named by `name`. `size` is `sm`, `md`, the default, `lg` or `xl`: 1.5, 2, 3 or 5.5 rem.

```tsx
<Avatar name="Alex Morgan" src={alex.picture} />
<Avatar name="Northwind Labs" fallback="initials" size="lg" named />
```

#### Chosen

`selected` draws the ring and the check at its bottom end, `env-avatar-check`. It says nothing to assistive technology: the checkbox or option around it does, as in the ChooseReviewers example. An AvatarGroup person takes `selected` too, and comes in front of its neighbours so its check shows.

```tsx
<Checkbox
  checked={chosen}
  onCheckedChange={setChosen}
  label={
    <Row align="center" gap={3}>
      <Avatar name="Sam Lee" selected={chosen} />
      <Text render={<span />}>Sam Lee</Text>
    </Row>
  }
/>
```

#### Colors

`hue` sets one of the eight colors by name, in place of the one the name chooses: `powder` (powder blue), `seafoam`, `sage`, `butter`, `blush`, `periwinkle`, `orchid` or `oat` (a warm oat). `avatarHue(name)` returns the one a name chooses, and `avatarHues` lists the eight in order. Each is a tonal pair, a soft fill with the initials or the figure in a deep shade of the same hue, slightly deeper in the dark theme.

#### Groups

AvatarGroup takes `people`, each with a `name` and an optional `src`, `fallback`, `id` and `selected`. `max` sets how many show, and the count chip counts the rest; `total` counts people beyond a preview list.

- At rest the avatars pile up, each a little off the line and turned, with the count chip at the bottom of the pile.
- The group always keeps the room its spread takes, so spreading never moves what is around it; `align="end"` piles a group at the end of that room, for a group that ends a row, such as a list row's action.
- With reduced motion it spreads at once.
- `formatMore` and `formatLabel`, or `messages.avatarGroup`, set its words.

```tsx
<AvatarGroup people={members} max={3} total={12} align="end" />
```

#### Pressable groups

`onPersonClick` makes every avatar a button, which receives the person pressed; a person with `href` is a link, through the application's router link from `LinkProvider`.

- While the group is piled its avatars and count take no pointer events, and a cover over the group, its `::before`, takes the pointer, so no avatar can be pressed or hovered then.
- The cover stays for the medium motion duration after the group starts to spread, until the avatars are in place.
- A hovering pointer spreads the group with `:hover`, and keyboard focus inside with `:focus-visible`; a click's focus, without a focus ring, doesn't hold it spread.
- Where no pointer hovers, a tap on the pile sets `data-spread` on the group, until a tap outside it or five seconds without a tap in it.
- Spread, each pressable avatar is a whole target, 2.75 rem on touch screens.

```tsx source=PressableAvatars

```

### Composition

The group is `env-avatar-group`, with an `env-avatar` for each person, an `env-avatar-group-item` button or link around each pressable one, and the count chip, `env-avatar-group-overflow`, whose tooltip lists the people it hides. A picture is `env-avatar-image`, the default person picture `env-avatar-person`, and AvatarButton `env-avatar-button`.

### Customize

`--env-avatar-container` and `--env-avatar-content` set the colors of one avatar, its fill and its initials or figure, through `style` or CSS, in place of its hue. The hues are tokens, `--env-color-bg-avatar-{hue}`, `--env-color-fg-avatar-{hue}` and `--env-color-fg-avatar-figure-{hue}`, and the powder hue is also the unsuffixed `--env-color-bg-avatar`, `--env-color-fg-avatar` and `--env-color-fg-avatar-figure`. That faint shadow, 1 px down and 2 px soft, is envUI's one drop shadow; under forced colors there is none, and `box-shadow: none` on `.env-avatar` and `.env-avatar-group-overflow` removes it.

## Changelog

- **1.0.0-prerelease.5**: AvatarGroup's `gather` is `align`, as Row and Popover name the inline axis.
- **1.0.0-prerelease.5**: An avatar and AvatarGroup's count cast a faint, small shadow in a deeper shade of the surface below, so the avatars of a group part from one another.
- **1.0.0-prerelease.3**: AvatarGroup rests as a compact pile, like stacked cards, which is one pointer target: hover, a tap or keyboard focus spreads it, and its avatars take presses only once spread, in place of a looser rest that kept 1.5 rem of each pressable avatar uncovered. A tap spreads a group on touch screens too, marked with `data-spread`. The count is a rounded square the size of the avatars, at the bottom of the pile.
- **1.0.0-prerelease.2**: The eight colors are a new pastel palette of tonal pairs: a soft fill with initials and a figure in a deep shade of the same hue, rather than white. The hues are named for their colors, in `hue`, `data-hue` and the tokens: `blue` is `powder`, `teal` `seafoam`, `green` `sage`, `amber` `butter`, `red` `blush`, `violet` `periwinkle`, `purple` `orchid` and `slate` `oat`; `v1-props` rewrites a literal `hue`. `selected` shows an avatar as chosen, with a ring and a check, `env-avatar-check`. AvatarGroup rests bunched where a pointer can hover, with the count of the rest under the last avatar, and spreads along an arch under the pointer or with focus inside, within the room it keeps for the spread; `gather` sets where the avatars gather at rest. Avatars in a group and the count take no ring; `--env-avatar-ring` is gone, and `--env-avatar-group-ring` sets only the gap in a chosen avatar's ring.
- **1.0.0**: An avatar without a picture takes a solid color that its name chooses, one of eight, with white initials or a white figure; `hue` sets the color, and `avatarHue` returns the one a name chooses. Initials are semibold. Sizes are `sm`, `md`, `lg` and `xl` (were `small`, `standard`, `large` and `display`), set as `data-size` rather than the `env-avatar-{size}` classes. AvatarButton's `detail` is `description`, and it takes the touch height on touch screens. AvatarGroup's strings come from `messages.avatarGroup`, with the counts in the locale's digits. `getInitials` is internal; Avatar shows initials with `fallback="initials"`. Avatar's `label`, which named it as an image, is `named`.
- **0.6.0**: AvatarGroup.
- **0.4.0**: AvatarButton; initials use the avatar blue of the default person picture.
- **0.2.0**: Avatar, with the default person picture or initials as fallback.
