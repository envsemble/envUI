import type { ReactNode } from 'react';

/*
 * The picture behind a catalogue banner's text: a geometric construction in thin lines, as on a
 * draughtsman's sheet, every line one hairline at any size (Banners.css). Each sheet follows one
 * rule, named above it. They take turns, one to a page, chosen by its id, so a page always shows
 * the same one. Coordinates are computed (the work's banner generator) in a 480 by 330 sheet.
 */
const sheets: readonly ReactNode[] = [
  // Golden section: A golden rectangle cut into squares, each with its quarter arc, the two diagonals crossing at the spiral’s pole.
  <>
    <rect x="29.1" y="30" width="436.9" height="270" />
    <line x1="299.1" y1="30" x2="299.1" y2="300" />
    <path d="M29.1 300A270 270 0 0 1 299.1 30" />
    <line x1="299.1" y1="196.9" x2="466" y2="196.9" />
    <path d="M299.1 30A166.9 166.9 0 0 1 466 196.9" />
    <line x1="362.9" y1="196.9" x2="362.9" y2="300" />
    <path d="M466 196.9A103.1 103.1 0 0 1 362.9 300" />
    <line x1="299.1" y1="236.3" x2="362.9" y2="236.3" />
    <path d="M362.9 300A63.7 63.7 0 0 1 299.1 236.3" />
    <line x1="338.5" y1="196.9" x2="338.5" y2="236.3" />
    <path d="M299.1 236.3A39.4 39.4 0 0 1 338.5 196.9" />
    <line x1="338.5" y1="221.2" x2="362.9" y2="221.2" />
    <path d="M338.5 196.9A24.3 24.3 0 0 1 362.9 221.2" />
    <line x1="347.8" y1="221.2" x2="347.8" y2="236.3" />
    <path d="M362.9 221.2A15 15 0 0 1 347.8 236.3" />
    <line x1="338.5" y1="227" x2="347.8" y2="227" />
    <path d="M347.8 236.3A9.3 9.3 0 0 1 338.5 227" />
    <line x1="29.1" y1="30" x2="466" y2="300" />
    <line x1="299.1" y1="300" x2="466" y2="30" />
  </>,
  // Square, circle, triangle: One square holds its circle, its triangle and its diagonals; its edges and midlines run on as a grid of half-squares.
  <>
    <line x1="96" y1="-2" x2="96" y2="332" />
    <line x1="216" y1="-2" x2="216" y2="332" />
    <line x1="336" y1="-2" x2="336" y2="332" />
    <line x1="456" y1="-2" x2="456" y2="332" />
    <line x1="96" y1="45" x2="482" y2="45" />
    <line x1="96" y1="165" x2="482" y2="165" />
    <line x1="96" y1="285" x2="482" y2="285" />
    <circle cx="336" cy="165" r="120" />
    <polygon points="216,285 336,45 456,285" />
    <line x1="216" y1="45" x2="456" y2="285" />
    <line x1="456" y1="45" x2="216" y2="285" />
  </>,
  // Log-polar grid: Rays every 15° and circles growing by e^(π/12), so every cell is the same shape at a new size.
  <>
    <circle cx="480" cy="165" r="36" />
    <circle cx="480" cy="165" r="46.8" />
    <circle cx="480" cy="165" r="60.8" />
    <circle cx="480" cy="165" r="79" />
    <circle cx="480" cy="165" r="102.6" />
    <circle cx="480" cy="165" r="133.3" />
    <circle cx="480" cy="165" r="173.2" />
    <circle cx="480" cy="165" r="225" />
    <circle cx="480" cy="165" r="292.3" />
    <circle cx="480" cy="165" r="379.8" />
    <line x1="480" y1="201" x2="480" y2="544.8" />
    <line x1="470.7" y1="199.8" x2="381.7" y2="531.9" />
    <line x1="462" y1="196.2" x2="290.1" y2="493.9" />
    <line x1="454.5" y1="190.5" x2="211.4" y2="433.6" />
    <line x1="448.8" y1="183" x2="151.1" y2="354.9" />
    <line x1="445.2" y1="174.3" x2="113.1" y2="263.3" />
    <line x1="444" y1="165" x2="100.2" y2="165" />
    <line x1="445.2" y1="155.7" x2="113.1" y2="66.7" />
    <line x1="448.8" y1="147" x2="151.1" y2="-24.9" />
    <line x1="454.5" y1="139.5" x2="211.4" y2="-103.6" />
    <line x1="462" y1="133.8" x2="290.1" y2="-163.9" />
    <line x1="470.7" y1="130.2" x2="381.7" y2="-201.9" />
    <line x1="480" y1="129" x2="480" y2="-214.8" />
  </>,
  // Whirling squares: Each square’s corners stand a fifth of the way along the last one’s sides, so the corners trace four spirals.
  <>
    <polygon points="187,22 473,22 473,308 187,308" />
    <polygon points="244.2,22 473,79.2 415.8,308 187,250.8" />
    <polygon points="290,33.4 461.6,125 370,296.6 198.4,205" />
    <polygon points="324.3,51.7 443.3,159.3 335.7,278.3 216.7,170.7" />
    <polygon points="348.1,73.3 421.7,183.1 311.9,256.7 238.3,146.9" />
    <polygon points="362.8,95.2 399.8,197.8 297.2,234.8 260.2,132.2" />
    <polygon points="370.2,115.7 379.3,205.2 289.8,214.3 280.7,124.8" />
    <polygon points="372,133.6 361.4,207 288,196.4 298.6,123" />
  </>,
  // Triangle and circles: An equilateral triangle between its incircle and circumcircle, half the size, its three axes drawn as diameters.
  <>
    <polygon points="334,42 483,300 185,300" />
    <circle cx="334" cy="214" r="172" />
    <circle cx="334" cy="214" r="86" />
    <line x1="334" y1="42" x2="334" y2="386" />
    <line x1="483" y1="300" x2="185" y2="128" />
    <line x1="185" y1="300" x2="483" y2="128" />
  </>,
  // Seed of life: Six circles centred round a seventh, each through its centre, inside the circle of twice their radius.
  <>
    <circle cx="330" cy="165" r="148" />
    <circle cx="330" cy="165" r="74" />
    <circle cx="330" cy="91" r="74" />
    <circle cx="394.1" cy="128" r="74" />
    <circle cx="394.1" cy="202" r="74" />
    <circle cx="330" cy="239" r="74" />
    <circle cx="265.9" cy="202" r="74" />
    <circle cx="265.9" cy="128" r="74" />
  </>,
  // Ford circles: A circle on the line at every fraction p/q from ½ to 1, its diameter 1/q², each touching its neighbours.
  <>
    <line x1="-2" y1="312" x2="482" y2="312" />
    <circle cx="470" cy="-48" r="360" />
    <circle cx="110" cy="222" r="90" />
    <circle cx="230" cy="272" r="40" />
    <circle cx="290" cy="289.5" r="22.5" />
    <circle cx="182" cy="297.6" r="14.4" />
    <circle cx="326" cy="297.6" r="14.4" />
    <circle cx="350" cy="302" r="10" />
    <circle cx="161.4" cy="304.7" r="7.3" />
    <circle cx="264.3" cy="304.7" r="7.3" />
    <circle cx="367.1" cy="304.7" r="7.3" />
    <circle cx="200" cy="306.4" r="5.6" />
    <circle cx="380" cy="306.4" r="5.6" />
    <circle cx="150" cy="307.6" r="4.4" />
    <circle cx="310" cy="307.6" r="4.4" />
    <circle cx="390" cy="307.6" r="4.4" />
  </>,
  // Harmonic division: A rectangle’s diagonal crossed by lines from its corner cuts the width into halves, thirds, quarters and on.
  <>
    <line x1="30" y1="44" x2="482" y2="44" />
    <line x1="30" y1="286" x2="482" y2="286" />
    <line x1="30" y1="-2" x2="30" y2="332" />
    <line x1="466" y1="-2" x2="466" y2="332" />
    <line x1="466" y1="44" x2="30" y2="286" />
    <line x1="248" y1="-2" x2="248" y2="332" />
    <line x1="320.7" y1="-2" x2="320.7" y2="332" />
    <line x1="357" y1="-2" x2="357" y2="332" />
    <line x1="378.8" y1="-2" x2="378.8" y2="332" />
    <line x1="393.3" y1="-2" x2="393.3" y2="332" />
    <line x1="403.7" y1="-2" x2="403.7" y2="332" />
    <line x1="466" y1="286" x2="30" y2="44" />
    <line x1="466" y1="286" x2="248" y2="44" />
    <line x1="466" y1="286" x2="320.7" y2="44" />
    <line x1="466" y1="286" x2="357" y2="44" />
    <line x1="466" y1="286" x2="378.8" y2="44" />
    <line x1="466" y1="286" x2="393.3" y2="44" />
  </>,
  // Pappus chain: Three semicircles on one line, an arbelos, and a chain of circles each touching its neighbours and two of the arcs.
  <>
    <line x1="26" y1="312" x2="482" y2="312" />
    <path d="M26 312A220 220 0 0 1 466 312" />
    <path d="M202 312A132 132 0 0 1 466 312" />
    <path d="M26 312A88 88 0 0 1 202 312" />
    <circle cx="188.1" cy="173.1" r="69.5" />
    <circle cx="295.7" cy="141.7" r="42.6" />
    <circle cx="362.5" cy="156.7" r="25.9" />
    <circle cx="399.2" cy="178.3" r="16.7" />
    <circle cx="420.1" cy="197.2" r="11.5" />
    <circle cx="432.8" cy="212.4" r="8.3" />
    <circle cx="441" cy="224.4" r="6.3" />
    <circle cx="446.5" cy="234.1" r="4.9" />
    <circle cx="450.4" cy="241.9" r="3.9" />
    <circle cx="453.3" cy="248.4" r="3.2" />
  </>,
  // Root rectangles: From a square, each diagonal swung down to the base gives the next rectangle: √2, √3, 2, √5.
  <>
    <line x1="266" y1="-2" x2="266" y2="332" />
    <line x1="466" y1="270" x2="266" y2="70" />
    <path d="M266 70A282.8 282.8 0 0 0 183.2 270" />
    <line x1="183.2" y1="-2" x2="183.2" y2="332" />
    <line x1="466" y1="270" x2="183.2" y2="70" />
    <path d="M183.2 70A346.4 346.4 0 0 0 119.6 270" />
    <line x1="119.6" y1="-2" x2="119.6" y2="332" />
    <line x1="466" y1="270" x2="119.6" y2="70" />
    <path d="M119.6 70A400 400 0 0 0 66 270" />
    <line x1="66" y1="-2" x2="66" y2="332" />
    <line x1="466" y1="270" x2="66" y2="70" />
    <path d="M66 70A447.2 447.2 0 0 0 18.8 270" />
    <line x1="18.8" y1="-2" x2="18.8" y2="332" />
    <line x1="466" y1="270" x2="18.8" y2="70" />
    <line x1="18.8" y1="70" x2="482" y2="70" />
    <line x1="18.8" y1="270" x2="482" y2="270" />
    <line x1="466" y1="-2" x2="466" y2="332" />
  </>,
  // Bipolar circles: Two families of circles about two points, those around them and those through them, crossing at right angles.
  <>
    <circle cx="495.9" cy="165" r="121.1" />
    <circle cx="216.1" cy="165" r="121.1" />
    <circle cx="447.9" cy="165" r="59.6" />
    <circle cx="264.1" cy="165" r="59.6" />
    <circle cx="431.9" cy="165" r="29.5" />
    <circle cx="280.1" cy="165" r="29.5" />
    <circle cx="356" cy="235" r="99" />
    <circle cx="356" cy="165" r="70" />
    <circle cx="356" cy="95" r="99" />
    <line x1="356" y1="-2" x2="356" y2="332" />
    <line x1="95.1" y1="165" x2="482" y2="165" />
  </>,
  // Sacred cut: Arcs from a square’s corners through its centre cut each side, and the cuts run on as a nine-square grid.
  <>
    <rect x="201" y="34" width="262" height="262" />
    <line x1="201" y1="34" x2="463" y2="296" />
    <line x1="463" y1="34" x2="201" y2="296" />
    <path d="M386.3 34A185.3 185.3 0 0 1 201 219.3" />
    <path d="M463 219.3A185.3 185.3 0 0 1 277.7 34" />
    <path d="M277.7 296A185.3 185.3 0 0 1 463 110.7" />
    <path d="M201 110.7A185.3 185.3 0 0 1 386.3 296" />
    <line x1="386.3" y1="-2" x2="386.3" y2="332" />
    <line x1="277.7" y1="-2" x2="277.7" y2="332" />
    <line x1="201" y1="219.3" x2="482" y2="219.3" />
    <line x1="201" y1="110.7" x2="482" y2="110.7" />
  </>,
  // Gothic tracery: An equilateral arch holding two arches of half its span and the circle that touches all three, set out with compasses.
  <>
    <path d="M224 226.4A236 236 0 0 1 342 22" />
    <path d="M342 22A236 236 0 0 1 460 226.4" />
    <path d="M224 226.4A118 118 0 0 1 283 124.2" />
    <path d="M283 124.2A118 118 0 0 1 342 226.4" />
    <path d="M342 226.4A118 118 0 0 1 401 124.2" />
    <path d="M401 124.2A118 118 0 0 1 460 226.4" />
    <circle cx="342" cy="94.5" r="59" />
    <line x1="224" y1="226.4" x2="224" y2="332" />
    <line x1="342" y1="226.4" x2="342" y2="332" />
    <line x1="460" y1="226.4" x2="460" y2="332" />
    <line x1="224" y1="226.4" x2="460" y2="226.4" />
  </>,
  // Circles in an angle: Circles that touch both arms of an angle and each other, each larger than the last by the same ratio.
  <>
    <line x1="37.6" y1="165" x2="450.9" y2="-2" />
    <line x1="37.6" y1="165" x2="450.9" y2="332" />
    <line x1="37.6" y1="165" x2="482" y2="165" />
    <circle cx="917.7" cy="165" r="329.7" />
    <circle cx="438" cy="165" r="150" />
    <circle cx="219.8" cy="165" r="68.2" />
    <circle cx="120.5" cy="165" r="31" />
    <circle cx="75.3" cy="165" r="14.1" />
    <circle cx="54.7" cy="165" r="6.4" />
  </>,
];

/** The sheet a page shows, the same each time: its id's characters summed, in turns. */
const sheetOf = (subject = '') =>
  [...subject].reduce((sum, character) => sum + character.charCodeAt(0), 0) % sheets.length;

/** A catalogue banner's line drawing, hidden from assistive technology. */
export function CatalogueBannerLines({ subject }: { subject?: string }) {
  const sheet = sheetOf(subject);
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <svg
        className="catalogue-banner-lines"
        viewBox="0 0 480 330"
        preserveAspectRatio="xMaxYMid slice"
        data-sheet={sheet}
        focusable="false"
      >
        {sheets[sheet]}
      </svg>
    </span>
  );
}
