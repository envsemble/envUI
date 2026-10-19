import { Slider } from '@envsemble/envui';

export default function ManagedLimit() {
  return (
    // As wide as a form column.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Slider
        label="Storage per member"
        description="Sam Lee, your administrator, sets this limit for everyone at Northwind."
        min={5}
        max={100}
        step={5}
        defaultValue={20}
        formatValue={(value) => `${value} GB`}
        disabled
      />
    </div>
  );
}
