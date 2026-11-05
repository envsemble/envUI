import { Graphic, Row, type GraphicSize } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { narrowGallery } from './Tiles';

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

/** Three of envUI's sizes, side by side; a step smaller in a phone's narrower tile. */
const sizes: GraphicSize[] = ['md', 'lg', 'xl'];
const narrowSizes: GraphicSize[] = ['sm', 'md', 'lg'];

/**
 * A logo at three of envUI's sizes side by side, still, aligned on their bottom edge: one file drawn
 * at the size it is given rather than its own.
 */
export default function GraphicTile() {
  const narrow = useMedia(narrowGallery);
  return (
    <Row gap={4} align="end">
      {(narrow ? narrowSizes : sizes).map((size) => (
        <Graphic key={size} src={logo} alt="Northwind" size={size} />
      ))}
    </Row>
  );
}
