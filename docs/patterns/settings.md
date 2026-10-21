---
title: Settings
summary: Let people change how the application works for them, and see each change apply.
status: beta
since: 1.0.0
intent: Collect and change information
aliases:
  - preferences
  - options
  - account settings
  - notification settings
  - appearance
  - danger zone
useWhen:
  - Someone changes a preference that applies at once, such as a notification or the theme.
  - Someone edits a few related values that only make sense saved together, such as a profile.
avoidWhen:
  - text: Several answers given once and submitted together, such as creating something.
    see: forms
  - text: A choice that filters or changes the view of the page people are on.
    use: SegmentedControl
composes:
  - Page
  - PageHeader
  - NavList
  - Surface
  - Column
  - Row
  - Text
  - List
  - DescriptionList
  - Switch
  - Select
  - RadioGroup
  - Radio
  - TextField
  - Badge
  - Button
  - ConfirmDialog
  - Toast
  - useToast
  - useThemePreference
related:
  - forms
  - destructive-actions
  - feedback
  - switch
  - radio
  - description-list
---

# Settings

## Overview

Use this pattern to let people change how the application behaves for them: notifications, privacy, appearance, their profile and the rare action that can't be undone. Each setting either applies the moment people change it or waits, with the settings it depends on, for a Save button, and the two never share a section.

```tsx example=ImmediateToggles

```

## Anatomy

1. **Page:** a [Page](../components/page.md) with `width="sm"` and a [PageHeader](../components/page-header.md) titled "Settings". A long page lists its sections in a [NavList](../components/nav-list.md) beside them, or gives each its own page.
2. **Section:** a `section` named by its heading, a [Text](../foundations/typography.md) `variant="title"`, grouping the settings for one thing people want to do, such as "Email notifications" or "Privacy".
3. **Immediate settings:** rows of a [List](../components/list.md), each with a [Switch](../components/switch.md) as its action, named by the row's title and described by its detail. A [DescriptionList](../components/description-list.md) with `controls` suits a compact list of values with a Select or a Switch.
4. **Choices:** a [RadioGroup](../components/radio.md) with `orientation="vertical"` for one of a few options with descriptions, such as the theme; a [Select](../components/select.md) for a longer list, such as a time zone.
5. **Saved section:** a `form` of related fields, such as [TextField](../components/text-field.md)s, with a primary Save [Button](../components/button.md) and a Cancel button after them, and a [Badge](../components/badge.md) while it has unsaved changes.
6. **Danger zone:** the last section, with an `outline` danger Button that opens a [ConfirmDialog](../components/confirm-dialog.md) `tone="danger"`.
7. **Feedback:** a toast through [useToast](../components/toast.md) for a change with effects outside the page; a status text for a saved section.

## States and behaviour

- **A Switch applies at once.** It has no Save button: the setting changes, and is stored, the moment people switch it. A [Checkbox](../components/checkbox.md) in a form waits for Save. Never mix them in one section, or people can't tell which changes are kept.
- **Confirm only what shows elsewhere.** A switch shows its own state, so most changes need no message. Show a toast when a change has an effect people can't see from the page, such as becoming visible in a directory.
- **Saved sections keep edits apart.** Changes to a saved section stay in it until Save or Cancel, and mark it "Unsaved changes" meanwhile; nothing else on the page saves them. Cancel puts back what was saved; with no edits, it changes nothing. During a save, Cancel only stops waiting: a save already sent can't be called back, so the section then shows what the server reports it saved.
- **Appearance applies at once.** The theme comes from `useThemePreference`, whose provider stores the choice and applies it to the whole page. The scale, comfortable or compact, is one for the whole app: store it and pass it to the root provider's `scale`, never to a single page or section.
- **When a change fails.** Put the control back as it was and say so in a toast with "Try again"; a saved section keeps its edits and shows an Alert, as a form does.
- **Destructive settings** follow [Confirmation and destructive actions](destructive-actions.md): a dialog names the consequence, and for an action that can't be undone and reaches many people, asks for the name.
- **Narrow windows.** List rows move a control below their text when it doesn't fit; the section navigation folds into the page or a menu.

## Content guidelines

- Name a section after what people want to do, "Email notifications", not after the data, "User preferences".
- Label a switch with the setting in a positive form that stays the same in both states, "Show me in the directory", and describe its effect in the row's detail. Follow [Labels, descriptions and placeholders](../foundations/content.md#labels-descriptions-and-placeholders).
- Name buttons with a verb and an object, "Save profile", "Delete workspace…", following [Buttons and actions](../foundations/content.md#buttons-and-actions).
- Write a toast as [Feedback and status](../foundations/content.md#feedback-and-status) describes: what happened, in the past tense, or, for a setting, the state the change leaves, "Other people at Northwind can now find you in the directory."

## Do and don't

### Do

- Group settings by what people want to do, not by how the data is stored.
- Use a Switch for a setting that applies at once, and a Save button for fields that only make sense together.
- Put the danger zone last, apart from everything else.
- Keep each setting's current value visible.

### Don't

- Don't mix Switches and fields that wait for Save in one section.
- Don't add a Save button to a page of switches.
- Don't announce every switch with a toast.
- Don't let people change the scale per page; the app has one scale.

## Accessibility

### Focus and keyboard

Tab moves through the settings in the order they show, and Space turns a focused Switch on or off; focus stays where it is, since nothing on the page moves. Arrow keys move between the options of a RadioGroup and choose them. Save keeps focus on its button and announces the outcome in the status; Cancel keeps focus on Cancel and, when there were edits, says they were discarded, or, during a save, that it stopped waiting for it. A refused Save moves focus to the field to fix, which reads its error; only when focus is already in the field, where focusing it again reads nothing, does the status say the error. The danger zone's dialog takes focus to Cancel, and focus returns to the button that opened it when the dialog closes.

### envUI provides

- Switch as a native checkbox with the switch role, toggled with Space, its label stable in both states.
- RadioGroup as a `fieldset` with a `legend`, whose radios share a name and move with the arrow keys.
- A ConfirmDialog with the alert dialog role, focus on Cancel for a danger confirmation, and focus returned when it closes.
- Toasts in a polite live region, which read each notification without moving focus.

### You provide

- A heading for every section, and a name for every switch: its label, or `aria-labelledby` and `aria-describedby` to the row's title and detail.
- Storing each change, and putting a control back when storing fails.
- A status message when a section is saved, and moving focus to a field that must be fixed.
- One Toast.Provider and one ThemePreferenceProvider at the application's root.

## Examples

### Save a section

A profile's fields depend on each other, so they wait for Save. The section marks its unsaved changes, and Cancel puts back what was saved.

```tsx example=SaveSection

```

### Appearance

The theme applies the moment people choose it, through `useThemePreference`. The density only keeps the choice in the example: the application stores it and passes it to the root provider's `scale`, the app's one scale.

```tsx example=AppearanceChoice

```

### Danger zone

Deleting the workspace can't be undone and affects everyone, so the dialog asks for its name. A confirmation with the wrong name keeps the dialog open and says what to enter.

```tsx example=DangerZone

```
