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
Maintainers deliberately run `node scripts/SyncIcons.mjs --revision <full SHA>`
from the repository root to update the pinned official source, then run
`node scripts/GenerateIcons.mjs`. A sync without `--revision` restores the existing
pin. No install lifecycle script downloads or selects a floating catalogue.

## Inter

The bundled Inter font is included locally by envUI.
Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter).
Licensed under the SIL Open Font License, Version 1.1. The complete license is
included in `licenses/Inter-LICENSE.txt`.

## Base UI

The library uses Base UI React from the [MUI Base UI project](https://github.com/mui/base-ui)
as its interaction foundation. Copyright (c) 2019 Material-UI SAS. Licensed under the
MIT license. The complete license is included in `licenses/Base-UI-LICENSE.txt`.
The package's dependency and lockfile record the installed version.

## Markdown and syntax highlighting

Markdown uses [react-markdown](https://github.com/remarkjs/react-markdown) and
[remark-gfm](https://github.com/remarkjs/remark-gfm), licensed under MIT.
Syntax highlighting uses [Shiki](https://github.com/shikijs/shiki), including its
explicit language registrations, JavaScript regular-expression engine, and unmodified
GitHub Light Default and GitHub Dark Default theme registrations. Shiki is licensed under MIT.

`licenses/Runtime-Dependencies-LICENSE.txt` includes the locked runtime dependencies'
copyright and license notices. The build generates this file from installed packages
and embeds the same notices in the offline documentation artifact.

## Brand artwork

The envUI lockup and favicons the README shows are bundled under `dist/assets/envUI`.
This artwork belongs to envsemble and is not covered by Google's or Inter's licenses.
