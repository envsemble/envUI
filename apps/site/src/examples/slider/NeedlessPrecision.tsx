import { Slider } from '@envsemble/envui';

export default function NeedlessPrecision() {
  return (
    <Slider
      label="Sign out after"
      min={1}
      max={1440}
      defaultValue={437}
      formatValue={(value) => `${value} min`}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
