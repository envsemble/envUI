---
'@envsemble/envui': minor
---

ToastProvider: a notification's `message` takes content, such as the name of what changed in bold or a link to it, with its plain `text` for the native title and the announcement; `icon` replaces the tone's icon, such as with an Avatar for a mention, or `null` shows none. An action takes `href`, which makes it a link through the LinkProvider, and `actions` offers two, such as Undo and View, the main one last; more than two throw a RangeError. See [Toast](https://github.com/envsemble/envUI/blob/main/docs/components/toast.md).
