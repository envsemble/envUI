---
'@envsemble/envui': patch
---

Radio draws its radio, as Checkbox draws its box, so it answers the pointer as the other choice controls do: unchosen, a ring in a checkbox's edge, `--env-color-fg-muted`, that darkens to the text color, `--env-color-fg-default`, under the pointer and while pressed and stays empty, so it doesn't read as a chosen radio that is unavailable; chosen, the accent disc with a dot in the mark color, which takes the accent's hover and pressed colors. The focus ring is round, as the radio is, rather than square. `--env-radio-selected` colors the chosen disc as it colored the native radio's accent. Under forced colors a chosen radio takes the selection color. RadioGroup's error, `env-radio-group-error`, looks as a field's does, the error icon before the message.
