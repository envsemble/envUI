---
components:
  - Icon
aliases:
  - icon
  - Material Symbols
  - symbol
  - logo
  - BrandLogo
  - EnvUILogo
---

# Icons & assets

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

## Guidelines

- Copy an icon's import from the list in the preview. Import each icon by its subpath, never from the `@envsemble/envui/icons` barrel, which makes the bundler read every icon.
- Icons take the color of their text. Decorative icons stay hidden from assistive technology; icon-only controls need an accessible name.
- envUI ships no logos: draw the application's own with `Icon` where it should follow the text color.

The symbols are Material Design's [Material Symbols](https://m3.material.io/styles/icons), in their Rounded style, under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0); the package carries the license and its notice.

TypeScript declarations provide the complete public API.

## Related topics

- [Button](../components/button.md)
- [Drawer](../components/drawer.md)
- [Tabs](../components/tabs.md)
- [Accessibility](../foundations/accessibility.md)
