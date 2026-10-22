---
'@envsemble/envui': minor
---

Text that shows more on hover or focus takes a quiet dotted underline. A HoverCard's or Tooltip's trigger that is text, an inline text element such as a span, abbr or time, or Text, holding text, gets `env-hover-detail`: a dotted underline in the muted text color, 0.25em below the text, with the page's own cursor, and in forced colors the text color. Buttons, icon buttons, links, avatars and other triggers keep their own look. An application's own text component can take the class to match. RelativeTime's time, which shows the full date in a tooltip, takes it too.

A HoverCard whose trigger is text without `tabIndex` warns in the console while developing, since keyboard focus can't reach it. Text that a server component renders, which reaches a HoverCard or Tooltip as its `p` with the `env-text` class, takes the underline too.
