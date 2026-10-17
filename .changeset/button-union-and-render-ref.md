---
'@envsemble/envui': minor
---

A Button `variant` typed as a union of variants, such as `variant={pressed ? 'primary' : 'secondary'}` or a prop typed `'primary' | 'secondary'`, type-checks with the tones every variant in it takes, on Button, IconButton, ConfirmButton, CopyButton and the buttons built on them; a pair outside the designed ones, such as a secondary danger button, still fails. The `ref` of Surface, Stack and Text is a `Ref<HTMLElement>`, since `render` can make them any element: a ref to the section that `render={<section />}` makes type-checks, as a ref to a div still does.
