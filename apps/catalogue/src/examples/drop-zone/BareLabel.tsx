import { DropZone } from '@envsemble/envui';

const ignore = () => undefined;

export default function BareLabel() {
  return (
    <DropZone
      label="Upload"
      accept="image/png,image/jpeg,.webp"
      onDropAccepted={ignore}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
