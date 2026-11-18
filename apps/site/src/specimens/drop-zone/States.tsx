import { useEffect, useState } from 'react';
import { DropZone } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';

const uploadDurationMs = 2600;
const zoneWithErrorHeight = '11.5rem';

const script: PointerStep[] = [
  { wait: 300 },
  { carry: 'report.pdf', as: 'application/pdf' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.55, y: 0.55, duration: 700 },
  { wait: 270 },
  { drop: true },
  { wait: 660 },
  { to: zone, x: 1.15, y: 1.5, duration: 500 },
  { leave: true },
  { wait: 150 },
  { carry: 'cover.jpg', as: 'image/jpeg' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.5, y: 0.5, duration: 700 },
  { wait: 270 },
  { drop: true },
  { wait: 300 },
  { to: zone, x: 1.15, y: 1.5, duration: 450 },
  { leave: true },
  { wait: 150 },
  { carry: 'photo.jpg', as: 'image/jpeg' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.6, y: 0.55, duration: 650 },
  { wait: 270 },
  { drop: true },
  { wait: 1020 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function CoverZone() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => setUploading(null), uploadDurationMs);
    return () => window.clearTimeout(timer);
  }, [uploading]);
  return (
    <DropZone
      label={uploading ? `Uploading ${uploading}` : 'Drop a cover image, or browse'}
      description={uploading ? 'This takes a moment' : 'JPG, PNG or WebP'}
      accept="image/*"
      pending={uploading != null}
      error={error}
      onFilesAccepted={([file]) => {
        setError(undefined);
        setUploading(file.name);
      }}
      onFilesRejected={() => setError('Choose a JPG, PNG or WebP image.')}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    />
  );
}

function Dropping() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: zoneWithErrorHeight,
      }}
    >
      <Renew round={round}>
        <CoverZone />
      </Renew>
    </div>
  );
}

export default function States() {
  return (
    <SpecimenFrame>
      <MotionStage label="the zone turning a file away, then pending">
        <Dropping />
      </MotionStage>
    </SpecimenFrame>
  );
}
