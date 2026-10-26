import type { ReactNode } from 'react';

/*
 * The picture behind a catalogue banner's text: plain geometric figures set out in thin lines, as
 * on a draughtsman's sheet, all drawn one width at any size (Banners.css). A handful of sheets take
 * turns, one to a page, chosen by its id, so a page always shows the same one.
 */
const sheets: readonly ReactNode[] = [
  // A square on the top edge, a half circle rising from the foot, a leaning panel and a triangle.
  <>
    <polygon points="44,-4 112,-4 100,334 24,334" />
    <rect x="112" y="-4" width="236" height="236" />
    <circle cx="232" cy="362" r="128" />
    <polygon points="350,168 452,236 372,346" />
  </>,
  // The envUI mark's circle and pill, crossed by one long line.
  <>
    <circle cx="318" cy="96" r="118" />
    <rect x="150" y="226" width="380" height="152" rx="76" />
    <line x1="40" y1="334" x2="484" y2="-4" />
  </>,
  // Arcs about the far corner, and a square turned a little across them.
  <>
    <circle cx="480" cy="330" r="110" />
    <circle cx="480" cy="330" r="200" />
    <circle cx="480" cy="330" r="290" />
    <rect x="150" y="54" width="124" height="124" transform="rotate(14 212 116)" />
  </>,
  // A square set out with its diagonals and its circle, on a line through its middle.
  <>
    <rect x="186" y="28" width="274" height="274" />
    <line x1="186" y1="28" x2="460" y2="302" />
    <line x1="460" y1="28" x2="186" y2="302" />
    <circle cx="323" cy="165" r="137" />
    <line x1="120" y1="165" x2="484" y2="165" />
  </>,
  // A triangle standing on the foot, a circle above its shoulder and a square beside it.
  <>
    <polygon points="132,334 304,22 476,334" />
    <circle cx="410" cy="92" r="66" />
    <rect x="58" y="70" width="112" height="112" />
  </>,
];

/** The sheet a page shows, the same each time: its id's characters summed, in turns. */
const sheetOf = (subject = '') =>
  [...subject].reduce((sum, character) => sum + character.charCodeAt(0), 0) % sheets.length;

/** A catalogue banner's line drawing, hidden from assistive technology. */
export function CatalogueBannerLines({ subject }: { subject?: string }) {
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <svg
        className="catalogue-banner-lines"
        viewBox="0 0 480 330"
        preserveAspectRatio="xMaxYMid slice"
        data-sheet={sheetOf(subject)}
        focusable="false"
      >
        {sheets[sheetOf(subject)]}
      </svg>
    </span>
  );
}
