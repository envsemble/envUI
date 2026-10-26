import { Slider } from '@envsemble/envui';

export default function UsefulSteps() {
  return (
    <Slider
      label="Sign out after"
      description="From 5 to 120 minutes, in steps of 5."
      min={5}
      max={120}
      step={5}
      defaultValue={30}
      formatValue={(value) => `${value} min`}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
