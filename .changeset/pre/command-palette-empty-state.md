---
'@envsemble/envui': minor
---

CommandPalette shows an empty state in place of the list when there are no options: a quiet icon on a muted circle, a title and a quieter description, centred, which the polite status announces with the icon hidden from assistive technology. Before people type it invites a search, with the Search icon and Type to search (`messages.commandPalette.emptyQuery`); when the text finds nothing it shows SearchOff, No results (`messages.commandPalette.empty`) and `messages.commandPalette.emptyHint`, which quotes the text and suggests checking the spelling. `emptyLabel` still sets the title, and the new `emptyDescription` and `emptyIcon` set the description and the icon, `null` hiding either. The new `defaultItems` show while the search field is empty, in place of `items`, such as recent documents or suggestions under a group heading, and are highlighted and chosen like any result; the empty state shows only when there are none.
