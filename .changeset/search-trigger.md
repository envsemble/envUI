---
'@envsemble/envui': minor
---

SearchTrigger, the button that opens search or a command palette. It reads like a search field, with the search icon, its `label` ("Search" by default, from `messages.searchTrigger.label`) and the shortcut's keys at the end, or shows only its icon with the label and keys in a tooltip (`iconOnly`, automatic in a sidebar showing icons only). Its `shortcut`, `mod+k` by default, is ⌘K on Apple platforms and Ctrl+K elsewhere: the trigger shows it, announces it with `aria-keyshortcuts` and presses itself when it is pressed anywhere in the window, so `onClick` is the one place the application opens search. With several triggers for one shortcut, the most recently mounted visible one takes it; `listen={false}` keeps a trigger from listening, and a key something else already handled, such as an editor's own, is left alone.
