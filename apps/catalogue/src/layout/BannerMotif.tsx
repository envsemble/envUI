import type { CSSProperties, ReactNode } from 'react';
import { Badge } from '@envsemble/envui';

/** What a catalogue page shows: a component's, pattern's or foundation's id, and its group. */
export interface BannerSubject {
  id: string;
  group?: string;
}

/**
 * The motifs, each a small arrangement drawn from the parts a kind of subject is made of, such as
 * tracks and thumbs, overlapping avatars or a fan of the palette, in envUI's own tokens. A variant
 * draws the same motif after one subject in particular, such as Slider's thumbs on the tracks.
 */
type Motif =
  | 'tracks'
  | 'toggles'
  | 'avatars'
  | 'swatches'
  | 'steps'
  | 'blocks'
  | 'type'
  | 'buttons'
  | 'fields'
  | 'rows'
  | 'surfaces'
  | 'window'
  | 'rings'
  | 'badges'
  | 'heatmap'
  | 'chat'
  | 'collage'
  | 'glyphs';

/**
 * Each subject's motif, by its id, and its variant where it has one. A subject not listed takes its
 * group's motif, and one in no group the page's own icon, repeated (`glyphs`): every page has a
 * motif, and a new component shows its group's until it is given its own.
 */
const subjectMotifs: Record<string, Motif | readonly [Motif, string]> = {
  // Actions
  button: 'buttons',
  link: ['type', 'links'],
  toolbar: ['buttons', 'toolbar'],
  menu: ['rows', 'menu'],
  menubar: ['buttons', 'toolbar'],
  'command-palette': ['fields', 'search'],
  // Forms & selection
  checkbox: ['toggles', 'checkbox'],
  radio: ['toggles', 'radio'],
  switch: ['toggles', 'switch'],
  slider: ['tracks', 'thumbs'],
  'segmented-control': ['buttons', 'segments'],
  'color-picker': 'swatches',
  'drop-zone': ['fields', 'drop'],
  // Navigation
  breadcrumbs: ['buttons', 'crumbs'],
  tabs: ['buttons', 'segments'],
  'document-tabs': ['window', 'tabs'],
  pager: ['buttons', 'pages'],
  pagination: ['buttons', 'pages'],
  drawer: ['window', 'drawer'],
  tree: ['rows', 'tree'],
  // Data display
  'animated-number': ['type', 'figures'],
  avatar: 'avatars',
  badge: 'badges',
  'calendar-heatmap': 'heatmap',
  'description-list': ['rows', 'terms'],
  list: 'rows',
  meter: 'tracks',
  rating: 'glyphs',
  'relative-time': 'glyphs',
  table: ['rows', 'table'],
  // Text & content
  accordion: ['rows', 'disclosure'],
  disclosure: ['rows', 'disclosure'],
  code: ['type', 'code'],
  composer: ['chat', 'composer'],
  kbd: ['buttons', 'keys'],
  markdown: ['type', 'prose'],
  message: 'chat',
  // Feedback
  alert: ['surfaces', 'alerts'],
  progress: ['tracks', 'progress'],
  spinner: 'rings',
  toast: ['surfaces', 'toasts'],
  // Overlays
  tooltip: ['surfaces', 'tips'],
  // App frame & layout
  box: 'blocks',
  column: ['blocks', 'column'],
  row: ['blocks', 'row'],
  grid: 'blocks',
  card: 'surfaces',
  surface: 'surfaces',
  'top-bar': 'window',
  'panel-dock': ['window', 'dock'],
  panes: ['window', 'panes'],
  // Patterns
  'account-and-organizations': 'avatars',
  'app-frame': 'window',
  conversation: 'chat',
  'data-tables': ['rows', 'table'],
  'destructive-actions': ['buttons', 'danger'],
  feedback: 'badges',
  'file-upload': ['fields', 'drop'],
  filtering: ['fields', 'search'],
  forms: 'fields',
  'key-figures': ['type', 'figures'],
  loading: 'rings',
  navigation: ['window', 'drawer'],
  'progressive-disclosure': ['rows', 'disclosure'],
  settings: 'toggles',
  // Foundations
  colors: 'swatches',
  typography: 'type',
  spacing: 'steps',
  accessibility: ['buttons', 'focus'],
  responsive: ['window', 'devices'],
  // The pages of all components and all patterns.
  components: 'collage',
  patterns: ['collage', 'patterns'],
};

/** The motif of a subject its id doesn't list, by its group. */
const groupMotifs: Record<string, Motif> = {
  Actions: 'buttons',
  'Forms & selection': 'fields',
  Navigation: 'rows',
  'Data display': 'rows',
  'Text & content': 'type',
  Feedback: 'badges',
  Overlays: 'surfaces',
  'App frame & layout': 'blocks',
};

/** A number from 0 to 1 for a subject's nth piece, the same on every visit. */
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
const Line = ({ width, n = 0 }: { width: number; n?: number }) => (
  <span className="docs-motif-line" style={piece(n, { '--w': `${width}em` })} />
);

/** Initials on the avatars, as on the examples' sample people. */
const initials = ['SL', 'PS', 'AM', 'JE', 'MO', 'LB', 'RK', 'TN', 'AW', 'CD', 'EV', 'HG'];
const hues = ['powder', 'seafoam', 'sage', 'butter', 'blush', 'periwinkle', 'orchid', 'oat'];
const tones = ['accent', 'success', 'warning', 'danger', 'done', 'neutral'] as const;

interface ArtProps {
  seed: string;
  variant?: string;
  symbol?: ReactNode;
}

/** Tracks with their fills at different values: a slider's with thumbs, a meter's, a progress bar's. */
function Tracks({ seed, variant }: ArtProps) {
  return Array.from({ length: 5 }, (_, n) => (
    <span
      key={n}
      className="docs-motif-track"
      data-accent={variant === 'thumbs' ? n === 1 || undefined : true}
      style={piece(n, {
        '--value': `${Math.round(18 + vary(seed, n) * 70)}%`,
        '--offset': `${[3, 0, 5, 1.5, 4][n]}em`,
      })}
    >
      <span className="docs-motif-track-fill" />
      {variant === 'thumbs' && <span className="docs-motif-track-thumb" />}
    </span>
  ));
}

/** Switches, checkboxes and radios, each with its label, some on. */
function Toggles({ seed, variant }: ArtProps) {
  const kinds = ['switch', 'checkbox', 'radio'];
  return Array.from({ length: 5 }, (_, n) => {
    const kind = variant ?? kinds[n % 3];
    return (
      <span key={n} className="docs-motif-toggle-row" style={piece(n)}>
        <span
          className="docs-motif-toggle"
          data-kind={kind}
          data-on={vary(seed, n) > 0.45 || n === 0 || undefined}
        />
        <Line width={5 + vary(seed, n + 9) * 6} />
      </span>
    );
  });
}

/** Avatars in overlapping rows, each in its hue, as a group shows them. */
function Avatars({ seed }: ArtProps) {
  return [4, 5, 4].map((count, row) => (
    <span key={row} className="docs-motif-avatar-row" style={piece(row)}>
      {Array.from({ length: count }, (_, n) => {
        const index = (row * 5 + n + Math.floor(vary(seed, 0) * 8)) % initials.length;
        return (
          <span
            key={n}
            className="docs-motif-avatar"
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

/** A fan of color chips, one for each tone of the palette, from its muted fill to its text. */
function Swatches() {
  return tones.map((tone, n) => (
    <span
      key={tone}
      className="docs-motif-swatch"
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

/** The spacing scale as a rhythm of steps, each as large as its step. */
function Steps() {
  return Array.from({ length: 9 }, (_, n) => (
    <span
      key={n}
      className="docs-motif-step"
      style={piece(n, { '--size': `var(--env-space-${n + 1})` })}
    />
  ));
}

/** Blocks laid out in a row, a column or a grid, the gaps between them tinted. */
function Blocks({ variant }: ArtProps) {
  const count = variant === 'row' ? 4 : variant === 'column' ? 4 : 9;
  return (
    <span className="docs-motif-blocks" data-variant={variant}>
      {Array.from({ length: count }, (_, n) => (
        <span key={n} className="docs-motif-block" style={piece(n)} />
      ))}
    </span>
  );
}

/** Type: the scale's sizes, figures, prose, code or links. */
function Type({ seed, variant }: ArtProps) {
  if (variant === 'figures')
    return ['1,280', '+12%', '86', '4.9'].map((figure, n) => (
      <span key={figure} className="docs-motif-figure" style={piece(n)}>
        {figure}
      </span>
    ));
  if (variant === 'code')
    return Array.from({ length: 7 }, (_, n) => (
      <span
        key={n}
        className="docs-motif-code-line"
        style={piece(n, { '--indent': `${[0, 1, 2, 2, 1, 1, 0][n] * 1.6}em` })}
      >
        {Array.from({ length: 1 + (n % 3) }, (_, part) => (
          <span
            key={part}
            data-tone={['accent', 'done', 'success', 'muted'][(n + part) % 4]}
            style={piece(n, { '--w': `${2 + vary(seed, n * 3 + part) * 5}em` })}
          />
        ))}
      </span>
    ));
  if (variant === 'prose' || variant === 'links')
    return (
      <span className="docs-motif-prose" data-variant={variant}>
        <span className="docs-motif-prose-heading" style={piece(0)} />
        {Array.from({ length: 6 }, (_, n) => (
          <span key={n} className="docs-motif-prose-line" style={piece(n + 1)}>
            <Line width={4 + vary(seed, n) * 6} />
            <span
              className="docs-motif-line"
              data-link={variant === 'links' || n === 2 || undefined}
              style={piece(n, { '--w': `${3 + vary(seed, n + 7) * 4}em` })}
            />
            <Line width={2 + vary(seed, n + 13) * 5} />
          </span>
        ))}
      </span>
    );
  return ['Aa', 'Aa', 'Aa', 'Aa', 'Aa'].map((text, n) => (
    <span key={n} className="docs-motif-glyph-type" style={piece(n, { '--size': 7 - n * 1.3 })}>
      {text}
    </span>
  ));
}

/** Buttons and the controls drawn like them: pills, segments, keys, pages, crumbs, focus rings. */
function Buttons({ seed, variant }: ArtProps) {
  if (variant === 'keys')
    return ['Ctrl', 'K', '⇧', '⌘', 'Esc', '↵', 'Tab'].map((key, n) => (
      <span key={key} className="docs-motif-key" style={piece(n)}>
        {key}
      </span>
    ));
  if (variant === 'pages')
    return (
      <span className="docs-motif-pages">
        {['‹', '1', '2', '3', '4', '…', '9', '›'].map((page, n) => (
          <span
            key={n}
            className="docs-motif-page"
            data-current={n === 2 || undefined}
            style={piece(n)}
          >
            {page}
          </span>
        ))}
      </span>
    );
  if (variant === 'crumbs')
    return [0, 1, 2].map((row) => (
      <span key={row} className="docs-motif-crumbs" style={piece(row)}>
        {Array.from({ length: 4 - (row % 2) }, (_, n) => (
          <span key={n} className="docs-motif-crumb">
            <Line width={2.5 + vary(seed, row * 4 + n) * 3} n={row} />
          </span>
        ))}
      </span>
    ));
  if (variant === 'segments')
    return [0, 1, 2].map((row) => (
      <span key={row} className="docs-motif-segments" style={piece(row)}>
        {Array.from({ length: 3 + (row % 2) }, (_, n) => (
          <span
            key={n}
            className="docs-motif-segment"
            data-selected={n === (row + 1) % 3 || undefined}
          >
            <Line width={2.5 + vary(seed, row * 4 + n) * 2.5} />
          </span>
        ))}
      </span>
    ));
  // Pills in rows: primary, secondary, ghost and icon buttons, or one with its focus ring.
  const rows = [
    ['primary', 'secondary', 'icon'],
    ['secondary', 'ghost', 'secondary'],
    ['icon', 'secondary', 'primary'],
    ['ghost', 'primary', 'icon'],
  ];
  return rows.map((row, r) => (
    <span key={r} className="docs-motif-button-row" style={piece(r)}>
      {row.map((kind, n) => (
        <span
          key={n}
          className="docs-motif-button"
          data-kind={variant === 'focus' && kind === 'primary' ? 'secondary' : kind}
          data-tone={variant === 'danger' && kind === 'primary' ? 'danger' : undefined}
          data-focus={variant === 'focus' && r === 1 && n === 1 ? true : undefined}
          style={piece(r + n)}
        >
          {kind !== 'icon' && <Line width={3 + vary(seed, r * 3 + n) * 3} />}
        </span>
      ))}
    </span>
  ));
}

/** Fields: labels over boxes, one focused with its caret, or search with chips, or a drop zone. */
function Fields({ seed, variant }: ArtProps) {
  if (variant === 'drop')
    return (
      <span className="docs-motif-drop" style={piece(0)}>
        <span className="docs-motif-drop-arrow" />
        <Line width={7} />
        {[0, 1].map((n) => (
          <span
            key={n}
            className="docs-motif-file"
            style={piece(n + 1, { '--value': `${40 + n * 45}%` })}
          >
            <Line width={4 + n} />
            <span className="docs-motif-track">
              <span className="docs-motif-track-fill" />
            </span>
          </span>
        ))}
      </span>
    );
  return Array.from({ length: 4 }, (_, n) => (
    <span key={n} className="docs-motif-field-group" style={piece(n)}>
      {!(variant === 'search' && n === 0) && <Line width={3 + vary(seed, n) * 3} />}
      <span
        className="docs-motif-field"
        data-search={(variant === 'search' && n === 0) || undefined}
        data-focus={n === 1 || undefined}
        data-select={n === 2 || undefined}
      >
        <Line width={5 + vary(seed, n + 5) * 6} />
      </span>
      {variant === 'search' && n === 0 && (
        <span className="docs-motif-chips">
          {[0, 1, 2].map((chip) => (
            <span key={chip} className="docs-motif-chip">
              <Line width={2 + vary(seed, chip + 20) * 2} />
            </span>
          ))}
        </span>
      )}
    </span>
  ));
}

/** Rows on a panel: a list's, a menu's, a tree's, a table's, terms', or disclosures'. */
function Rows({ seed, variant }: ArtProps) {
  const count = variant === 'table' ? 6 : 5;
  return (
    <span className="docs-motif-panel" data-variant={variant}>
      {Array.from({ length: count }, (_, n) => (
        <span
          key={n}
          className="docs-motif-row"
          data-selected={(variant !== 'table' && variant !== 'terms' && n === 1) || undefined}
          data-head={(variant === 'table' && n === 0) || undefined}
          data-open={(variant === 'disclosure' && n === 1) || undefined}
          style={piece(n, { '--depth': variant === 'tree' ? [0, 1, 2, 2, 1][n] : 0 })}
        >
          {variant === 'table' ? (
            [0, 1, 2, 3].map((cell) => <Line key={cell} width={2 + vary(seed, n * 4 + cell) * 3} />)
          ) : (
            <>
              <span className="docs-motif-row-lead" />
              <Line width={5 + vary(seed, n) * 5} />
              <Line width={1.5 + vary(seed, n + 11) * 2} />
            </>
          )}
        </span>
      ))}
    </span>
  );
}

/** Surfaces laid over one another: cards, alerts, toasts or tooltips. */
function Surfaces({ seed, variant }: ArtProps) {
  if (variant === 'alerts' || variant === 'toasts')
    return ['accent', 'success', 'warning', 'danger'].map((tone, n) => (
      <span
        key={tone}
        className="docs-motif-notice"
        data-variant={variant}
        data-tone={tone}
        style={piece(n)}
      >
        <span className="docs-motif-notice-mark" />
        <Line width={6 + vary(seed, n) * 5} />
      </span>
    ));
  if (variant === 'tips')
    return [0, 1, 2].map((n) => (
      <span key={n} className="docs-motif-tip-pair" style={piece(n)}>
        <span className="docs-motif-tip">
          <Line width={3 + vary(seed, n) * 4} />
        </span>
        <span className="docs-motif-button" data-kind="secondary">
          <Line width={3} />
        </span>
      </span>
    ));
  return [0, 1, 2].map((n) => (
    <span key={n} className="docs-motif-card" style={piece(n)}>
      <Line width={5 + vary(seed, n) * 3} />
      <Line width={9} />
      <Line width={7 + vary(seed, n + 3) * 3} />
      {n === 2 && <span className="docs-motif-button" data-kind="primary" />}
    </span>
  ));
}

/** A window: an app's frame, its panes or dock, its tabs, a drawer, or the same at three widths. */
function Window({ seed, variant }: ArtProps) {
  if (variant === 'devices')
    return ['desktop', 'tablet', 'phone'].map((device, n) => (
      <span key={device} className="docs-motif-device" data-device={device} style={piece(n)}>
        <span className="docs-motif-window-bar" />
        <Line width={4} />
        <Line width={3} />
      </span>
    ));
  return (
    <span className="docs-motif-window" data-variant={variant} style={piece(0)}>
      <span className="docs-motif-window-bar" style={piece(1)}>
        {variant === 'tabs' &&
          [0, 1, 2].map((tab) => (
            <span
              key={tab}
              className="docs-motif-window-tab"
              data-selected={tab === 1 || undefined}
            />
          ))}
      </span>
      {variant !== 'tabs' && (
        <span className="docs-motif-window-side" style={piece(2)}>
          {[0, 1, 2, 3].map((n) => (
            <Line key={n} width={2 + vary(seed, n) * 2} />
          ))}
        </span>
      )}
      <span className="docs-motif-window-main" style={piece(3)}>
        {[0, 1, 2].map((n) => (
          <span key={n} className="docs-motif-window-pane" style={piece(n + 3)} />
        ))}
      </span>
    </span>
  );
}

/** Rings: arcs of a spinner at different sizes, turning slowly. */
function Rings() {
  return (
    <svg className="docs-motif-rings" viewBox="0 0 200 200">
      {[90, 68, 46].map((radius, n) => (
        <g key={radius} style={piece(n)}>
          <circle cx="100" cy="100" r={radius} className="docs-motif-ring-track" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            pathLength={100}
            className="docs-motif-ring-arc"
            strokeDasharray={`${[28, 42, 64][n]} 100`}
          />
        </g>
      ))}
    </svg>
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
    <span key={label} className="docs-motif-badge" style={piece(n)}>
      <Badge tone={tone}>{label}</Badge>
    </span>
  ));
}

/** A calendar heatmap's weeks: days in steps of the accent, by how much happened. */
function Heatmap({ seed }: ArtProps) {
  return Array.from({ length: 7 * 14 }, (_, n) => (
    <span
      key={n}
      className="docs-motif-day"
      style={piece(Math.floor(n / 7), { '--level': Math.floor(vary(seed, n) ** 1.6 * 5) })}
    />
  ));
}

/** A conversation: messages from either side, the composer under them. */
function Chat({ seed, variant }: ArtProps) {
  const messages = variant === 'composer' ? 2 : 4;
  return (
    <>
      {Array.from({ length: messages }, (_, n) => (
        <span
          key={n}
          className="docs-motif-message"
          data-own={n % 2 === 1 || undefined}
          style={piece(n)}
        >
          <Line width={5 + vary(seed, n) * 5} />
          {n % 2 === 0 && <Line width={3 + vary(seed, n + 4) * 4} />}
        </span>
      ))}
      <span className="docs-motif-composer" style={piece(messages)}>
        <Line width={6} />
        <span className="docs-motif-send" />
      </span>
    </>
  );
}

/** Tiles of a gallery, each a small motif of its own: every component, or every pattern. */
function Collage({ seed, variant }: ArtProps) {
  const tiles: [Motif, string | undefined][] =
    variant === 'patterns'
      ? [
          ['fields', undefined],
          ['chat', 'composer'],
          ['rows', 'table'],
          ['toggles', undefined],
          ['window', undefined],
          ['avatars', undefined],
        ]
      : [
          ['tracks', 'thumbs'],
          ['buttons', undefined],
          ['avatars', undefined],
          ['toggles', 'switch'],
          ['badges', undefined],
          ['fields', undefined],
        ];
  return tiles.map(([motif, tileVariant], n) => {
    const Art = arts[motif];
    return (
      <span key={n} className="docs-motif-tile" style={piece(n)}>
        <span className="docs-motif-art" data-motif={motif} data-variant={tileVariant}>
          <Art seed={`${seed}${n}`} variant={tileVariant} />
        </span>
      </span>
    );
  });
}

/** The page's own icon, repeated at a few sizes: the motif of a page with none of its own. */
function Glyphs({ symbol }: ArtProps) {
  return Array.from({ length: 7 }, (_, n) => (
    <span key={n} className="docs-motif-glyph" style={piece(n)}>
      {symbol}
    </span>
  ));
}

const arts: Record<Motif, (props: ArtProps) => ReactNode> = {
  tracks: Tracks,
  toggles: Toggles,
  avatars: Avatars,
  swatches: Swatches,
  steps: Steps,
  blocks: Blocks,
  type: Type,
  buttons: Buttons,
  fields: Fields,
  rows: Rows,
  surfaces: Surfaces,
  window: Window,
  rings: Rings,
  badges: Badges,
  heatmap: Heatmap,
  chat: Chat,
  collage: Collage,
  glyphs: Glyphs,
};

/**
 * The picture at the end of a catalogue page's banner: a motif drawn from what the page shows,
 * arranged toward the banner's end and faded toward its text, which settles into place as the page
 * opens (BannerMotifs.css). It is decoration: hidden from assistive technology, out of the tab
 * order and the pointer's way, and of no size in the banner's layout. A page with no subject of its
 * own takes its icon, repeated; one with neither has none.
 */
export function BannerMotif({ subject, symbol }: { subject?: BannerSubject; symbol?: ReactNode }) {
  const entry = subject && (subjectMotifs[subject.id] ?? groupMotifs[subject.group ?? '']);
  const [motif, variant] = typeof entry === 'string' ? [entry] : (entry ?? ['glyphs']);
  if (motif === 'glyphs' && !symbol) return null;
  const Art = arts[motif];
  return (
    <span className="docs-banner-motif" aria-hidden="true" inert>
      <span className="docs-motif-art" data-motif={motif} data-variant={variant}>
        <Art seed={subject?.id ?? ''} variant={variant} symbol={symbol} />
      </span>
    </span>
  );
}
