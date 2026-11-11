import { CopyButton, Column, Grid, TextField } from '@envsemble/envui';

const shareLink = 'https://example.com/r/quarterly-report';

export default function CopyValue() {
  return (
    <Column gap={4} align="start">
      <CopyButton value="RPT-2041" variant="outline">
        Copy ID
      </CopyButton>
      {/* The field takes the room the button leaves. */}
      <Grid
        columns="minmax(0, 1fr) auto"
        align="center"
        gap={2}
        style={{ inlineSize: 'min(100%, 28rem)' }}
      >
        <TextField label="Share link" value={shareLink} readOnly />
        <CopyButton value={shareLink} aria-label="Copy link" />
      </Grid>
    </Column>
  );
}
