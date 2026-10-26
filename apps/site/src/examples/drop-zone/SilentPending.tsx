import { DropZone } from '@envsemble/envui';

const ignore = () => undefined;

export default function SilentPending() {
  return (
    <DropZone
      pending
      label="Drop a logo here, or browse"
      description="PNG, JPG or WebP up to 2 MB"
      onDropAccepted={ignore}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
