---
'@envsemble/envui': major
---

ToastProvider: a notification's actions are one list, `actions`, such as Undo, or Undo and View, in the order given with the main one last, wrapping when they don't fit. See [Toast](https://github.com/envsemble/envUI/blob/main/docs/components/toast.md).

Breaking changes:

- A notification's single `action` is removed. Write `actions: [{ label: 'Undo', onClick: undo }]` instead of `action: { label: 'Undo', onClick: undo }`.
- `ToastAction` is a union instead of an interface: a button with `onClick`, or a link with `href` and an optional `onClick`. An interface that extends it writes a type alias with an intersection instead.
