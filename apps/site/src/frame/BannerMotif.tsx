import type { CSSProperties } from 'react';

type Motif = 'swatches';

const subjectMotifs: Record<string, Motif> = { colors: 'swatches' };

export function motifOf(id: string | undefined): Motif | undefined {
  return id === undefined ? undefined : subjectMotifs[id];
}

const motifPiece = (n: number, values: CSSProperties = {}): CSSProperties => ({
  '--catalogue-motif-place': n,
  ...values,
});

const fanStepDeg = 13;

const tones = ['primary', 'success', 'warning', 'danger', 'done', 'neutral'] as const;

function Swatches() {
  return tones.map((tone, n) => (
    <span
      key={tone}
      className="catalogue-motif-swatch"
      style={motifPiece(n, {
        '--catalogue-motif-turn': `${(n - (tones.length - 1) / 2) * fanStepDeg}deg`,
        '--catalogue-tone-muted': `var(--env-color-bg-${tone}-muted)`,
        '--catalogue-tone-emphasis': `var(--env-color-bg-${tone}-${tone === 'primary' ? 'solid' : 'emphasis'})`,
        '--catalogue-tone-strong':
          tone === 'neutral' ? 'var(--env-color-fg-default)' : `var(--env-color-fg-${tone})`,
      })}
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  ));
}

export function BannerMotif({ motif }: { motif: Motif }) {
  return (
    <span className="catalogue-banner-motif" aria-hidden="true" inert>
      <span className="catalogue-motif-art" data-motif={motif}>
        <Swatches />
      </span>
    </span>
  );
}
