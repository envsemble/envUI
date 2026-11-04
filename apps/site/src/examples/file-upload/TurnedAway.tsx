import { useRef, useState } from 'react';
import { Column, DropZone, List } from '@envsemble/envui';

const limit = 10 * 1024 * 1024;

export default function TurnedAway() {
  const [taken, setTaken] = useState(['team-photo.jpg']);
  const [error, setError] = useState<string>();
  // A drop of both kinds reports the files turned away first, then the files taken.
  const refused = useRef<string>(undefined);

  return (
    // As wide as a form column.
    <Column gap={4} style={{ inlineSize: 'min(100%, 26rem)' }}>
      <DropZone
        multiple
        label="Add documents"
        description="PDF or images, up to 10 MB each"
        accept="application/pdf,.pdf,image/*"
        error={error}
        onFilesRejected={(files) => {
          refused.current = `${files[0].name} isn't a PDF or an image.`;
          setError(refused.current);
          queueMicrotask(() => (refused.current = undefined));
        }}
        onFilesAccepted={(files) => {
          const tooLarge = files.find((file) => file.size > limit);
          setError(tooLarge ? `${tooLarge.name} is larger than 10 MB.` : refused.current);
          const fit = files.filter((file) => file.size <= limit).map((file) => file.name);
          setTaken((current) => [...current, ...fit]);
        }}
      />
      <List.Root aria-label="Documents">
        {taken.map((name, index) => (
          <List.Item key={`${index}-${name}`} label={name} />
        ))}
      </List.Root>
    </Column>
  );
}
