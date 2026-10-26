import { DropZone } from '@envsemble/envui';

const ignore = () => undefined;

export default function SaysWhatIsHappening() {
  return (
    <DropZone
      pending
      label="Uploading the logo"
      description="This takes a moment"
      onDropAccepted={ignore}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
