import { useEffect, useState } from 'react';
import { DropZone } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';

/*
 * A zone that takes an image. The pointer carries report.pdf over it and drops it: the zone turns
 * it away with an error. Then it drops cover.jpg: a spinner takes the icon's place while it
 * uploads, and a second image carried over meanwhile is refused, the zone staying as it is. Then
 * the zone starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { carry: 'report.pdf', as: 'application/pdf' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.55, y: 0.55, duration: 700 },
  { wait: 450 },
  { drop: true },
  { wait: 1100 },
  { to: zone, x: 1.15, y: 1.5, duration: 500 },
  { leave: true },
  { wait: 250 },
  { carry: 'cover.jpg', as: 'image/jpeg' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.5, y: 0.5, duration: 700 },
  { wait: 450 },
  { drop: true },
  { wait: 500 },
  { to: zone, x: 1.15, y: 1.5, duration: 450 },
  { leave: true },
  { wait: 250 },
  { carry: 'photo.jpg', as: 'image/jpeg' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.6, y: 0.55, duration: 650 },
  { wait: 450 },
  { drop: true },
  { wait: 1700 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

/** The zone: an image only, with its error, and pending while an image uploads. */
function CoverZone() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => setUploading(null), 2600);
    return () => window.clearTimeout(timer);
  }, [uploading]);
  return (
    <DropZone
      label={uploading ? `Uploading ${uploading}` : 'Drop a cover image, or browse'}
      description={uploading ? 'This takes a moment' : 'JPG, PNG or WebP'}
      accept="image/*"
      pending={uploading != null}
      error={error}
      onDropAccepted={([file]) => {
        setError(undefined);
        setUploading(file.name);
      }}
      onDropRejected={() => setError('Choose a JPG, PNG or WebP image.')}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    />
  );
}

function Dropping() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the zone with its error, so it stays put as the error shows.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '11.5rem',
      }}
    >
      <Renew round={round}>
        <CoverZone />
      </Renew>
    </div>
  );
}

/** A zone that turns away a file it can't take, then is pending while an image uploads. */
export default function States() {
  return (
    <Example>
      <MotionStage label="the zone turning a file away, then pending">
        <Dropping />
      </MotionStage>
    </Example>
  );
}
