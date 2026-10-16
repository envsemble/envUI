import { CopyButton, Stack, TextField } from '@envsemble/envui';

const shareLink = 'https://example.com/r/quarterly-report';

export default function CopyValue() {
  return (
    <Stack align="start">
      {/* The field takes the room the button leaves. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: '0.5rem',
          inlineSize: 'min(100%, 28rem)',
        }}
      >
        <TextField label="Share link" value={shareLink} readOnly />
        <CopyButton value={shareLink} aria-label="Copy link" />
      </div>
      <CopyButton value="RPT-2041" variant="outline">
        Copy ID
      </CopyButton>
    </Stack>
  );
}
