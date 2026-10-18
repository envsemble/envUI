---
'@envsemble/envui': minor
---

A Button `variant` typed as a union of variants, such as `variant={pressed ? 'primary' : 'secondary'}` or a prop typed `'primary' | 'secondary'`, type-checks with the tones every variant in it takes, on Button, IconButton, ConfirmButton, CopyButton and the buttons built on them; a pair outside the designed ones, such as a secondary danger button, still fails. Surface, Stack and Text take a ref to the element `render` makes: their ref's element is a type parameter that the ref sets, so `useRef<HTMLElement>(null)` with `render={<section />}` and `useRef<HTMLDivElement>(null)` with `render={<div />}` on Text type-check. `SurfaceProps`, `StackProps` and `TextProps` take the element too, `SurfaceProps<HTMLElement>`, and without it their `ref` stays a ref to the default element, a div or a paragraph, so a wrapper that forwards it to that element still type-checks.
