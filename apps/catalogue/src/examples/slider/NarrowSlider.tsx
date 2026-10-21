import { Slider } from '@envsemble/envui';

export default function NarrowSlider() {
  return (
    <Slider
      label="Notification volume"
      defaultValue={60}
      formatValue={(value) => `${value}% of the system volume`}
    />
  );
}
