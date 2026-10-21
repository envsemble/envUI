import { Slider } from '@envsemble/envui';

export default function FormattedValue() {
  return (
    <Slider
      label="Opacity"
      defaultValue={40}
      formatValue={(value) => `${value}%`}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
