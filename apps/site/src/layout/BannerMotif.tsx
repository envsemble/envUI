import type { CSSProperties } from 'react';

/**
 * The motif at the end of the one catalogue banner that has one: a fan of the palette on Colors &
 * themes, drawn in envUI's own tokens. Every other catalogue banner has a LineArt drawing
 * (CatalogueBannerLines.tsx).
 */
type Motif = 'swatches';

const subjectMotifs: Record<string, Motif> = { colors: 'swatches' };

/** The motif of the page with this id, if it has one. */
export function motifOf(id: string | undefined): Motif | undefined {
  return id === undefined ? undefined : subjectMotifs[id];
}

/** A piece's place in its motif's arrangement, which staggers its entrance, and its own values. */
const piece = (n: number, values: Record<string, string | number> = {}) =>
  ({ '--catalogue-motif-place': n, ...values }) as CSSProperties;

const tones = ['primary', 'success', 'warning', 'danger', 'done', 'neutral'] as const;

/** A fan of color chips, one for each tone of the palette, from its muted fill to its text. */
function Swatches() {
  return tones.map((tone, n) => (
    <span
      key={tone}
      className="catalogue-motif-swatch"
      style={piece(n, {
        '--catalogue-motif-turn': `${(n - (tones.length - 1) / 2) * 13}deg`,
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

/**
 * The picture at the end of a catalogue banner that has a motif, arranged toward the banner's end
 * and faded toward its text, which settles into place as the page opens (BannerMotifs.css). It is
 * decoration: hidden from assistive technology, out of the tab order and the pointer's way, and of
 * no size in the banner's layout.
 */
export function BannerMotif({ motif }: { motif: Motif }) {
  return (
    <span className="catalogue-banner-motif" aria-hidden="true" inert>
      <span className="catalogue-motif-art" data-motif={motif}>
        <Swatches />
      </span>
    </span>
  );
}
