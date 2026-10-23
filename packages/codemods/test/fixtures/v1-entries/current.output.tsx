// Code already on 1.0's entry points, and other libraries' ColorPickers, stay as they are.
import { Button } from '@envsemble/envui';
import { ColorPicker } from '@envsemble/envui/color';
import { ColorSwatch } from 'some-other-color-library';

export function Accent() {
  return (
    <>
      <ColorPicker label="Accent" />
      <ColorSwatch color="#6750a4" />
      <Button>Apply</Button>
    </>
  );
}
