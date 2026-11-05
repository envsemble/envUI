---
title: DropZone
summary: An area that takes dropped files and opens the file picker when pressed.
status: stable
since: 1.0.0
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
  - Adding a file to a form or a page by dropping or choosing it, such as a logo
  - Attaching several files at once, such as documents to a message
avoidWhen:
  - text: Uploading files, with a list of them, progress for each and a way to try again.
    see: file-upload
  - text: A single action that opens the file picker in a toolbar, without a drop target.
    use: Button
  - text: Progress of a long upload with a known size.
    use: Progress
  - text: The files already added, each with its actions.
    use: List
components:
  - DropZone
examples:
  LogoUpload:
    role: overview
    motion: true
  Sizes: variants
  DropZoneAnatomy: anatomy
  AttachDocuments: example
  NarrowZone: example
  SaysWhatIsHappening:
    role: do
    caption: While pending, a label that says what is happening.
  SilentPending:
    role: dont
    caption: A spinner beside a label that still asks for a file.
---

# DropZone

## Variants

```tsx figure=Sizes

```

1. **Medium**
2. **Small**

| Size   | Use for                                                 |
| ------ | ------------------------------------------------------- |
| Medium | A file that is the main content of a form. The default. |
| Small  | Attachments in a dense form or a row.                   |

## Anatomy

```tsx figure=DropZoneAnatomy

```

1. **Drop zone** (`env-drop-zone`)
2. **Icon** (`env-drop-zone-icon`, `icon`)
3. **Label** (`env-drop-zone-label`, `label`)
4. **Description** (`env-drop-zone-description`, `description`)

## Behaviour

### States

A zone can take only some kinds of file, and turns the others away.

- While the application works on the files, a spinner replaces the icon.
- While pending, the zone takes no more.

<!-- specimen: States -->

### Attach several files

A zone can take several files at once. The application lists the files it took, each with Remove.

```tsx figure=AttachDocuments motion

```

### Adapting to width

A zone fills its container, and its text wraps.

```tsx figure=NarrowZone widths="30 14" sweep

```

## Rules

A drop zone says what to add and what is happening, and the files chosen show beside it.

```tsx figure=SaysWhatIsHappening

```

```tsx figure=SilentPending

```

### What was chosen

Show what was chosen beside the zone or in its place, with Replace and Remove.

### One button

The whole zone is one button, so it holds no links or other controls.

### Labels

Say what to add in the label, and which files fit in the description.

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

## Compose

### Usage

A DropZone takes dropped files and opens the file picker when pressed.

- `label` says what to add and `description` which files fit; together they name the zone.
- `onFilesAccepted` receives the files it takes.
- `icon` replaces the upload icon.

```tsx source=LogoUpload

```

#### Accept, several files and errors

`accept` filters dropped and chosen files, as the native attribute does, with MIME types such as `image/png`, groups such as `image/*` and extensions such as `.webp`; any file by default. Without `multiple` the zone takes the first file. Files that don't fit, and those after the first without `multiple`, go to `onFilesRejected`. Check size and contents yourself, and show the message in `error`, which takes the error color on the zone's outline. `disabled` turns the zone off; it still keeps the browser from opening dropped files.

```tsx
<DropZone
  multiple
  accept="application/pdf,.pdf"
  label="Drop documents here, or browse"
  description="PDF up to 10 MB each"
  error={error}
  onFilesAccepted={(files) => setDocuments((current) => [...current, ...files])}
  onFilesRejected={() => setError('Only PDF files can be attached.')}
/>
```

#### Pending work

While `pending`, a spinner replaces the icon, the zone reports `aria-busy` and takes no new files. Change the label to say what is happening, and announce when the upload finishes, such as in a `role="status"` text.

```tsx
<DropZone
  pending={uploading != null}
  label={uploading ? `Uploading ${uploading}` : 'Drop a report here, or browse'}
  description={uploading ? 'This takes a moment' : 'PDF up to 10 MB'}
  accept="application/pdf,.pdf"
  onFilesAccepted={upload}
/>
```

#### Sizes

`size` is `md`, the tall area with a large icon and the default, or `sm`, one row with a small icon, for attachments in a dense form or a row.

#### In a form

With `name`, a native form submits the last files the zone took, dropped ones too, and a reset clears them; `new FormData(form).getAll('attachments')` reads them, with an empty entry when there are none. `files` hands the zone the files the application keeps, such as after a Remove, and replaces the ones it took. `form` names a form the zone sits outside of, and `inputRef` reaches the native file input, to open the picker from a Replace button. `ref` reaches the zone itself: unlike a field's input, the file input holds no value a form library could register.

```tsx
<form onSubmit={send}>
  <TextField label="Subject" name="subject" />
  <DropZone
    size="sm"
    multiple
    name="attachments"
    label="Attach files"
    description="Sent with the message"
    onFilesAccepted={setAttachments}
  />
  <Button type="submit">Send</Button>
</form>
```

### Composition

The zone's frame is Field's root and error. Its parts are the zone, `env-drop-zone`, the target people press, `env-drop-zone-target`, with its icon, `env-drop-zone-icon`, its label, `env-drop-zone-label`, and its description, `env-drop-zone-description`; then the error, `env-field-error`. List the chosen files beside it, such as in a List with Replace and Remove, and keep links and other controls out of the zone.

## Changelog

- **1.0.0**: `onFiles` is `onFilesAccepted` and `onReject` is `onFilesRejected`; they run for dropped and browsed files alike. The zone is named by what it shows, its label and its description, and described by its error. Its frame is Field's root and error.
- **1.0.0**: `FileDropzone` is `DropZone`, with the `env-drop-zone-*` classes; the page is `drop-zone`.
