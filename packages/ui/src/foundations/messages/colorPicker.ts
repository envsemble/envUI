/**
 * The English defaults of the `colorPicker` messages: ColorPicker, ColorPickerButton and
 * ColorSwatch, from `@envsemble/envui/color`. EnvUIProvider's `messages.colorPicker` overrides any
 * of them. The names of the channels, the color area and its value, and the names of colors come
 * from React Aria in the provider's locale.
 */
export const colorPicker = {
  /** Names the format select. */
  format: 'Color format',
  /** The hexadecimal format, in the format select. */
  hex: 'Hex',
  /** The RGB format, in the format select. */
  rgb: 'RGB',
  /** The HSL format, in the format select. */
  hsl: 'HSL',
  /** Names the hexadecimal field. */
  hexField: 'Hex',
  /** Names the copy button. */
  copy: 'Copy color',
  /** Names the eyedropper button. */
  eyeDropper: 'Pick a color from the screen',
  /** Names the list of preset colors. */
  swatches: 'Swatches',
  /** Names ColorPickerButton after the picker's label and the color, such as Accent, #6750A4. */
  button: ({ label, value }: { label: string; value: string }) => `${label}, ${value}`,
};

export type ColorPickerMessages = typeof colorPicker;
