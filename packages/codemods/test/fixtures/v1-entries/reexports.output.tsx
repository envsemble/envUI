import { ColorSwatch, ColorPicker } from "@envsemble/envui/color";
export type { ColorSwatchProps } from "@envsemble/envui/color";
export { Text } from "@envsemble/envui";
export { ColorPicker as Picker } from "@envsemble/envui/color";

export function Accent() {
  return <ColorPicker label="Accent" />;
}
