---
title: DropZone
summary: Drop files or choose them in the file picker; the application shows what was chosen.
status: beta
since: 0.5.0
category: Forms & selection
aliases:
  - FileDropzone
  - file upload
  - file input
  - dropzone
  - uploader
related:
  - text-field
  - button
  - loading
components:
  - DropZone
---

# DropZone

## React usage

```tsx
import { DropZone } from '@envsemble/envui';

<DropZone
  label="Drop a logo here, or browse"
  description="PNG, JPG or WebP up to 2 MB"
  accept="image/png,image/jpeg,.webp"
  onFiles={([file]) => upload(file)}
  onReject={() => setError('Choose a PNG, JPG or WebP image.')}
  pending={uploading}
  error={error}
/>;
```

### Props & contracts

| Name         | Contract                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| label        | Required: what to drop or choose, and the zone's accessible name                                               |
| description  | Which files fit, such as types and size; linked to the zone                                                    |
| icon         | Replaces the upload icon                                                                                       |
| accept       | File types as in the native accept attribute: MIME types, groups such as image/\* and extensions such as .webp |
| multiple     | Take several files at once; otherwise the zone takes the first file                                            |
| onFiles      | Receives the dropped or chosen files that the zone takes                                                       |
| onReject     | Receives the files that do not match accept, and those after the first without multiple                        |
| pending      | A spinner replaces the icon; the zone reports that it is busy and takes no new files                           |
| error        | A message linked to the zone, whose outline takes the error color                                              |
| disabled     | The zone cannot be pressed or focused and takes no files                                                       |
| compact      | One row with a small icon instead of the tall area                                                             |
| name / form  | Submit the last files the zone took with a native form, until the form resets                                  |
| files        | The files a named zone submits when the application keeps them, such as after Remove                           |
| inputRef     | The native file input that opens the file picker, for example from a Replace button                            |
| Native props | className, style, hidden and ref of the root element                                                           |

### Showing the chosen file

The application shows what was chosen, for example an image with actions to replace or remove it, and hides the zone in the meantime. Replace opens the zone's file picker through inputRef. In a form, files hands the zone the file the application keeps, so the form submits what it shows, and nothing after Remove.

```tsx
import { useEffect, useRef, useState } from 'react';
import { ActionGroup, Button, DropZone, Text } from '@envsemble/envui';

const picker = useRef<HTMLInputElement>(null);
const [logo, setLogo] = useState<File | null>(null);
const [preview, setPreview] = useState<string>();
useEffect(() => {
  if (!logo) return setPreview(undefined);
  const url = URL.createObjectURL(logo);
  setPreview(url);
  return () => URL.revokeObjectURL(url);
}, [logo]);

<>
  <DropZone
    hidden={logo != null}
    inputRef={picker}
    name="logo"
    files={logo ? [logo] : []}
    label="Drop a logo here, or browse"
    description="PNG, JPG or WebP up to 2 MB"
    accept="image/png,image/jpeg,.webp"
    onFiles={([file]) => setLogo(file)}
  />
  {logo && (
    <ActionGroup>
      <img src={preview} alt="" width={48} height={48} />
      <Text as="span">{logo.name}</Text>
      <Button variant="secondary" onClick={() => picker.current?.click()}>
        Replace
      </Button>
      <Button variant="text" onClick={() => setLogo(null)}>
        Remove
      </Button>
    </ActionGroup>
  )}
</>;
```

## Guidelines

- Use a drop zone where people add files to a form or a page, such as a logo or attachments. Say what to do in the label, such as "Drop a logo here, or browse", and which files fit in the description.
- The zone is a button: pressing it, or <kbd>Enter</kbd> or <kbd>Space</kbd> while it has focus, opens the file picker. Files dragged over it turn the dashed outline solid blue on the selection tint, and dropping them anywhere on the zone hands them over. A pending or disabled zone still catches dropped files, so the browser does not open them, but takes none.
- accept filters both the picker and dropped files. Files that do not fit go to onReject, and so do the ones after the first when multiple is off; show a message through error, which colors the outline and is linked to the zone. Check sizes and contents in onFiles, where the application has the files.
- Set pending while the application uploads or reads the files: a spinner replaces the icon and the zone reports aria-busy. Change the label to say what is happening, such as "Uploading the logo".
- With name, native forms submit the last files the zone took, dropped ones included, and resetting the form clears them. Where the application lets people replace or remove files, pass the files it keeps to files, so the form submits exactly what it shows. People can choose the same file again, for example after removing it.
- compact suits dense forms and rows: one row with the icon beside the label and description.

TypeScript declarations provide the complete public API.

## Related topics

- [TextField](../components/text-field.md)
- [Button](../components/button.md)
- [Loading](../patterns/loading.md)
