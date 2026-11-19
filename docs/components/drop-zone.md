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
  FilesInsideTheZone: example
  NarrowZone: example
---

# DropZone

## Variants

```tsx figure=Sizes

```

1. **Medium**
2. **Small**

## Anatomy

```tsx figure=DropZoneAnatomy

```

1. **Drop zone** (`env-drop-zone`)
2. **Icon** (`env-drop-zone-icon`, `icon`)
3. **Label** (`env-drop-zone-label`, `label`)
4. **Description** (`env-drop-zone-description`, `description`)

## Behaviour

### States

<!-- specimen: States -->

### Attach several files

```tsx figure=AttachDocuments motion

```

### Files inside the zone

```tsx figure=FilesInsideTheZone

```

### Adapting to width

```tsx figure=NarrowZone widths="30 14" sweep

```
