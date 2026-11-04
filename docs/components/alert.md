---
title: Alert
summary: An inline message about a page or a section, in an info, success, warning or danger tone, with an optional action and dismiss button.
status: stable
since: 1.0.0
category: Feedback
aliases:
  - Notice
  - banner
  - callout
  - inline message
  - inline notification
  - inline alert
  - message bar
  - info box
  - warning message
  - error message
useWhen:
  - A message that stays until it no longer applies, such as a paused sync
  - A failure beside what it concerns, such as a save that didn't go through
  - A warning before people act in a section, such as storage almost full
avoidWhen:
  - text: Brief feedback after an action, such as Saved or Invitation sent.
    use: ToastProvider
  - text: A region without content yet, such as an empty list or no search results.
    see: empty-states
  - text: An error about one field, shown on the field.
    use: TextField
  - text: A status beside a label, such as Draft or Blocked.
    use: Badge
  - text: A decision people must make before going on.
    use: Dialog
components:
  - Alert
examples:
  BlockedRelease: overview
  Tones: variants
  CustomIcon: example
  SaveFailed: example
  OneAlert:
    role: do
    caption: One alert per situation, with its next step.
  StackedAlerts:
    role: dont
    caption: Several alerts about one situation.
  AlertAnatomy: anatomy
---

# Alert

## Variants

```tsx figure=Tones

```

1. **Info**
2. **Success**
3. **Warning**
4. **Danger**

| Tone    | Use for                                                           |
| ------- | ----------------------------------------------------------------- |
| Info    | Something to know about the page. The default.                    |
| Success | A result that stays relevant, where a toast would leave too soon. |
| Warning | A problem to come unless people act.                              |
| Danger  | Something that failed or stopped working.                         |

### Another icon, or none

An alert can take another icon in place of its tone's, or none at all.

```tsx figure=CustomIcon

```

## Anatomy

```tsx figure=AlertAnatomy

```

1. **Container** (`env-alert`)
2. **Icon** (`env-alert-icon`, `icon`)
3. **Title** (`env-alert-title`, `title`)
4. **Message** (`env-alert-message`, `children`)
5. **Actions** (`env-alert-action`, `actions`)
6. **Dismiss button** (`env-alert-dismiss`, `onDismiss`)

## Behaviour

### Announce a failure

A warning or a danger alert that appears because of something people just did, such as a save that failed, can be read out at once. Info and success alerts are always read politely, without interrupting.

```tsx figure=SaveFailed motion

```

## Rules

An alert sits above the content it concerns.

```tsx figure=OneAlert

```

```tsx figure=StackedAlerts

```

### Removing an alert

Remove an alert once it no longer applies. Let people dismiss it only where the message can safely be hidden.

<!-- specimen: RemovingAlerts -->

## Accessibility

### Keyboard

| Key                                             | Action                                        |
| ----------------------------------------------- | --------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the action, then the dismiss button. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses the focused button.                   |

### envUI provides

- The `status` role on info and success alerts, and `alert` on warning and danger alerts with `announce`.
- An icon for each tone, hidden, beside text that carries the meaning.
- A dismiss button named by `dismissLabel`, in the provider's language.

### You provide

- A message that makes sense without its color and icon.
- `announce` only on an alert that appears because of something that just happened, never on one there when the page loads.
- Focus for after a dismissal, such as on the control the alert concerned.

## Compose

### Usage

An Alert takes its `tone`, a short `title`, the message as `children`, and `actions` below the message, such as a Button or a Link; a secondary Button there takes a fill that stands clear of the tint in both themes. Put it above the content it concerns, and remove it once it no longer applies.

```tsx source=BlockedRelease

```

#### Tones

`tone` is `info`, the default, `success`, `warning` or `danger`, for an error or a failure; a toast has `neutral` instead of `warning`, since a warning stays on the page, here. It sets the fill, the tone's stronger tint, and the color of the title and the icon. An alert has no edge, except at high contrast, where it takes the tone's softer tint and an edge in the border color.

```tsx
<Alert title="Sync paused">Changes are saved on this device until you reconnect.</Alert>
<Alert tone="danger" title="Couldn’t publish">Try again, or check the build log.</Alert>
```

#### Announce a failure

Info and success alerts take the `status` role and are read politely. `announce` gives a warning or danger alert the `alert` role, so it is read at once; set it only on an alert that appears because of something people just did, never on one there when the page loads. The SaveFailed example shows one after a failed save, and moves focus back to the save button when it is dismissed.

```tsx
<Alert tone="danger" title="Couldn’t save the draft" announce onDismiss={dismiss}>
  Your changes are still in the editor; try again in a moment.
</Alert>
```

#### Icon

`icon` replaces the tone's icon, and `null` or `false` leaves it out.

```tsx
<Alert icon={<IconConstruction />} title="Maintenance on Saturday">…</Alert>
<Alert tone="success" icon={false}>Priya Shah accepted the invitation.</Alert>
```

#### Dismiss

`onDismiss` shows a dismiss button that calls it; the application removes the alert, and moves focus, such as to the control the alert concerned. Offer it only where the message can safely be hidden. `dismissLabel` names the button, and is also its tooltip.

### Composition

The parts are the container, `env-alert`, the icon, `env-alert-icon`, the title, `env-alert-title`, the message, `env-alert-message`, the action, `env-alert-action`, and the dismiss button, `env-alert-dismiss`, an IconButton with a cross.

### Customize

An Alert draws an edge only at high contrast, unless its outline color sets one, and its title takes the icon's color while its text takes the tone's.

## Changelog

- **1.0.0-prerelease.5**: A card's inset, 14 px above and below and 16 px at the sides; the title is semibold in the body size, 2 px above the message, which takes the small body size.
- **1.0.0**: No edge outside high contrast: the tone's stronger tint fills it, the title takes the tone's color as the icon does, and its corners are a card's, 1.25 rem. At high contrast it keeps the softer tint with an edge in the border color.
- **1.0.0**: `actions` for `action`, as on Card and Dialog. `tone="danger"` for `error`; the dismiss button is an IconButton with a cross, named Dismiss in the provider's language.
- **1.0.0**: `Notice` is `Alert`, with `AlertTone` and the `env-alert-*` classes; the page is `alert`.
