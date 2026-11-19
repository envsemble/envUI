---
'@envsemble/envui': minor
---

ToastProvider: a notification's `message` takes content, such as the name of what changed in bold or a link to it, with its plain `text` for the native title and the announcement; `icon` replaces the tone's icon, such as with an Avatar for a mention, or `null` shows none. An action takes `href`, which makes it a link through the LinkProvider, and `actions` offers several, such as Undo and View, in the order given with the main one last, wrapping when they don't fit. The type of a notification's `message` widens from `string` to `ReactNode`, and an action's `onClick` becomes optional: notifications an app passes in keep working, and code that reads `message` back as a string, or calls an action's `onClick`, needs a check that it is one, or that it is there. See [Toast](https://github.com/envsemble/envUI/blob/main/docs/components/toast.md).
