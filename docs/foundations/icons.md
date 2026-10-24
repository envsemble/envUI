---
components:
  - Icon
aliases:
  - icon
  - Material Symbols
  - symbol
  - logo
---

# Icons

## React usage

```tsx
import { Column, Icon } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

<Column gap={4}>
  <Home filled label="Home" />
  <Icon viewBox="0 0 24 24" label="Custom mark">
    <path d="M12 2 22 12 12 22 2 12Z" />
  </Icon>
</Column>;
```

### Props & contracts

| Name         | Contract                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Symbols      | Material Symbols Rounded, bundled and imported one by one from `@envsemble/envui/icons/<Name>` |
| `filled`     | The filled form of a standalone symbol; navigation and tabs fill the selected one themselves   |
| `label`      | The accessible name of a meaningful standalone icon; leave it out for decoration               |
| Custom icons | Controls take any React icon; `Icon` gives an SVG of your own the shared defaults              |

## The words people use

The Site's Icons page shows how icons follow their text, their two forms and every icon, and teaches these phrases. Each maps to one change here:

| Words on the Site                 | What it means in code                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Icons follow their text           | Nothing to do: a symbol takes `currentColor` and the size its control or text gives it             |
| An icon button                    | IconButton with the icon and an `aria-label`                                                       |
| An icon before the label          | `startIcon` on Button or a field, `icon` on a menu item                                            |
| A filled icon                     | `filled` on the symbol; navigation and tabs fill the selected one themselves                       |
| A name when it stands alone       | `label` on a meaningful standalone symbol; without it the icon is hidden from assistive technology |
| Our own logo                      | The application's own SVG in `Icon`, which gives it the shared defaults and the text color         |
| The icon's name, such as Settings | Its import, `@envsemble/envui/icons/Settings`                                                      |

## Guidelines

- Copy an icon's import from the list on the Site's Icons page. Import each icon by its subpath, never from the `@envsemble/envui/icons` barrel, which makes the bundler read every icon.
- Icons take the color of their text. Decorative icons stay hidden from assistive technology; icon-only controls need an accessible name.
- envUI ships no logos: draw the application's own with `Icon` where it should follow the text color.

The symbols are Material Design's [Material Symbols](https://m3.material.io/styles/icons), in their Rounded style, under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0); the package carries the license and its notice.

TypeScript declarations provide the complete public API.

## Related topics

- [Button](../components/button.md)
- [Drawer](../components/drawer.md)
- [Tabs](../components/tabs.md)
- [Accessibility](../foundations/accessibility.md)
