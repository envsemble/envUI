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
    <polygon points="300,-2 476.7,304 123.3,304" />
    <circle cx="300" cy="202" r="204" />
    <circle cx="300" cy="202" r="102" />
    <line x1="300" y1="-2" x2="300" y2="406" />
    <line x1="476.7" y1="304" x2="123.3" y2="100" />
    <line x1="123.3" y1="304" x2="476.7" y2="100" />
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
  // Gothic tracery: Equilateral arches in a row, each holding two arches of half its span and the circle that touches all three, set out with compasses.
  <>
    <line x1="14" y1="204.1" x2="482" y2="204.1" />
    <path d="M14 204.1A208 208 0 0 1 118 24" />
    <path d="M118 24A208 208 0 0 1 222 204.1" />
    <path d="M14 204.1A104 104 0 0 1 66 114.1" />
    <path d="M66 114.1A104 104 0 0 1 118 204.1" />
    <path d="M118 204.1A104 104 0 0 1 170 114.1" />
    <path d="M170 114.1A104 104 0 0 1 222 204.1" />
    <circle cx="118" cy="87.9" r="52" />
    <line x1="14" y1="204.1" x2="14" y2="332" />
    <line x1="118" y1="204.1" x2="118" y2="332" />
    <path d="M222 204.1A208 208 0 0 1 326 24" />
    <path d="M326 24A208 208 0 0 1 430 204.1" />
    <path d="M222 204.1A104 104 0 0 1 274 114.1" />
    <path d="M274 114.1A104 104 0 0 1 326 204.1" />
    <path d="M326 204.1A104 104 0 0 1 378 114.1" />
    <path d="M378 114.1A104 104 0 0 1 430 204.1" />
    <circle cx="326" cy="87.9" r="52" />
    <line x1="222" y1="204.1" x2="222" y2="332" />
    <line x1="326" y1="204.1" x2="326" y2="332" />
    <path d="M430 204.1A208 208 0 0 1 534 24" />
    <path d="M534 24A208 208 0 0 1 638 204.1" />
    <path d="M430 204.1A104 104 0 0 1 482 114.1" />
    <path d="M482 114.1A104 104 0 0 1 534 204.1" />
    <path d="M534 204.1A104 104 0 0 1 586 114.1" />
    <path d="M586 114.1A104 104 0 0 1 638 204.1" />
    <circle cx="534" cy="87.9" r="52" />
    <line x1="430" y1="204.1" x2="430" y2="332" />
    <line x1="534" y1="204.1" x2="534" y2="332" />
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
  // Pythagoras tree: A square carries a 3-4-5 right triangle with a square on each of its legs, and each of those does the same, four times.
  <>
    <polygon points="235.9,365.1 336.9,365.1 336.9,264.1 235.9,264.1" />
    <polygon points="235.9,264.1 300.6,215.7 252.1,151 187.5,199.5" />
    <polygon points="187.5,199.5 205.6,137.5 143.5,119.4 125.4,181.4" />
    <polygon points="125.4,181.4 107.2,133 58.8,151.2 77,199.6" />
    <polygon points="77,199.6 42.2,177.4 19.9,212.3 54.8,234.5" />
    <polygon points="42.2,177.4 58.8,151.2 32.7,134.6 16,160.7" />
    <polygon points="107.2,133 143.5,119.4 129.9,83.1 93.6,96.7" />
    <polygon points="93.6,96.7 110.3,70.6 84.1,53.9 67.4,80.1" />
    <polygon points="110.3,70.6 129.9,83.1 142.4,63.5 122.8,51" />
    <polygon points="205.6,137.5 252.1,151 265.7,104.5 219.1,90.9" />
    <polygon points="219.1,90.9 255.4,77.3 241.8,41 205.5,54.7" />
    <polygon points="205.5,54.7 222.2,28.5 196,11.8 179.3,38" />
    <polygon points="222.2,28.5 241.8,41 254.3,21.4 234.7,8.9" />
    <polygon points="255.4,77.3 265.7,104.5 292.9,94.3 282.6,67.1" />
    <polygon points="282.6,67.1 302.3,79.6 314.8,60 295.1,47.4" />
    <polygon points="302.3,79.6 292.9,94.3 307.6,103.7 317,89" />
    <polygon points="300.6,215.7 336.9,264.1 385.4,227.8 349,179.3" />
    <polygon points="349,179.3 395.6,192.9 409.1,146.4 362.6,132.8" />
    <polygon points="362.6,132.8 398.9,119.1 385.2,82.9 348.9,96.5" />
    <polygon points="348.9,96.5 365.6,70.3 339.5,53.7 322.8,79.8" />
    <polygon points="365.6,70.3 385.2,82.9 397.7,63.2 378.1,50.7" />
    <polygon points="398.9,119.1 409.1,146.4 436.3,136.1 426.1,108.9" />
    <polygon points="426.1,108.9 445.7,121.4 458.2,101.8 438.6,89.3" />
    <polygon points="445.7,121.4 436.3,136.1 451.1,145.5 460.4,130.8" />
    <polygon points="395.6,192.9 385.4,227.8 420.3,238 430.5,203.1" />
    <polygon points="430.5,203.1 440.7,230.3 467.9,220.1 457.7,192.8" />
    <polygon points="457.7,192.8 477.3,205.3 489.8,185.7 470.2,173.2" />
    <polygon points="477.3,205.3 467.9,220.1 482.6,229.4 492,214.7" />
    <polygon points="440.7,230.3 420.3,238 427.9,258.4 448.4,250.7" />
    <polygon points="448.4,250.7 439,265.4 453.7,274.8 463.1,260.1" />
    <polygon points="439,265.4 427.9,258.4 420.9,269.4 431.9,276.5" />
  </>,
  // Sierpinski triangle: A triangle with the triangle joining its midpoints taken out, then the same in each of the three left, three times; its sides and levels run on to the edges.
  <>
    <line x1="14" y1="-2" x2="14" y2="332" />
    <line x1="106.6" y1="332" x2="299.4" y2="-2" />
    <line x1="300.6" y1="-2" x2="482" y2="312.2" />
    <line x1="14" y1="81" x2="482" y2="81" />
    <line x1="14" y1="165" x2="482" y2="165" />
    <line x1="14" y1="249" x2="482" y2="249" />
    <polygon points="203,165 397,165 300,333" />
    <polygon points="154.5,249 251.5,249 203,333" />
    <polygon points="130.3,291 178.8,291 154.5,333" />
    <polygon points="178.8,207 227.3,207 203,249" />
    <polygon points="227.3,291 275.8,291 251.5,333" />
    <polygon points="251.5,81 348.5,81 300,165" />
    <polygon points="227.3,123 275.8,123 251.5,165" />
    <polygon points="275.8,39 324.2,39 300,81" />
    <polygon points="324.2,123 372.7,123 348.5,165" />
    <polygon points="348.5,249 445.5,249 397,333" />
    <polygon points="324.2,291 372.7,291 348.5,333" />
    <polygon points="372.7,207 421.2,207 397,249" />
    <polygon points="421.2,291 469.7,291 445.5,333" />
  </>,
  // Quartered square: A square cut into quarters, the corner quarter cut again and on, each quarter left behind holding its circle on the diagonal.
  <>
    <rect x="172" y="24" width="282" height="282" />
    <line x1="172" y1="306" x2="454" y2="24" />
    <line x1="313" y1="24" x2="313" y2="306" />
    <line x1="172" y1="165" x2="454" y2="165" />
    <circle cx="242.5" cy="235.5" r="70.5" />
    <line x1="383.5" y1="24" x2="383.5" y2="165" />
    <line x1="313" y1="94.5" x2="454" y2="94.5" />
    <circle cx="348.3" cy="129.8" r="35.3" />
    <line x1="418.8" y1="24" x2="418.8" y2="94.5" />
    <line x1="383.5" y1="59.3" x2="454" y2="59.3" />
    <circle cx="401.1" cy="76.9" r="17.6" />
    <line x1="436.4" y1="24" x2="436.4" y2="59.3" />
    <line x1="418.8" y1="41.6" x2="454" y2="41.6" />
    <circle cx="427.6" cy="50.4" r="8.8" />
    <line x1="445.2" y1="24" x2="445.2" y2="41.6" />
    <line x1="436.4" y1="32.8" x2="454" y2="32.8" />
    <circle cx="440.8" cy="37.2" r="4.4" />
  </>,
  // Graded quadtree: A square quartered, and every quarter near the point at the end quartered again, four times over.
  <>
    <line x1="14" y1="-2" x2="14" y2="332" />
    <line x1="270" y1="-2" x2="270" y2="332" />
    <line x1="14" y1="165" x2="482" y2="165" />
    <line x1="142" y1="-2" x2="142" y2="165" />
    <line x1="14" y1="37" x2="270" y2="37" />
    <line x1="398" y1="-2" x2="398" y2="165" />
    <line x1="270" y1="37" x2="482" y2="37" />
    <line x1="334" y1="-2" x2="334" y2="37" />
    <line x1="270" y1="-27" x2="398" y2="-27" />
    <line x1="462" y1="-2" x2="462" y2="37" />
    <line x1="398" y1="-27" x2="482" y2="-27" />
    <line x1="334" y1="37" x2="334" y2="165" />
    <line x1="270" y1="101" x2="398" y2="101" />
    <line x1="366" y1="101" x2="366" y2="165" />
    <line x1="334" y1="133" x2="398" y2="133" />
    <line x1="462" y1="37" x2="462" y2="165" />
    <line x1="398" y1="101" x2="482" y2="101" />
    <line x1="430" y1="37" x2="430" y2="101" />
    <line x1="398" y1="69" x2="462" y2="69" />
    <line x1="494" y1="37" x2="494" y2="101" />
    <line x1="462" y1="69" x2="482" y2="69" />
    <line x1="430" y1="101" x2="430" y2="165" />
    <line x1="398" y1="133" x2="462" y2="133" />
    <line x1="494" y1="101" x2="494" y2="165" />
    <line x1="462" y1="133" x2="482" y2="133" />
    <line x1="142" y1="165" x2="142" y2="332" />
    <line x1="14" y1="293" x2="270" y2="293" />
    <line x1="398" y1="165" x2="398" y2="332" />
    <line x1="270" y1="293" x2="482" y2="293" />
    <line x1="334" y1="165" x2="334" y2="293" />
    <line x1="270" y1="229" x2="398" y2="229" />
    <line x1="366" y1="165" x2="366" y2="229" />
    <line x1="334" y1="197" x2="398" y2="197" />
    <line x1="462" y1="165" x2="462" y2="293" />
    <line x1="398" y1="229" x2="482" y2="229" />
    <line x1="430" y1="165" x2="430" y2="229" />
    <line x1="398" y1="197" x2="462" y2="197" />
    <line x1="494" y1="165" x2="494" y2="229" />
    <line x1="462" y1="197" x2="482" y2="197" />
    <line x1="430" y1="229" x2="430" y2="293" />
    <line x1="398" y1="261" x2="462" y2="261" />
    <line x1="494" y1="229" x2="494" y2="293" />
    <line x1="462" y1="261" x2="482" y2="261" />
    <line x1="334" y1="293" x2="334" y2="332" />
    <line x1="270" y1="357" x2="398" y2="357" />
    <line x1="462" y1="293" x2="462" y2="332" />
    <line x1="398" y1="357" x2="482" y2="357" />
  </>,
  // Binary tiling: Four columns of squares, each column’s squares half the size of the last and two beside each, every square holding its circle.
  <>
    <line x1="10" y1="-2" x2="10" y2="39.7" />
    <line x1="10" y1="39.7" x2="10" y2="290.3" />
    <line x1="10" y1="39.7" x2="260.7" y2="39.7" />
    <line x1="10" y1="290.3" x2="10" y2="332" />
    <line x1="10" y1="290.3" x2="260.7" y2="290.3" />
    <line x1="260.7" y1="-2" x2="260.7" y2="102.3" />
    <line x1="260.7" y1="102.3" x2="260.7" y2="227.7" />
    <line x1="260.7" y1="102.3" x2="386" y2="102.3" />
    <line x1="260.7" y1="227.7" x2="260.7" y2="332" />
    <line x1="260.7" y1="227.7" x2="386" y2="227.7" />
    <line x1="386" y1="-2" x2="386" y2="8.3" />
    <line x1="386" y1="8.3" x2="386" y2="71" />
    <line x1="386" y1="8.3" x2="448.7" y2="8.3" />
    <line x1="386" y1="71" x2="386" y2="133.7" />
    <line x1="386" y1="71" x2="448.7" y2="71" />
    <line x1="386" y1="133.7" x2="386" y2="196.3" />
    <line x1="386" y1="133.7" x2="448.7" y2="133.7" />
    <line x1="386" y1="196.3" x2="386" y2="259" />
    <line x1="386" y1="196.3" x2="448.7" y2="196.3" />
    <line x1="386" y1="259" x2="386" y2="321.7" />
    <line x1="386" y1="259" x2="448.7" y2="259" />
    <line x1="386" y1="321.7" x2="386" y2="332" />
    <line x1="386" y1="321.7" x2="448.7" y2="321.7" />
    <line x1="448.7" y1="-2" x2="448.7" y2="24" />
    <line x1="448.7" y1="24" x2="448.7" y2="55.3" />
    <line x1="448.7" y1="24" x2="480" y2="24" />
    <line x1="448.7" y1="55.3" x2="448.7" y2="86.7" />
    <line x1="448.7" y1="55.3" x2="480" y2="55.3" />
    <line x1="448.7" y1="86.7" x2="448.7" y2="118" />
    <line x1="448.7" y1="86.7" x2="480" y2="86.7" />
    <line x1="448.7" y1="118" x2="448.7" y2="149.3" />
    <line x1="448.7" y1="118" x2="480" y2="118" />
    <line x1="448.7" y1="149.3" x2="448.7" y2="180.7" />
    <line x1="448.7" y1="149.3" x2="480" y2="149.3" />
    <line x1="448.7" y1="180.7" x2="448.7" y2="212" />
    <line x1="448.7" y1="180.7" x2="480" y2="180.7" />
    <line x1="448.7" y1="212" x2="448.7" y2="243.3" />
    <line x1="448.7" y1="212" x2="480" y2="212" />
    <line x1="448.7" y1="243.3" x2="448.7" y2="274.7" />
    <line x1="448.7" y1="243.3" x2="480" y2="243.3" />
    <line x1="448.7" y1="274.7" x2="448.7" y2="306" />
    <line x1="448.7" y1="274.7" x2="480" y2="274.7" />
    <line x1="448.7" y1="306" x2="448.7" y2="332" />
    <line x1="448.7" y1="306" x2="480" y2="306" />
    <circle cx="135.3" cy="-85.7" r="125.3" />
    <circle cx="135.3" cy="165" r="125.3" />
    <circle cx="135.3" cy="415.7" r="125.3" />
    <circle cx="323.3" cy="39.7" r="62.7" />
    <circle cx="323.3" cy="165" r="62.7" />
    <circle cx="323.3" cy="290.3" r="62.7" />
    <circle cx="417.3" cy="-23" r="31.3" />
    <circle cx="417.3" cy="39.7" r="31.3" />
    <circle cx="417.3" cy="102.3" r="31.3" />
    <circle cx="417.3" cy="165" r="31.3" />
    <circle cx="417.3" cy="227.7" r="31.3" />
    <circle cx="417.3" cy="290.3" r="31.3" />
    <circle cx="417.3" cy="353" r="31.3" />
    <circle cx="464.3" cy="8.3" r="15.7" />
    <circle cx="464.3" cy="39.7" r="15.7" />
    <circle cx="464.3" cy="71" r="15.7" />
    <circle cx="464.3" cy="102.3" r="15.7" />
    <circle cx="464.3" cy="133.7" r="15.7" />
    <circle cx="464.3" cy="165" r="15.7" />
    <circle cx="464.3" cy="196.3" r="15.7" />
    <circle cx="464.3" cy="227.7" r="15.7" />
    <circle cx="464.3" cy="259" r="15.7" />
    <circle cx="464.3" cy="290.3" r="15.7" />
    <circle cx="464.3" cy="321.7" r="15.7" />
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
