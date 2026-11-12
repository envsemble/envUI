---
'@envsemble/envui': minor
---

CommandPalette takes `loading` while its results are on their way, such as from a server. With none to show yet, its empty state says `loadingLabel` beside a spinner (Searching… by default, or `messages.commandPalette.loading`). Results already shown stay, marked busy, and the search field's icon turns into a spinner.
