import { Column, DropZone } from '@envsemble/envui';

const ignore = () => undefined;

export default function Sizes() {
  return (
    // As wide as a form column.
    <Column gap={5} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <DropZone
        label="Drop a logo here, or browse"
        description="PNG, JPG or WebP up to 2 MB"
        accept="image/png,image/jpeg,.webp"
        onDropAccepted={ignore}
      />
      <DropZone
        size="sm"
        multiple
        label="Attach documents"
        description="Any file, several at once"
        onDropAccepted={ignore}
      />
    </Column>
  );
}
