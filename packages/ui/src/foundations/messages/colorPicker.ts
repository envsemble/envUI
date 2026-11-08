/**
 * The English defaults of the `colorPicker` messages: ColorPicker, ColorPickerButton and
 * ColorSwatch, from `@envsemble/envui/color`. EnvUIProvider's `messages.colorPicker` overrides any
 * of them. The names of the channels, the color area and its value, and the names of colors come
 * from React Aria in the provider's locale.
 */
export const colorPicker = {
  /** Names the menu of formats. */
  format: 'Color format',
  /** Names the button that opens the menu of formats, with the format it shows, such as Hex. */
  formatButton: ({ format }: { format: string }) => `Color format: ${format}`,
  /** The hexadecimal format, in the format select and before its field. */
  hex: 'Hex',
  /** The RGB format, in the format select and before its fields. */
  rgb: 'RGB',
  /** The HSL format, in the format select and before its fields. */
  hsl: 'HSL',
  /** Names the hexadecimal field. */
  hexField: 'Hex',
  /** The letter beside the red channel's number. */
  redShort: 'R',
  /** The letter beside the green channel's number. */
  greenShort: 'G',
  /** The letter beside the blue channel's number. */
  blueShort: 'B',
  /** The letter beside the hue's number. */
  hueShort: 'H',
  /** The letter beside the saturation's number. */
  saturationShort: 'S',
  /** The letter beside the lightness's number. */
  lightnessShort: 'L',
  /** The letter beside the alpha's number. */
  alphaShort: 'A',
  /** Names the copy button. */
  copy: 'Copy color',
  /** Names the copy button of one format where several show together, such as Copy color as RGB. */
  copyFormat: ({ format }: { format: string }) => `Copy color as ${format}`,
  /** Names the eyedropper button. */
  eyeDropper: 'Pick a color from the screen',
  /** Names the list of preset colors. */
  swatches: 'Swatches',
  /** Names ColorPickerButton after the picker's label and the color, such as Accent, #6750A4. */
  button: ({ label, value }: { label: string; value: string }) => `${label}, ${value}`,
};
