import { Column, DropZone } from '@envsemble/envui';

const take = () => undefined;

export default function ZoneBusyWhileUploading() {
  return (
    // Shown part way through two uploads, with the zone closed until both are done.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <DropZone
        size="sm"
        multiple
        pending
        label="Uploading 2 files"
        description="This takes a moment"
        onDropAccepted={take}
      />
    </Column>
  );
}
