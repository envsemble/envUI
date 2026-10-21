import { MonthPicker } from '@envsemble/envui';

export default function GenericLabel() {
  return (
    <MonthPicker label="Month" defaultValue="2026-10" style={{ inlineSize: 'min(100%, 16rem)' }} />
  );
}
