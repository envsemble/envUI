import { useEffect, useState } from 'react';
import { DropZone } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

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

/** A drop zone for documents. */
export default function DropZoneTile() {
  const [pending, setPending] = useState(false);
  usePointer(script);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 1500);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <DropZone
      label={pending ? 'Uploading report.pdf' : 'Drop files here, or browse'}
      pending={pending}
      onFilesAccepted={() => setPending(true)}
      style={{ inlineSize: '12rem' }}
    />
  );
}
