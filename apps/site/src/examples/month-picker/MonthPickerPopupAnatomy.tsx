import { MonthPicker } from '@envsemble/envui';

export default function MonthPickerPopupAnatomy() {
  // Shown open in the docs; without defaultOpen, the months open from the field.
  return (
    <MonthPicker
      label="Report month"
      variant="floating"
      defaultValue="2026-10"
      defaultOpen
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
