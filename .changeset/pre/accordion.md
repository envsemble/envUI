---
'@envsemble/envui': minor
---

Accordion, a list of sections on Base UI's Accordion: `Accordion.Root` holds `Accordion.Item`s, each a heading that shows and hides its panel, separated by hairlines across the full width, a line under every item. A plus at the start of each heading is a minus while its section is open, the title is in medium weight, and the panel is muted text lined up with the title. One item is open at a time, or several with `multiple`; `value`, `defaultValue` and `onValueChange` control it, `headingLevel` sets the headings' level, `hiddenUntilFound` lets find in page open a closed panel, and `skeleton` shows it as a skeleton. Disclosure stays for one optional detail; its page now points a list of questions to Accordion.
