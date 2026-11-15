import { DatePicker } from '@envsemble/envui';

export default function DatePickerPopupAnatomy() {
  return (
    <DatePicker
      label="Publish on"
      defaultValue="2026-10-20"
      defaultOpen
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
