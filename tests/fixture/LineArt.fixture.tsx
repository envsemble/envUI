import { useState, type CSSProperties } from 'react';
import { LineArt, type LineArtMotion } from '@envsemble/envui';

export const mount = 'standalone';

const motions: LineArtMotion[] = ['appear', 'disappear', 'play', 'loop'];

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

export default function LineArtFixture() {
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
