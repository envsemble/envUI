import { Graphic, type GraphicSize } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/** A company's logo, as an application imports its file. */
const logo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="14" fill="#0d9488"/>' +
      '<circle cx="46" cy="18" r="8" fill="#fbbf24"/>' +
      '<path d="M6 58 26 30l12 16 8-10 12 22Z" fill="#fef3c7"/>' +
      '<path d="M18 58 36 38l18 20Z" fill="#f97316"/></svg>',
  );

/** The steps it takes, from the still at md, up one size at a time. */
const sizes: GraphicSize[] = ['md', 'lg', 'xl'];

/**
 * A logo at envUI's sizes: from md it steps up, one size at a time, to the largest, and holds
 * there, a file drawn at the size it is given rather than its own.
 */
export default function GraphicTile() {
  const size = sizes[useTimeline([700, 1000, 4000])]!;
  return <Graphic src={logo} alt="Northwind" size={size} />;
}
