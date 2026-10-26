import { LineArt, Surface } from '@envsemble/envui';

export default function LineArtAnatomy() {
  return (
    // The drawing fills the box it is given, here a surface of a banner's proportions.
    <Surface
      background="default"
      padding={0}
      style={{ overflow: 'hidden', inlineSize: '20rem', blockSize: '9rem' }}
    >
      <LineArt drawing="pappus-chain" />
    </Surface>
  );
}
