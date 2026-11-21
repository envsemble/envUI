---
title: Avatar
summary: A person's or organization's picture, alone or in a group.
status: stable
since: 1.0.0
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
  - A few people in a row where space is short (AvatarGroup)
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
  BotsAndPresence: example
  AvatarAnatomy:
    role: anatomy
    caption: Spread, as under the pointer, and held level.
  ProjectMembers: example
  ChooseReviewers: example
  PressableAvatars: example
---

# Avatar

## Variants

```tsx figure=Sizes

```

1. **Small**
2. **Medium**
3. **Large**
4. **Extra large**

### Pictures and fallbacks

```tsx figure=Fallbacks

```

### An own fallback and a badge

```tsx figure=BotsAndPresence

```

### Colors from the name

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

```tsx figure=ProjectMembers motion

```

### Chosen

```tsx figure=ChooseReviewers

```

### Pressable avatars

```tsx figure=PressableAvatars motion

```
