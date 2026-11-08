import { useEffect, useState } from 'react';
import { Button, Column, DropZone, List, Progress, Surface } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import type { TileWindow } from './Tiles';

/*
 * Removes a photo from the files and drags it in again, its file chip beside the pointer. Dropped,
 * it uploads, leaving the files as they began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '[aria-label="Remove team-photo.jpg"]', duration: 600 },
  { wait: 700 },
  { click: true },
  { wait: 600 },
  // Picks the photo up again where it was, its chip beside the pointer, and carries it over the
  // zone, which shows it would accept it, so the drop is seen to bring it back.
  { carry: 'team-photo.jpg', as: 'image/jpeg' },
  { wait: 400 },
  { to: '.env-drop-zone-target', x: 0.6, y: 0.55, duration: 1100 },
  { wait: 700 },
  { drop: true },
  { wait: 200 },
  // The pointer moves off the zone while the photo uploads, for about two seconds, and the files
  // rest as they began for about three more, so the upload is seen to finish before the loop.
  { leave: true },
  { wait: 5800 },
];

/** How much of the photo has uploaded, in MB, out of 1.1. */
const size = 1.1;

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 19, height: 14.25 };

/**
 * Adding files: a drop zone above the files added, each with its Remove action, and one of them
 * uploading.
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
