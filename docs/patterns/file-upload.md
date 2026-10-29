---
title: File upload
summary: Let people add files, follow each upload, and put right the ones that fail.
status: beta
since: 1.0.0
intent: Enter and change data
aliases:
  - upload
  - upload files
  - multiple file upload
  - file uploader
  - attachments
  - attach files
  - upload progress
  - upload list
  - file list
  - retry upload
useWhen:
  - Several files that upload as soon as they are added
  - Attachments to a form, sent once they are up
avoidWhen:
  - text: One file, such as a logo, sent with its form.
    use: DropZone
  - text: One task over many files that succeeds or fails as a whole, such as an import.
    use: Progress
  - text: Deleting files that can't come back, with a confirmation.
    see: destructive-actions
composes:
  - DropZone
  - List
  - Progress
  - Button
  - Toast
  - useToast
  - Textarea
  - Column
  - Row
  - Text
examples:
  UploadFiles:
    role: overview
    motion: true
  AttachInForm: example
  FileUploadAnatomy: anatomy
  TurnedAway: example
  FailedUpload: example
  RemoveWithUndo: example
  ZoneStaysReady:
    role: do
    caption: The zone stays ready for more while each file's row shows its upload.
  ZoneBusyWhileUploading:
    role: dont
    caption: 'The whole zone busy until every file is up: people wait to add the next.'
---

# File upload

## Variants

### In a form

The files upload while people fill in the rest. A send waits for any still going up, then goes with them.

```tsx figure=AttachInForm motion

```

## Anatomy

```tsx figure=FileUploadAnatomy

```

1. **Drop zone** (`env-drop-zone`)
2. **File list** (`env-list`)
3. **File** (`env-list-item:first-child`)
4. **Remove** (`env-list-item:first-child env-button`)
5. **Progress** (`env-progress`)

## Behaviour

### Progress for each file

Each file uploads as soon as it is added, in its own row of a [list](../components/list.md) under the [drop zone](../components/drop-zone.md).

- A [bar](../components/progress.md) shows what has been sent while it goes up.
- Each file uploads, fails and is tried again on its own.
- Once the file is up, the bar gives way to its size.
- A line under the list counts the files that are up and those that failed.

### Files that don't fit

A file of the wrong kind or too large never joins the list. The zone says which file and why, and takes the others.

```tsx figure=TurnedAway motion

```

### When an upload fails

The file keeps its row, with what went wrong and Try again, which starts it over. The other files go on uploading.

```tsx figure=FailedUpload motion

```

### Remove with undo

Remove takes the file out of the list at once and stops its upload, and a [toast](../components/toast.md) offers Undo, as [destructive actions](destructive-actions.md) describe.

```tsx figure=RemoveWithUndo motion

```

## Rules

People can keep adding files while others upload, and see each one's state in its row.

```tsx figure=ZoneStaysReady motion

```

```tsx figure=ZoneBusyWhileUploading motion

```

### Names

Show each file by the name people gave it, which is how they find it in the list, and keep its row where it is as its upload goes from start to end.

### Content

Say which files fit before people choose, and what went wrong in words.

- "PDF or images, up to 10 MB each" under the zone's label
- "budget-2026.xlsx is larger than 10 MB."
- "Couldn't upload. Check your connection and try again."
- "annual-review.pdf removed.", with Undo

## Accessibility

### Focus and keyboard

<kbd>Tab</kbd> goes from the zone to each row's actions in turn, and each bar names its file.

- The line under the list announces each outcome rather than every step of an upload.
- An action that leaves as it is pressed moves focus on: from Try again to Remove in the same row.
- From Remove, focus moves to the next row.

### envUI provides

- DropZone as one button that opens the file picker, named by its label and described by its description and error.
- Progress as a progress bar with its label and value, and List rows whose actions stay in reach on narrow screens.
- A toast with an action that stays until it is dismissed.

### You provide

- The checks of kind and size, and the zone's `error`.
- An `aria-valuetext` on each bar that names its file.
- A `role="status"` line that counts the files up and those that failed.
- Focus after Remove and Try again, and one Toast.Provider at the application's root.

## Compose

### Usage

Keep the uploads in state, each with its file's name and size, how much has been sent and whether it is uploading, done or failed.

- DropZone with `multiple` hands the files it takes to `onFilesAccepted`: check their size, set the zone's `error` for any turned away, add the rest and start each upload.
- Each upload is a List.Item: Progress in its children while it runs, the size or the failure in `description`, and Try again and Remove as text Buttons in a Row at its `end`.

```tsx source=UploadFiles

```

#### Progress for each file

`fetch` doesn't report what it has sent, so upload through `XMLHttpRequest`, whose `upload.onprogress` does, and give each upload an AbortController for Remove. Give each Progress `value` and `max` in bytes, `valueText` such as 1.2 of 2.4 MB, and `aria-valuetext` with the file's name, since every bar's label is Uploading.

```tsx
function upload(file: File, onProgress: (sent: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.upload.onprogress = (event) => onProgress(event.loaded);
    request.onload = () => (request.status < 400 ? resolve() : reject(new Error('Upload failed')));
    request.onerror = request.onabort = () => reject(new Error('Upload failed'));
    signal.addEventListener('abort', () => request.abort());
    const body = new FormData();
    body.append('file', file);
    request.open('POST', '/api/files');
    request.send(body);
  });
}
```

#### Files that don't fit

`accept` turns away other kinds of file, which go to `onFilesRejected`; check the size of those `onFilesAccepted` receives. Name the file and the reason in `error`. A drop of both kinds calls `onFilesRejected`, then `onFilesAccepted`, so keep the first message through the second, as the TurnedAway example does.

```tsx
<DropZone
  multiple
  label="Add documents"
  description="PDF or images, up to 10 MB each"
  accept="application/pdf,.pdf,image/*"
  error={error}
  onFilesRejected={(files) => setError(`${files[0].name} isn't a PDF or an image.`)}
  onFilesAccepted={addAndCheckSize}
/>
```

#### When an upload fails

Mark the upload failed and keep it in the list, with the reason in `description` and a Try again Button that starts it again from nothing. Try again leaves as it is pressed, so move focus to Remove in the same row through its `ref`, as the FailedUpload example does.

```tsx
<Row gap={3}>
  <Button variant="text" aria-label="Try again to upload team-photo.jpg" onClick={tryAgain}>
    Try again
  </Button>
  <Button ref={remove} variant="text" aria-label="Remove team-photo.jpg" onClick={drop}>
    Remove
  </Button>
</Row>
```

#### Remove with undo

Abort the upload, take the entry out of the list and show a toast through `useToast().show`, with `action: { label: 'Undo', onClick }`, as the RemoveWithUndo example does.

- Undo puts the entry back at its index, starts it again if it wasn't done, and dismisses the toast.
- Move focus to the next row's first button, or to the list, with `tabIndex={-1}`, once it is empty.

#### In a form

Upload the files as they are added, and keep what the server returns for each, such as an id, to send with the form. On submit, while any upload still runs, set `pending` on the submit Button and send once they are done, as the AttachInForm example does.

```tsx
<Button type="submit" pending={sending}>
  Send report
</Button>
```

### Composition

A Column holds the DropZone, a List.Root named with `aria-label`, and a caption Text with `role="status"`. Each List.Item has the file's name as `label`; its `description` is the size once done or the reason it failed, its children a Progress while it uploads, and its `end` a Row with Try again, when it failed, and Remove. In a form, the zone is `size="sm"` among the fields, with the list under it.

## Changelog

- **1.0.0**: The pattern.
