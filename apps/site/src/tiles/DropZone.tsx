import { useEffect, useState } from 'react';
import { DropZone } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const zone = '.env-drop-zone-target';

/** A file dragged in from the desktop, over the zone and dropped; it uploads a moment. */
const script: PointerStep[] = [
  { wait: 400 },
  { carry: 'report.pdf', as: 'application/pdf' },
  { to: zone, x: 0.9, y: 0.9 },
  { to: zone, x: 0.55, y: 0.5, duration: 600 },
  { wait: 500 },
  { drop: true },
  { wait: 1800 },
  { leave: true },
  { wait: 600 },
];

/**
 * A drop zone for documents, the small one, which shows whole in a gallery's low tile; narrower in
 * a phone's, so it is drawn whole at its own size there too. Its words are short, the same at every
 * width, so each stays one line there.
 */
export default function DropZoneTile() {
  const [pending, setPending] = useState(false);
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 1500);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <DropZone
      size="sm"
      label={pending ? 'Uploading' : 'Drop a PDF'}
      description={pending ? 'report.pdf' : 'Up to 10 MB'}
      pending={pending}
      onFilesAccepted={() => setPending(true)}
      style={{ inlineSize: narrow ? '8.75rem' : '12.5rem' }}
    />
  );
}
