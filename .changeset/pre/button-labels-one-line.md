---
'@envsemble/envui': patch
---

A Button's label keeps to one line and the button to its label's width, so a row short of room wraps whole buttons instead of breaking a label such as Add filter over two lines: give such a row `wrap`. A `fullWidth` button and the buttons of a ButtonGroup, which can't move to a line of their own, still wrap their labels. See [Button](https://github.com/envsemble/envUI/blob/main/docs/components/button.md#adapting-to-width).
