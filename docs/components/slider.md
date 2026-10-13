# Sliders

## React usage

```tsx
import { Slider } from '@envsemble/envui';

<Slider
  label="Opacity"
  value={opacity}
  onValueChange={setOpacity}
  formatValue={(value) => `${value}%`}
  hint="Applies to the selected layer."
/>

// Native forms submit the value and reset an uncontrolled slider.
<Slider label="Volume" name="volume" defaultValue={30} step={5} />
```

### Props & contracts

| Name                    | Contract                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| label                   | Required visible label and accessible name                                                    |
| value / defaultValue    | Controlled or starting value; min by default                                                  |
| onValueChange           | Receives the value while it changes, by dragging, pressing the track or with the keyboard     |
| onValueCommit           | Receives the value once a change is complete, such as when the thumb is released              |
| min / max / step        | The range, 0 to 100 by default, and the values it can take, 1 apart by default                |
| largeStep               | The change of Page Up, Page Down and an arrow key with Shift; a tenth of the range by default |
| formatValue             | The value as people read and hear it, such as "40%"                                           |
| hint                    | Guidance below the slider, linked to it                                                       |
| disabled                | The slider cannot be moved or focused and is left out of form submission                      |
| name / form             | Submit the value with a native form                                                           |
| inputRef                | The native range input, for example to focus it                                               |
| className / style / ref | The slider's root element                                                                     |

## Guidelines

- Use a slider for a value people adjust by eye within a known range, such as opacity or volume. Use an Input with type="number" when people know the exact number they want.
- The label and the current value sit above the track. The value is an output linked to the slider; formatValue formats both what people read and what assistive technology announces.
- <kbd>←</kbd> and <kbd>→</kbd>, or <kbd>↓</kbd> and <kbd>↑</kbd>, move by one step; <kbd>Page Up</kbd> and <kbd>Page Down</kbd>, or <kbd>Shift</kbd> with an arrow key, by a large step; <kbd>Home</kbd> and <kbd>End</kbd> go to the ends of the range. Pressing the track moves the thumb there, and pressing the label focuses the slider.
- The indicator and the thumb take the control blue, at least 3:1 against the canvas in both themes; the rest of the track is the translucent fill. The thumb shows a halo under the pointer and while it is dragged, and the focus ring with keyboard focus. On touch screens the slider's row is 2.75 rem tall and the thumb larger.
- onValueChange fires continuously while the thumb moves. Use onValueCommit for work that should run once per change, such as saving.
- Native forms submit the value under name and reset an uncontrolled slider to defaultValue. A controlled slider keeps its value; the application resets its own state.

TypeScript declarations provide the complete public API.

## Related topics

- [Meters & progress](../components/meters.md)
- [Text fields](../components/fields.md)
- [Accessibility](../foundations/accessibility.md)
