import { LineArt, Row, Surface } from '@envsemble/envui';

const aligns = ['end', 'start', 'center'] as const;

export default function WhereItSits() {
  return (
    // Boxes narrower than the drawing's sheet crop it from the side away from where it sits.
    <Row gap={5}>
      {aligns.map((align) => (
        <Surface
          key={align}
          background="default"
          padding={0}
          style={{ overflow: 'hidden', inlineSize: '7rem', blockSize: '10rem' }}
        >
          <LineArt drawing="golden-section" align={align} />
        </Surface>
      ))}
    </Row>
  );
}
