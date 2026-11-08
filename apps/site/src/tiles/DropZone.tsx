import { useEffect, useState } from 'react';
import { DropZone, IconButton, Row, Text } from '@envsemble/envui';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconClose } from '@envsemble/envui/icons/Close';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const zone = '.env-drop-zone-target';

/**
 * A file picked up inside the stage, above the zone, dragged over it and dropped; it uploads a
 * moment, and the file takes the zone's place, uploaded, until it is removed, which brings the
 * zone back, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { carry: 'report.pdf', as: 'application/pdf' },
  { to: zone, x: 0.15, y: -0.35 },
  { to: zone, x: 0.55, y: 0.5, duration: 600 },
  { wait: 400 },
  { drop: true },
  { wait: 2400 },
  { to: '.env-button', duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 500 },
];

/** How long the upload takes. */
const uploading = 1100;

/**
 * A drop zone for documents, the small one, which shows whole in a gallery's low tile; narrower in
 * a phone's, so it is drawn whole at its own size there too. Its words are short, the same at every
 * width, so each stays one line. Once a file has uploaded, it shows in the zone's place, as tall as
 * the zone, so nothing around it moves.
 */
export default function DropZoneTile() {
  const [file, setFile] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const narrow = useMedia(narrowGallery);
  usePointer(script, {
    onRest: () => {
      setPending(false);
      setFile(null);
    },
  });
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), uploading);
    return () => clearTimeout(timer);
  }, [pending]);
  const inlineSize = narrow ? '8.75rem' : '12.5rem';
  if (file && !pending)
    return (
      <Row gap={2} align="center" style={{ inlineSize, blockSize: '4rem' }}>
        <IconCheckCircle style={{ color: 'var(--env-color-fg-success)', flexShrink: 0 }} />
        <Text variant="body-sm" style={{ flex: 1 }}>
          {file}
        </Text>
        <IconButton
          variant="ghost"
          size="sm"
          icon={<IconClose />}
          aria-label={`Remove ${file}`}
          onClick={() => setFile(null)}
        />
      </Row>
    );
  return (
    <DropZone
      size="sm"
      label={pending ? 'Uploading' : 'Drop a PDF'}
      description={pending ? (file ?? 'report.pdf') : 'Up to 10 MB'}
      pending={pending}
      onFilesAccepted={([accepted]) => {
        setFile(accepted?.name ?? null);
        setPending(true);
      }}
      style={{ inlineSize }}
    />
  );
}
