import { useEffect, useState } from 'react';
import { Button, Column, DropZone, List, Progress } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/*
 * A photo dragged in from the desktop and dropped: it uploads, and once it is up, it is removed
 * again, leaving the files as they began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { carry: 'team-photo.jpg', as: 'image/jpeg' },
  { to: '.env-drop-zone-target', x: 0.85, y: 0.8 },
  { to: '.env-drop-zone-target', x: 0.5, y: 0.5, duration: 500 },
  { wait: 300 },
  { drop: true },
  { wait: 200 },
  // The hand moves off the zone while the photo goes up, and comes back to remove it.
  { leave: true },
  { wait: 2400 },
  { to: '[aria-label="Remove team-photo.jpg"]' },
  { wait: 700 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** How much of the photo has gone up, in MB, of 1.1. */
const size = 1.1;

/** Adding files: a drop zone over the files added, one uploading as it goes up. */
export default function FileUploadTile() {
  const [uploaded, setUploaded] = useState<number | null>(null);
  usePointer(script);
  const uploading = uploaded !== null && uploaded < size;
  useEffect(() => {
    if (!uploading) return;
    const timer = setTimeout(() => setUploaded((done) => Math.min(size, (done ?? 0) + 0.1)), 150);
    return () => clearTimeout(timer);
  }, [uploading, uploaded]);
  return (
    <Column gap={3} style={{ inlineSize: '16rem' }}>
      <DropZone size="sm" multiple label="Add files" onFilesAccepted={() => setUploaded(0)} />
      <List.Root aria-label="Files">
        <List.Item label="annual-review.pdf" description="2.4 MB" />
        {uploaded !== null && (
          <List.Item
            label="team-photo.jpg"
            description={uploading ? undefined : '1.1 MB'}
            action={
              <Button
                variant="text"
                aria-label="Remove team-photo.jpg"
                onClick={() => setUploaded(null)}
              >
                Remove
              </Button>
            }
          >
            {uploading && (
              <Progress
                label="Uploading"
                value={uploaded}
                max={size}
                valueText={`${uploaded.toFixed(1)} of ${size} MB`}
              />
            )}
          </List.Item>
        )}
      </List.Root>
    </Column>
  );
}
