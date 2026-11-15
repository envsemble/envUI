import { LineArt, Row, Surface } from '@envsemble/envui';

const aligns = ['end', 'start', 'center'] as const;

export default function WhereItSits() {
  return (
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
