import { useState, type CSSProperties } from 'react';
import { LineArt, type LineArtMotion } from '@envsemble/envui';

const motions: LineArtMotion[] = ['appear', 'disappear', 'play', 'loop'];

/** A drawing whose motion the buttons set, with the motions that have ended, in order. */
function Moving({ box }: { box: CSSProperties }) {
  const [motion, setMotion] = useState<LineArtMotion>();
  const [ended, setEnded] = useState<string[]>([]);
  return (
    <div>
      {motions.map((name) => (
        <button key={name} type="button" onClick={() => setMotion(name)}>
          {name}
        </button>
      ))}
      <output data-testid="ended">{ended.join(' ')}</output>
      <div style={box}>
        <LineArt
          drawing="harmonic-division"
          motion={motion}
          onMotionEnd={() => setEnded((all) => [...all, motion!])}
          data-testid="moving"
        />
      </div>
    </div>
  );
}

/**
 * LineArt in banner-shaped boxes: at the end by default, at the start, in a right-to-left box, and
 * labelled as an image; and one whose motion the buttons set.
 */
export function LineArtsFixture() {
  // Taller than the drawing's sheet, so the box crops it from the side away from where it sits.
  const box = { inlineSize: '12rem', blockSize: '12rem' };
  return (
    <div className="fixture-section" style={{ display: 'grid', gap: '1rem' }}>
      <div style={box}>
        <LineArt drawing="golden-section" data-testid="end" />
      </div>
      <div style={box}>
        <LineArt drawing="golden-section" align="start" data-testid="start" />
      </div>
      <div style={box} dir="rtl">
        <LineArt drawing="golden-section" data-testid="rtl" />
      </div>
      <div style={box}>
        <LineArt drawing="pappus-chain" label="A chain of circles between three arcs" />
      </div>
      <Moving box={box} />
    </div>
  );
}
