---
'@envsemble/envui': major
---

InfoChip is a Badge, and Badge's `subtle` variant is `soft`.

- `<InfoChip>` is `<Badge>`, a neutral soft pill: it is slightly larger, at medium weight, fully rounded and on one line. Its page joins Badge's, which shows neutral metadata, and the search finds Badge by chip, info chip, tag and metadata.
- `variant="subtle"`, the default, is `soft`.
- A badge, counter badge or diff stat inside a control takes its colors from custom properties the control sets on its own element: `--env-badge-fg`, `-bg` and `-border` (a border shorthand), `--env-counter-badge-*` and `--env-diff-stat-*`. Button sets them, as it styled the badges inside it before.
- DiffStat writes its numbers in the locale, and its name comes from `messages.diffStat.label`, which receives the counts as numbers and in the locale's digits; `formatLabel` still overrides it.

Migrate with the codemods: `envui-codemods v1-names` renames InfoChip and InfoChipProps, `v1-props` drops `variant="subtle"`, and `v1-classes` renames `env-info-chip`.
