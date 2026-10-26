import { DropZone } from '@envsemble/envui';

const ignore = () => undefined;

export default function NarrowZone() {
  return (
    <DropZone
      size="sm"
      multiple
      label="Attach documents"
      description="Any file, several at once, up to 25 MB each"
      onDropAccepted={ignore}
    />
  );
}
