import { Slider } from '@envsemble/envui';

export default function RawValue() {
  return (
    <Slider
      label="Opacity"
      min={0}
      max={1}
      step={0.01}
      defaultValue={0.4}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
