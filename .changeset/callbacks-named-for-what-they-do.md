---
'@envsemble/envui': minor
---

Callbacks no longer take the name of a DOM event they don't behave like. CopyButton's `onCopy(text)` is `onCopied(text)`, and Composer's `onSubmit(value)` is `onSend(value)`, which pairs with `sendLabel`; A destination of Drawer, Rail and Bar runs `onClick(event)` instead of `onSelect()`, as BreadcrumbsItem does, and Menu.Item's `onClick` receives the event too.
