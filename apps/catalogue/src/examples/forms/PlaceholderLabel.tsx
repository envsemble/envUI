import { TextField } from '@envsemble/envui';

export default function PlaceholderLabel() {
  return (
    // The placeholder is the only label: it goes as people type, and with it the format.
    <TextField
      aria-label="Start date"
      placeholder="Start date, such as 14 May 2026"
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
