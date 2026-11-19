---
title: Alert
summary: An inline message about a page or a section, with an optional action.
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
  BannerAction: example
  SaveFailed: example
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

### Another icon, or none

```tsx figure=CustomIcon

```

### Actions at the end

```tsx figure=BannerAction widths="40 18" sweep

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

```tsx figure=SaveFailed motion

```

### Removing an alert

<!-- specimen: RemovingAlerts -->
