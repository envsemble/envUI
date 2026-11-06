import { useEffect, useState } from 'react';
import { Button, Column, DropZone, List, Progress, Surface } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';
import { outlined } from './Outline';

/*
 * A photo removed from the files and dragged in again from the desktop: dropped, it uploads,
 * leaving the files as they began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '[aria-label="Remove team-photo.jpg"]', duration: 600 },
  { wait: 700 },
  { click: true },
  { wait: 300 },
  // Off to the desktop for the photo, and back with it.
  { leave: true },
  { wait: 500 },
  { carry: 'team-photo.jpg', as: 'image/jpeg' },
  { to: '.env-drop-zone-target', x: 0.85, y: 0.8 },
  { to: '.env-drop-zone-target', x: 0.5, y: 0.5, duration: 500 },
  { wait: 300 },
  { drop: true },
  { wait: 200 },
  // The hand moves off the zone while the photo goes up, about two seconds, and the files rest
  // as they began for about three more, so the upload is seen to finish before the loop.
  { leave: true },
  { wait: 5800 },
];

/** How much of the photo has gone up, in MB, of 1.1. */
const size = 1.1;

/**
 * Adding files: a drop zone over the files added, each with its Remove action, one uploading as it
 * goes up.
 */
export default function FileUploadTile() {
  const [report, setReport] = useState(true);
  const [uploaded, setUploaded] = useState<number | null>(size);
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
      <Surface background="muted" padding={1} radius="sm" style={outlined}>
        <List.Root aria-label="Files">
          {report && (
            <List.Item
              label="annual-review.pdf"
              description="2.4 MB"
              end={
                <Button
                  variant="text"
                  aria-label="Remove annual-review.pdf"
                  onClick={() => setReport(false)}
                >
                  Remove
                </Button>
              }
            />
          )}
          {uploaded !== null && (
            <List.Item
              label="team-photo.jpg"
              description={uploading ? undefined : '1.1 MB'}
              end={
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
      </Surface>
    </Column>
  );
}
