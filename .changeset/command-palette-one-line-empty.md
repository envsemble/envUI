---
'@envsemble/envui': patch
---

CommandPalette's empty state is one muted line at an option's height, its title and then its description after a dot, rather than an icon on a muted circle over a centred title, so the palette keeps about its height as results come and go. It shows an icon, at the start of the line where an option's sits, only when `emptyIcon` gives one; the Search and SearchOff icons it showed by default are gone. While results load, a small spinner turns at the search field's end, whether or not results already show, rather than in place of the search icon or the empty state's icon.
