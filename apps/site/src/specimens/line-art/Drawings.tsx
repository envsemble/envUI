import { LineArt, lineArtDrawings, Surface, type LineArtDrawing } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Each drawing's name, as people say it. */
const names: Record<LineArtDrawing, string> = {
  'golden-section': 'Golden section',
  'square-circle-triangle': 'Square, circle, triangle',
  'whirling-squares': 'Whirling squares',
  'triangle-and-circles': 'Triangle and circles',
  'ford-circles': 'Ford circles',
  'harmonic-division': 'Harmonic division',
  'pappus-chain': 'Pappus chain',
  'root-rectangles': 'Root rectangles',
  'sacred-cut': 'Sacred cut',
  'gothic-tracery': 'Gothic tracery',
  'quartered-square': 'Quartered square',
  'graded-quadtree': 'Graded quadtree',
  monochord: 'Monochord',
  'logarithmic-grid': 'Logarithmic grid',
  'pointed-arcade': 'Pointed arcade',
  'root-two-halving': 'Root-two halving',
};

/** Every drawing whole, on a small sheet of its own proportions, with its name. */
export default function Drawings() {
  return (
    <Example size="collection">
      <SpecimenGrid size="small">
        {lineArtDrawings.map((drawing) => (
          <Specimen key={drawing} title={names[drawing]}>
            <Surface
              background="default"
              padding={0}
              style={{ overflow: 'hidden', inlineSize: '100%', aspectRatio: '480 / 330' }}
            >
              <LineArt drawing={drawing} />
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
