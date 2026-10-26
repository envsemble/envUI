import { LineArt } from '@envsemble/envui';

/**
 * LineArt in banner-shaped boxes: at the end by default, at the start, in a right-to-left box, and
 * labelled as an image.
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
    </div>
  );
}
