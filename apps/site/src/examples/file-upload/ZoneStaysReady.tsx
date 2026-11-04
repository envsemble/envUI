import { useEffect, useState } from 'react';
import { Column, DropZone, List, Progress } from '@envsemble/envui';

interface Upload {
  name: string;
  /** The file's size and how much of it has been sent, in MB. */
  size: number;
  sent: number;
}

const megabytes = (bytes: number) => Math.max(0.1, Math.round(bytes / 1024 / 102.4) / 10);

export default function ZoneStaysReady() {
  // Shown part way through two uploads.
  const [uploads, setUploads] = useState<Upload[]>([
    { name: 'annual-review.pdf', size: 2.4, sent: 1.5 },
    { name: 'team-photo.jpg', size: 1.1, sent: 0.3 },
  ]);
  // A timer stands in for the uploads, each sending 0.1 MB at a time.
  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setUploads((current) =>
          current.map((upload) => ({
            ...upload,
            sent: Math.min(upload.size, Math.round((upload.sent + 0.1) * 10) / 10),
          })),
        ),
      300,
    );
    return () => window.clearInterval(timer);
  }, []);
  // The zone takes more files while others upload.
  const add = (files: File[]) =>
    setUploads((current) => [
      ...current,
      ...files.map((file) => ({ name: file.name, size: megabytes(file.size), sent: 0 })),
    ]);

  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <DropZone size="sm" multiple label="Add files" onFilesAccepted={add} />
      <List.Root aria-label="Files">
        {uploads.map((upload) => (
          <List.Item
            key={upload.name}
            label={upload.name}
            description={upload.sent < upload.size ? undefined : `${upload.size} MB`}
          >
            {upload.sent < upload.size && (
              <Progress
                label="Uploading"
                value={upload.sent}
                max={upload.size}
                valueText={`${upload.sent} of ${upload.size} MB`}
                aria-valuetext={`${upload.name}, ${upload.sent} of ${upload.size} MB`}
              />
            )}
          </List.Item>
        ))}
      </List.Root>
    </Column>
  );
}
