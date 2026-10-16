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
related:
  - text-field
  - button
  - progress
  - list
  - loading
components:
  - DropZone
---

# DropZone

## Overview

A drop zone takes files two ways: dropped onto it, or chosen in the file picker it opens when pressed. It filters them by `accept`, hands the ones it takes to `onDropAccepted` and the others to `onDropRejected`, and takes part in native forms with `name`. The application uploads or reads the files and shows what was chosen; the zone doesn't list them.

```tsx example=LogoUpload

```

## Anatomy

1. **Target**: a button with a dashed outline in the field border color, 1 rem corners and the label and description centred; it is the zone's whole area.
2. **Icon** (`icon`): an upload icon, 1.5 rem in a 2.75 rem circle on the neutral fill; a spinner while `pending`.
3. **Label** (`label`): what to drop or choose, in medium weight; it names the zone.
4. **Description** (optional, `description`): which files fit, in muted small text; it describes the zone.
5. **Error** (optional, `error`): a message with an error icon below the zone, which also turns the outline red.

## Variants and sizes

| Size        | Use for                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `size="md"` | A file that is the main content of a form, such as a logo: a tall area at least 9 rem high. The default. |
| `size="sm"` | Attachments in a dense form or a row: one row with a 2 rem icon beside the label and description.        |

<!-- specimen: States -->

- The zone fills its container's width; its text wraps, also within long words.
- A small zone is as tall as a control plus 1 rem, with the label in the small body type.

## States and behaviour

- **Pressing**: pressing the zone, or <kbd>Enter</kbd> or <kbd>Space</kbd> while it has focus, opens the file picker. On hover the outline turns blue over a state layer, and keyboard focus shows a focus outline.
- **Dragging**: files dragged over the zone turn the outline solid blue on the selection tint, and dropping them anywhere on the zone hands them over. Dragged text or links don't change it.
- **Filtering**: `accept` filters both the picker and dropped files, by MIME type, group such as `image/*` and extension such as `.webp`. Files that don't fit go to `onDropRejected`, and without `multiple` so do the files after the first; check sizes and contents in `onDropAccepted`.
- **Pending**: while `pending`, a spinner replaces the icon, the zone reports `aria-busy`, and it takes no new files; change the label to say what is happening, such as "Uploading the logo".
- **Disabled**: the zone can't be pressed or focused, takes the shared disabled opacity and takes no files. A pending or disabled zone still catches dropped files, so the browser doesn't open them.
- **In forms**: with `name`, native forms submit the last files the zone took, dropped ones included, and a form reset clears them. `files` hands the zone the files the application keeps, such as after Remove, so the form submits exactly what it shows. People can choose the same file again, such as after removing it.
- **Hidden**: `hidden` hides the zone, such as while the application shows the chosen file; its file picker still opens through `inputRef`, such as from a Replace button.

## Content guidelines

- Say what to do in the label, with the thing to add: "Drop a logo here, or browse", "Attach documents".
- Say which files fit in the description: "PNG, JPG or WebP up to 2 MB".
- Write an error that says how to correct the file: "Choose an image up to 2 MB."
- While pending, say what is happening in the label: "Uploading the logo".

## Do and don't

### Do

- Show what was chosen beside or in place of the zone, with actions to replace or remove it.
- Check file sizes and contents in `onDropAccepted`, and show the problem in `error`.
- Use `files` in a form where people can remove files, so the form submits what it shows.

### Don't

- Don't put links or other controls inside the zone; the whole zone is one button.
- Don't list the chosen files inside the label.
- Don't leave a zone pending without saying what it is doing.

## Accessibility

### Keyboard

| Key                                             | Action                            |
| ----------------------------------------------- | --------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to and from the zone. |
| <kbd>Enter</kbd> or <kbd>Space</kbd>            | Opens the file picker.            |

### envUI provides

- A native button named by `label` and described by `description` and `error`, so the file picker is reachable without drag and drop.
- `aria-busy` and `aria-disabled` while pending, and the native disabled state.
- The upload icon hidden from assistive technology, the error icon too, and a focus outline.
- Native file inputs for the picker and for form submission, kept out of the tab order.

### You provide

- A `label` that says what to add, and a `description` of the files that fit.
- The chosen files in the page, with accessible actions to replace or remove them, and an announcement when an upload ends, such as a status.
- The checks behind `error`, beyond the types `accept` filters.

## Examples

### Attach several files

A small zone with `multiple` adds documents to a list the application shows, each with a Remove action.

```tsx example=AttachDocuments

```

### Upload with progress

While the application uploads a file, the zone is pending, its label says what is happening, and a status announces when it's done.

```tsx example=UploadProgress

```

### In a form

With `name`, the form submits the files the zone took, and Reset clears them.

```tsx example=InAForm

```

## Changelog

- **1.0.0**: `onFiles` is `onDropAccepted` and `onReject` is `onDropRejected`, which the `v1-props` codemod writes. The zone is named by what it shows, its label and its description, and described by its error. Its frame is Field's root and error.
- **1.0.0**: `FileDropzone` is `DropZone`, with the `env-drop-zone-*` classes; the page is `drop-zone`.
- **0.5.0**: FileDropzone, with `accept`, `multiple`, `onReject`, `pending`, `error`, `compact`, and `name`, `files` and `inputRef` for forms and replacing a file.
