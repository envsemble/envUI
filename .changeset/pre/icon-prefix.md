---
'@envsemble/envui': major
---

Every icon's export takes the `Icon` prefix, so no icon shares its name with a component, such as `Link` or `Menu`: `import { IconAdd } from '@envsemble/envui/icons/Add'`. An icon's path stays its name; the numeric icons, whose exports had the prefix already, lose it from their path: `Icon10k` comes from `@envsemble/envui/icons/10k`. `Typography` is `IconTypography`, and `MaterialSymbolProps`, the props every icon takes, is `SymbolIconProps`. See [icons](https://github.com/envsemble/envUI/blob/main/docs/foundations/icons.md).
