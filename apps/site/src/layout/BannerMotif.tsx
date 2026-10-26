import type { CSSProperties, ReactNode } from 'react';
import { Badge } from '@envsemble/envui';

/**
 * The motifs at the end of the few catalogue banners that have one, each a small arrangement drawn
 * from what the page shows, in envUI's own tokens: a fan of the palette on Colors & themes, and a
 * gallery's tiles on the pages of all components and all patterns. Every other catalogue banner has
 * figures in thin lines (CatalogueBannerLines.tsx).
 */
type Motif = 'swatches' | 'components' | 'patterns';

const subjectMotifs: Record<string, Motif> = {
  colors: 'swatches',
  components: 'components',
  patterns: 'patterns',
};

/** The motif of the page with this id, if it has one. */
export function motifOf(id: string | undefined): Motif | undefined {
  return id === undefined ? undefined : subjectMotifs[id];
}

/** A number from 0 to 1 for a tile's nth piece, the same on every visit. */
function vary(seed: string, n: number) {
  let hash = 2166136261;
  for (const character of `${seed}:${n}`)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 1000;
}

/** A piece's place in its motif's arrangement, which staggers its entrance, and its own values. */
const piece = (n: number, values: Record<string, string | number> = {}) =>
  ({ '--n': n, ...values }) as CSSProperties;

/** A line of text, drawn as a bar of the given width in em. */
const Line = ({ width }: { width: number }) => (
  <span className="catalogue-motif-line" style={{ '--w': `${width}em` } as CSSProperties} />
);

/** Initials on the avatars, as on the examples' sample people. */
const initials = ['SL', 'PS', 'AM', 'JE', 'MO', 'LB', 'RK', 'TN', 'AW', 'CD', 'EV', 'HG'];
const hues = ['powder', 'seafoam', 'sage', 'butter', 'blush', 'periwinkle', 'orchid', 'oat'];
const tones = ['accent', 'success', 'warning', 'danger', 'done', 'neutral'] as const;

/** A fan of color chips, one for each tone of the palette, from its muted fill to its text. */
function Swatches() {
  return tones.map((tone, n) => (
    <span
      key={tone}
      className="catalogue-motif-swatch"
      style={piece(n, {
        '--turn': `${(n - (tones.length - 1) / 2) * 13}deg`,
        '--muted': `var(--env-color-bg-${tone}-muted)`,
        '--emphasis': `var(--env-color-bg-${tone}-emphasis)`,
        '--strong':
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

/** A slider's tracks with their fills and thumbs at different values, one in the accent. */
function Tracks({ seed }: { seed: string }) {
  return Array.from({ length: 5 }, (_, n) => (
    <span
      key={n}
      className="catalogue-motif-track"
      data-accent={n === 1 || undefined}
      style={piece(n, {
        '--value': `${Math.round(18 + vary(seed, n) * 70)}%`,
        '--offset': `${[3, 0, 5, 1.5, 4][n]}em`,
      })}
    >
      <span className="catalogue-motif-track-fill" />
      <span className="catalogue-motif-track-thumb" />
    </span>
  ));
}

/** Switches, or switches, checkboxes and radios, each with its label, some on. */
function Toggles({ seed, kind }: { seed: string; kind?: string }) {
  const kinds = ['switch', 'checkbox', 'radio'];
  return Array.from({ length: 5 }, (_, n) => (
    <span key={n} className="catalogue-motif-toggle-row" style={piece(n)}>
      <span
        className="catalogue-motif-toggle"
        data-kind={kind ?? kinds[n % 3]}
        data-on={vary(seed, n) > 0.45 || n === 0 || undefined}
      />
      <Line width={5 + vary(seed, n + 9) * 6} />
    </span>
  ));
}

/** Avatars in overlapping rows, each in its hue, as a group shows them. */
function Avatars({ seed }: { seed: string }) {
  return [4, 5, 4].map((count, row) => (
    <span key={row} className="catalogue-motif-avatar-row" style={piece(row)}>
      {Array.from({ length: count }, (_, n) => {
        const index = (row * 5 + n + Math.floor(vary(seed, 0) * 8)) % initials.length;
        return (
          <span
            key={n}
            className="catalogue-motif-avatar"
            style={piece(row * 2 + n, {
              '--hue-bg': `var(--env-color-avatar-bg-${hues[index % hues.length]})`,
              '--hue-fg': `var(--env-color-avatar-fg-${hues[index % hues.length]})`,
            })}
          >
            {initials[index]}
          </span>
        );
      })}
    </span>
  ));
}

/** Pills in rows: primary, secondary, ghost and icon buttons. */
function Buttons({ seed }: { seed: string }) {
  const rows = [
    ['primary', 'secondary', 'icon'],
    ['secondary', 'ghost', 'secondary'],
    ['icon', 'secondary', 'primary'],
    ['ghost', 'primary', 'icon'],
  ];
  return rows.map((row, r) => (
    <span key={r} className="catalogue-motif-button-row" style={piece(r)}>
      {row.map((kind, n) => (
        <span key={n} className="catalogue-motif-button" data-kind={kind} style={piece(r + n)}>
          {kind !== 'icon' && <Line width={3 + vary(seed, r * 3 + n) * 3} />}
        </span>
      ))}
    </span>
  ));
}

/** Labels over boxes, one focused with its caret, one a select with its chevron. */
function Fields({ seed }: { seed: string }) {
  return Array.from({ length: 4 }, (_, n) => (
    <span key={n} className="catalogue-motif-field-group" style={piece(n)}>
      <Line width={3 + vary(seed, n) * 3} />
      <span
        className="catalogue-motif-field"
        data-focus={n === 1 || undefined}
        data-select={n === 2 || undefined}
      >
        <Line width={5 + vary(seed, n + 5) * 6} />
      </span>
    </span>
  ));
}

/** A table on a panel: its head and rows of cells. */
function Table({ seed }: { seed: string }) {
  return (
    <span className="catalogue-motif-panel" data-variant="table">
      {Array.from({ length: 6 }, (_, n) => (
        <span
          key={n}
          className="catalogue-motif-row"
          data-head={n === 0 || undefined}
          style={piece(n, { '--depth': 0 })}
        >
          {[0, 1, 2, 3].map((cell) => (
            <Line key={cell} width={2 + vary(seed, n * 4 + cell) * 3} />
          ))}
        </span>
      ))}
    </span>
  );
}

/** A window: its bar, its navigation and its panes. */
function Window({ seed }: { seed: string }) {
  return (
    <span className="catalogue-motif-window" style={piece(0)}>
      <span className="catalogue-motif-window-bar" style={piece(1)} />
      <span className="catalogue-motif-window-side" style={piece(2)}>
        {[0, 1, 2, 3].map((n) => (
          <Line key={n} width={2 + vary(seed, n) * 2} />
        ))}
      </span>
      <span className="catalogue-motif-window-main" style={piece(3)}>
        {[0, 1, 2].map((n) => (
          <span key={n} className="catalogue-motif-window-pane" style={piece(n + 3)} />
        ))}
      </span>
    </span>
  );
}

/** Badges in every tone, as statuses gather on a page. */
function Badges() {
  const badges = [
    ['success', 'Ready'],
    ['accent', 'In review'],
    ['warning', 'Blocked'],
    ['done', 'Completed'],
    ['neutral', 'Draft'],
    ['danger', 'Failed'],
    ['accent', 'New'],
    ['success', 'Paid'],
  ] as const;
  return badges.map(([tone, label], n) => (
    <span key={label} className="catalogue-motif-badge" style={piece(n)}>
      <Badge tone={tone}>{label}</Badge>
    </span>
  ));
}

/** A conversation: two messages from either side, the composer under them. */
function Chat({ seed }: { seed: string }) {
  return (
    <>
      {[0, 1].map((n) => (
        <span
          key={n}
          className="catalogue-motif-message"
          data-own={n === 1 || undefined}
          style={piece(n)}
        >
          <Line width={5 + vary(seed, n) * 5} />
          {n === 0 && <Line width={3 + vary(seed, n + 4) * 4} />}
        </span>
      ))}
      <span className="catalogue-motif-composer" style={piece(2)}>
        <Line width={6} />
        <span className="catalogue-motif-send" />
      </span>
    </>
  );
}

/** A gallery's tile: its art's name and variant in the stylesheet, and the art. */
type Tile = [art: string, variant: string | undefined, draw: (seed: string) => ReactNode];

const galleries: Record<'components' | 'patterns', Tile[]> = {
  components: [
    ['tracks', 'thumbs', (seed) => <Tracks seed={seed} />],
    ['buttons', undefined, (seed) => <Buttons seed={seed} />],
    ['avatars', undefined, (seed) => <Avatars seed={seed} />],
    ['toggles', 'switch', (seed) => <Toggles seed={seed} kind="switch" />],
    ['badges', undefined, () => <Badges />],
    ['fields', undefined, (seed) => <Fields seed={seed} />],
  ],
  patterns: [
    ['fields', undefined, (seed) => <Fields seed={seed} />],
    ['chat', 'composer', (seed) => <Chat seed={seed} />],
    ['rows', 'table', (seed) => <Table seed={seed} />],
    ['toggles', undefined, (seed) => <Toggles seed={seed} />],
    ['window', undefined, (seed) => <Window seed={seed} />],
    ['avatars', undefined, (seed) => <Avatars seed={seed} />],
  ],
};

/** Tiles of a gallery, each a small motif of its own: every component, or every pattern. */
function Gallery({ of }: { of: 'components' | 'patterns' }) {
  return galleries[of].map(([art, variant, draw], n) => (
    <span key={n} className="catalogue-motif-tile" style={piece(n)}>
      <span className="catalogue-motif-art" data-motif={art} data-variant={variant}>
        {draw(`${of}${n}`)}
      </span>
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
      <span
        className="catalogue-motif-art"
        data-motif={motif === 'swatches' ? 'swatches' : 'collage'}
      >
        {motif === 'swatches' ? <Swatches /> : <Gallery of={motif} />}
      </span>
    </span>
  );
}
