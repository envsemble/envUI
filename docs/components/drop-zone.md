---
title: DropZone
summary: An area that takes dropped files and opens the file picker when pressed; the application handles and shows the files.
status: stable
since: 0.5.0
category: Forms & selection
aliases:
  - FileDropzone
  - drop zone
  - dropzone
  - file drop
  - file upload
  - file uploader
  - uploader
  - file input
  - drag and drop
  - file picker
  - attachment
  - drag and drop upload
useWhen:
  - People add a file to a form or a page, such as a logo, by dropping it or choosing it.
  - People attach several files at once, such as documents to a message (`multiple`, `size="sm"`).
avoidWhen:
  - text: A text value people type, such as a link to a file.
    use: TextField
  - text: A single action that opens the file picker in a toolbar, without a drop target.
    use: Button
  - text: Progress of a long upload with a known size.
    use: Progress
  - text: The files already added, each with its actions.
    use: List
components:
  - DropZone
---

# DropZone

## Overview

A drop zone takes files dropped onto it, or chosen in the file picker it opens when pressed. The application uploads the files and shows what was chosen.

```tsx example=LogoUpload

```

### States

`accept` filters dropped and chosen files; those that don't fit go to `onDropRejected`. While `pending`, a spinner replaces the icon and the zone takes no files.

<!-- specimen: States -->

### Attach several files

With `multiple`, the zone takes several files at once; the application lists them, each with Remove.

```tsx example=AttachDocuments

```

### Upload with progress

While the application uploads, `pending` keeps the zone busy, and its label says what is happening.

```tsx example=UploadProgress

```

### In a form

With `name`, the form submits the files the zone took, and a reset clears them. `files` hands the zone the files the application keeps.

```tsx example=InAForm

```

## Variants

```tsx variants=Sizes

```

1. **md**
2. **sm**

| Size        | Use for                                                 |
| ----------- | ------------------------------------------------------- |
| `size="md"` | A file that is the main content of a form. The default. |
| `size="sm"` | Attachments in a dense form or a row.                   |

## When to use

```tsx do=SaysWhatIsHappening caption="While pending, a label that says what is happening."

```

```tsx dont=SilentPending caption="A spinner beside a label that still asks for a file."

```

- Show what was chosen beside or in place of the zone, with Replace and Remove.
- No links or other controls inside the zone: the whole zone is one button.

### Labels

Say what to add in the label, and which files fit in the description.

## Anatomy

```tsx anatomy=DropZoneAnatomy

```

1. **Drop zone** (`env-drop-zone`)
2. **Target** (`env-drop-zone-target`)
3. **Icon** (`env-drop-zone-icon`, `icon`)
4. **Label** (`env-drop-zone-label`, `label`)
5. **Description** (`env-drop-zone-description`, `description`)

## Adapting to width

A zone fills its container, and its text wraps.

```tsx example=NarrowZone widths="14 30"

```

## Accessibility

### Keyboard

| Key                                             | Action                      |
| ----------------------------------------------- | --------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the zone. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Opens the file picker.      |

### envUI provides

- The zone as a button named by its label and described by its description and error.
- `aria-busy` while pending.
- A native file input for the picker and for forms.

### You provide

- A label that says what to add.
- Checks of size and contents, and the `error` message.
- An announcement when an upload finishes, and the list of chosen files.

## Changelog

- **1.0.0**: `onFiles` is `onDropAccepted` and `onReject` is `onDropRejected`, which the `v1-props` codemod writes. The zone is named by what it shows, its label and its description, and described by its error. Its frame is Field's root and error.
- **1.0.0**: `FileDropzone` is `DropZone`, with the `env-drop-zone-*` classes; the page is `drop-zone`.
- **0.5.0**: FileDropzone, with `accept`, `multiple`, `onReject`, `pending`, `error`, `compact`, and `name`, `files` and `inputRef` for forms and replacing a file.
