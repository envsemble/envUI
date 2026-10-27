# Third-party notices

## Material Symbols

The individual Rounded React icon modules contain Google Material Symbols SVG
geometry from the official [google/material-design-icons repository](https://github.com/google/material-design-icons).
Copyright Google LLC. Licensed under the Apache License, Version 2.0; the complete
license is included in `licenses/Material-Symbols-LICENSE.txt`.

The selected assets use Rounded, weight 400, grade 0, optical size 24, fill 0
and fill 1. `icon-manifest.json` records the exact pinned upstream revision,
complete catalogue, upstream paths, source SHA-256 hashes, Git blob hashes, and
the upstream catalogue tree hash. Source SVGs are retained unchanged in the
repository at `src/assets/material-symbols-rounded`; generated adapters add React props,
relative dimensions, accessible SVG defaults, and `currentColor`.

`Typography` is an envUI alias for the official `text_fields` symbol.
Numeric leading upstream names receive an `Icon` prefix in their React export,
for example `10k` becomes `Icon10k`. Other snake case names become PascalCase.

Generation uses verified local files and requires no network.
Maintainers deliberately run `node scripts/build/SyncIcons.ts --revision <full SHA>`
from the repository root to update the pinned official source, then run
`node scripts/build/GenerateIcons.ts`. A sync without `--revision` restores the existing
pin. No install lifecycle script downloads or selects a floating catalogue.

## Geist

The bundled Geist font is included locally by envUI.
Copyright (c) 2023 Vercel, in collaboration with basement.studio (https://github.com/vercel/geist-font).
Licensed under the SIL Open Font License, Version 1.1. The complete license is
included in `licenses/Geist-LICENSE.txt`. The bundled file is Geist 1.802's
variable face, subset to Latin, Latin-1 and Latin Extended-A with the weight
axis limited to 400 to 700; it keeps the name Geist.

## Base UI

The library uses Base UI React from the [MUI Base UI project](https://github.com/mui/base-ui)
as its interaction foundation. Copyright (c) 2019 Material-UI SAS. Licensed under the
MIT license. The complete license is included in `licenses/Base-UI-LICENSE.txt`.
The package's dependency and lockfile record the installed version.

## Markdown and syntax highlighting

Markdown uses [react-markdown](https://github.com/remarkjs/react-markdown) and
[remark-gfm](https://github.com/remarkjs/remark-gfm), licensed under MIT.
Syntax highlighting uses [Shiki](https://github.com/shikijs/shiki), including its
explicit language registrations, JavaScript regular-expression engine, and the GitHub Light
Default, GitHub Dark Dimmed, GitHub Light High Contrast and GitHub Dark High Contrast theme
registrations, from GitHub's VS Code theme, with token colors that fall short of envUI's contrast
targets made readable where they load. Shiki and the GitHub themes are licensed under MIT.

`licenses/Runtime-Dependencies-LICENSE.txt` includes the locked runtime dependencies'
copyright and license notices. The build generates this file from installed packages
and the hosted documentation site serves the same notices.
