import { MonthPicker } from '@envsemble/envui';

export default function MonthPickerAnatomy() {
  return (
    <MonthPicker
      label="Report month"
      description="The month the report covers."
      defaultValue="2026-10"
      clearable
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
