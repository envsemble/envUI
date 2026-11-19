---
'@envsemble/stylelint-config-envui': minor
---

`no-off-scale-values` checks spacing only: `inset*` is a position, so an absolutely placed element can sit at the offset its geometry needs, such as `inset-block-start: 3.5rem`, and a hairline of 1px or less passes, such as `margin: -1px` to overlap borders. `no-px` passes a position offset of 1px or less in `inset*`, `top`, `right`, `bottom` or `left`, and still asks for rem beyond that. See [no-off-scale-values](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config#envuino-off-scale-values).
