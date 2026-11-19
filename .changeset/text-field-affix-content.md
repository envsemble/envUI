---
'@envsemble/envui': minor
---

TextField and SearchField: `prefix` and `suffix` take any content again, as in 1.x, such as a currency's icon beside its code or a small Avatar before the value, at its own size; the field still cuts them short with an ellipsis, and reads their text after the label. The type widens from `string` to `ReactNode`: code that reads them back as strings needs a check that they are. See [TextField](https://github.com/envsemble/envUI/blob/main/docs/components/text-field.md).
