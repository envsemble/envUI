import * as ui from '@envsemble/envui';

export function Accent(props: ui.ColorPickerProps) {
  return (
    <ui.Row gap={2}>
      <ui.ColorPicker {...props}></ui.ColorPicker>
      <ui.Button>Apply</ui.Button>
    </ui.Row>
  );
}
export const Swatch = ui.ColorSwatch;
