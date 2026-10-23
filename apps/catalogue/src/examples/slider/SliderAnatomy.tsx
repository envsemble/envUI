import { Slider } from '@envsemble/envui';

export default function SliderAnatomy() {
  return (
    <Slider
      label="Opacity"
      description="Applies to the selected layer."
      defaultValue={40}
      formatValue={(value) => `${value}%`}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    />
  );
}
