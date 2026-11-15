import { MonthPicker } from '@envsemble/envui';

export default function MonthPickerPopupAnatomy() {
  return (
    <MonthPicker
      label="Report month"
      defaultValue="2026-10"
      defaultOpen
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
