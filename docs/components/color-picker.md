# Color picker

## React usage

```tsx
import { ColorPicker } from '@envsemble/envui';

<ColorPicker label="Accent color" value={color} onValueChange={setColor} />

// Native forms submit the HEX field and reset uncontrolled values.
<ColorPicker label="Project color" name="accent" defaultValue="#6750a4" />
```

### Props & contracts

| Name                   | Contract                                                                    |
| ---------------------- | --------------------------------------------------------------------------- |
| label                  | Required visible color name; also names the picker group and HEX field      |
| value / defaultValue   | Controlled or initial opaque six-digit HEX color; default #000000           |
| onValueChange          | Receives valid colors normalized to lowercase #rrggbb                       |
| disabled / readOnly    | Prevent color-area and hue edits; the read-only HEX field remains focusable |
| hint / error / variant | Shared Input guidance, validation and field appearance                      |
| Native input props     | name, form, required, ref and accessible attributes for the HEX field       |
| className / style      | Optional layout class and style on the picker root                          |

## Guidelines

- Use for opaque colors. Supply six hexadecimal digits, optionally prefixed by #. Short HEX, alpha and other color formats are outside this API.
- The color area supports pointer interaction and <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; the hue slider supports pointer interaction and <kbd>←</kbd> <kbd>→</kbd>. They use the theme’s visible focus ring; the HEX field uses the shared Input geometry and validation.
- Partial or invalid HEX drafts do not call onValueChange. Recovery text is linked to the field and announced; leaving an invalid draft restores the previous valid color. Valid input is normalized to lowercase #rrggbb.
- Applications own the selected color and its meaning. Palette tokens, theme customization, persistence and dialogs belong to the consumer.
- Uncontrolled native form reset restores defaultValue without emitting onValueChange. Controlled reset retains value; the application resets its own state. Canceling the reset event preserves the draft.
- Disabled pickers cannot be edited or focused and are excluded from native form submission. Read-only pickers prevent edits while retaining a focusable, copyable HEX field.

## Color swatch

```tsx
import { Button, ColorPicker, ColorSwatch, Popover } from '@envsemble/envui';

<Popover
  trigger={
    <Button variant="secondary" startIcon={<ColorSwatch color={color} />}>
      {color.toUpperCase()}
    </Button>
  }
>
  <ColorPicker label="Accent color" value={color} onValueChange={setColor} />
</Popover>;
```

| Name              | Contract                                           |
| ----------------- | -------------------------------------------------- |
| color             | The color it shows, in any CSS color format        |
| Native span props | className, style, ref and attributes on the swatch |

- ColorSwatch is a round sample of a color with a hairline ring, so white and black samples stay visible on every surface. It is decorative and hidden from assistive technology: name or write the color beside it, such as its HEX value.
- As a Button's start icon it takes the icon's size, as on a button that opens a ColorPicker in a Popover; elsewhere it is 1 rem.

TypeScript declarations provide the complete public API.

## Related topics

- [Text fields](../components/fields.md)
- [Colors & themes](../foundations/colors.md)
- [Accessibility](../foundations/accessibility.md)
