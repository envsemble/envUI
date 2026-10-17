---
title: Settings page
summary: A page inside the app frame where people change their profile, notifications and appearance, and delete the workspace, with each section saved the way its settings need.
status: beta
since: 1.0.0
frame: app
aliases:
  - settings
  - preferences
  - account settings
  - profile settings
  - notification settings
  - options page
useWhen:
  - People change their own profile and preferences in one place.
  - Some settings apply at once and others wait for Save, and the page has to keep them apart.
avoidWhen:
  - text: Creating or editing one object, such as a project, in a single form.
    see: forms
  - text: A single setting beside the content it changes.
    use: Switch
composes:
  - Page
  - PageHeader
  - Sidebar
  - NavList
  - Stack
  - Surface
  - Text
  - TextField
  - Avatar
  - Badge
  - Button
  - Link
  - Alert
  - List
  - Switch
  - RadioGroup
  - Radio
  - useThemePreference
  - useToast
  - ConfirmDialog
related:
  - settings
  - forms
  - destructive-actions
  - app-frame
  - sidebar
---

# Settings page

## Overview

A settings page inside the [app frame](app-frame.md): the person's profile, their notifications, the theme and density, and a danger zone, as sections of one page with an "On this page" navigation beside them. Each section saves the way its settings need: the profile waits for Save, switches and choices apply at once, and deleting the workspace asks for its name. Start from it for a page of personal or workspace settings; it follows the [settings pattern](../patterns/settings.md).

```tsx template=SettingsPage

```

## Anatomy

1. **Page:** a [Page](../components/page.md) of `width="lg"` with a [PageHeader](../components/page-header.md), "Settings", and a one-line description.
2. **Columns:** a [Stack](../components/stack.md) row, with the navigation and the sections side by side from the `lg` breakpoint up.
3. **On this page:** a [Sidebar.Root](../components/sidebar.md) of the page's own, labelled "Settings sections", with `collapsible="none"` and `mobile="none"`, in a `Sidebar.Provider` with `breakpoint="lg"`, holding a [NavList](../components/nav-list.md) of the sections. It sticks below `--env-frame-sticky-top` as the sections scroll. Each item moves focus to its section's heading, and the current one has `aria-current="location"`.
4. **Sections:** a `section` named by its `h2`, a [Text](../foundations/typography.md) `variant="title"`, with a muted line where the section applies at once:
   - **Profile:** a `form` on a muted [Surface](../components/surface.md): an [Avatar](../components/avatar.md) with the person's initials, a "Unsaved changes" [Badge](../components/badge.md) while edits wait, the name and email address [TextField](../components/text-field.md)s, then Save profile and Cancel [Button](../components/button.md)s and a status line;
   - **Notifications:** [List](../components/list.md) rows that don't wrap, each with a [Switch](../components/switch.md) named by the row's title and described by its detail, which stays beside the text at every width;
   - **Appearance:** a [RadioGroup](../components/radio.md) for the theme, bound to [useThemePreference](../foundations/colors.md), and one for the density;
   - **Danger zone:** a List row with an outline danger Button, "Delete workspace…", that opens a [ConfirmDialog](../components/confirm-dialog.md) with the workspace's name to type.
5. **Feedback:** a toast through [useToast](../components/toast.md) after the profile is saved and when the weekly summary turns on or off.

## States and behaviour

- **Profile:** edits stay in the form, marked "Unsaved changes", until Save profile or Cancel. Save checks both fields: two errors show an error summary that takes focus, one moves focus to its field, and Enter in a field that is already focused says its error in the status. Saving is `pending`, never disabled, then a toast says "Profile saved." Cancel puts back what was saved.
- **Notifications:** a switch applies and is stored the moment it changes, with no Save button. Only the weekly summary, which shows up in people's email, gets a toast.
- **On this page:** the selected section follows scrolling. It is the section whose top most recently passed above a line 40% of the way down the window, that is, the last section whose top is at or above that line, and the first section while none is. The last section wins only when the page is scrolled to the bottom, since a short last section may never reach the line. Choosing a section selects it and focuses its heading at once.
- **Appearance:** the theme applies at once, to the whole application. The density is one for the application: store it and pass it to the root provider's `scale`. In the sample the density choice is only kept: the preview's scale comes from its address, so choosing Compact changes nothing on the page.
- **Danger zone:** the dialog names the workspace and the consequence, and starts on Cancel. Delete workspace, or Enter in the name field, deletes it only when the name matches; otherwise the field shows "Enter Northwind to confirm" and keeps focus.
- **When a change fails:** put the switch or choice back and say so in a toast with "Try again"; the profile keeps its edits and shows an [Alert](../components/alert.md) above the fields.
- **Widths:** from the `lg` breakpoint, 64 rem, the navigation sits beside the sections and sticks as they scroll; below it, on a tablet and a phone, it hides and the sections follow each other.

### Connect your data

- Replace `initialProfile`, the notification settings and the workspace's name with the signed-in person's, and the timer in `submit` and the comments in `change` and `onConfirm` with your service's calls.
- Store the density and pass it to the root provider's `scale`, as [setup](../setup.md) says; the theme needs nothing, as the application's ThemePreferenceProvider stores it.
- After the workspace is deleted, leave it: go to the sign-in page or another workspace through your router.

## Content guidelines

- Title each section with what people want to do or change, and keep the group of settings to one purpose ([Settings](../patterns/settings.md#content-guidelines)).
- Name a switch with the setting, not its state: "Weekly summary", not "Turn on the weekly summary".
- Use the same verb through the danger zone: "Delete workspace…", "Delete the Northwind workspace?" and "Delete workspace" ([Confirmations](../foundations/content.md#confirmations)).

## Do and don't

### Do

- Keep settings that apply at once and settings that wait for Save in different sections.
- Put the danger zone last, with an outline danger button and a typed confirmation.
- Give long settings pages their own pages per section, with the navigation as links, once a single page needs more than a few screens.

### Don't

- Don't put a Save button under switches, or a switch in a form that waits for Save.
- Don't disable Save profile until the fields are valid.
- Don't add a second frame or skip link for the page's navigation; the Sidebar inside Main keeps to itself.

## Accessibility

### Landmarks and headings

- The frame's `nav` "Primary", a second `nav` "Settings sections" for the page's navigation from the `lg` breakpoint up, and one `main`.
- One `h1`, "Settings", in the PageHeader; each section has an `h2`, and the error summary's title is a level-3 heading.
- Each section is a region named by its heading, and the profile form is named "Profile".

### envUI provides

- A Sidebar inside Main that keeps its own state, with no skip link or shortcut of its own.
- A NavList item that reports `aria-current="page"` while selected, or the value you pass in `aria-current`.
- Switches, radios and fields with their labels, descriptions, errors and `aria-invalid`.
- A ConfirmDialog that is a form: focus starts on Cancel, Enter in its field confirms through `onConfirm`, and focus returns to the button that opened it.

### You provide

- `aria-current="location"` on the current section's item, since its links stay on the page, and the selection that follows scrolling.
- Moving focus to a section's heading when its navigation item is chosen, and after a refused Save: to the error summary for several errors, to the field for one.
- The status that says an error when focus is already in the field.
- The `aria-labelledby` and `aria-describedby` that name and describe each switch from its row.
