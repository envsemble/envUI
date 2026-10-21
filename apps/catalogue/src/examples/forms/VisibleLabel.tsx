import { TextField } from '@envsemble/envui';

export default function VisibleLabel() {
  return (
    // The label and the format stay in view while people type.
    <TextField
      label="Start date"
      description="For example, 14 May 2026."
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
