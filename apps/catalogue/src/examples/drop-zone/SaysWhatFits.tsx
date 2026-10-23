import { DropZone } from '@envsemble/envui';

const ignore = () => undefined;

export default function SaysWhatFits() {
  return (
    <DropZone
      label="Drop a logo here, or browse"
      description="PNG, JPG or WebP up to 2 MB"
      accept="image/png,image/jpeg,.webp"
      onDropAccepted={ignore}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
