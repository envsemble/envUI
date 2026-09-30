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

`Typography` is an envsemble alias for the official `text_fields` symbol.
Numeric leading upstream names receive an `Icon` prefix in their React export,
for example `10k` becomes `Icon10k`. Other snake case names become PascalCase.

Generation uses verified local files and requires no network.
Maintainers deliberately run `node scripts/SyncIcons.mjs --revision <full SHA>`
from the repository root to update the pinned official source, then run
`node scripts/GenerateIcons.mjs`. A sync without `--revision` restores the existing
pin. No install lifecycle script downloads or selects a floating catalogue.

## Inter

The bundled Inter font comes from the existing envsemble design-system assets.
Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter).
Licensed under the SIL Open Font License, Version 1.1. The complete license is
included in `licenses/Inter-LICENSE.txt`.

## Base UI

The library uses Base UI React from the [MUI Base UI project](https://github.com/mui/base-ui)
as its interaction foundation. Copyright (c) 2019 Material-UI SAS. Licensed under the
MIT license. The complete license is included in `licenses/Base-UI-LICENSE.txt`.
The package's dependency and lockfile record the installed version.

## envsemble brand

`BrandLogo` and `src/assets/brand/envsemble-lockup-black.svg` reproduce the
existing official envsemble lockup. The React wrapper changes its monochrome
paint to `currentColor` so it follows the containing theme. This brand artwork
belongs to envsemble and is not covered by Google's or Inter's licenses.
