import { LineArt, Surface } from '@envsemble/envui';

export default function LineArtAnatomy() {
  return (
    // The drawing fills the box it is given, here a surface of a banner's proportions, which keeps
    // them as it narrows.
    <Surface
      background="default"
      padding={0}
      style={{ overflow: 'hidden', inlineSize: 'min(100%, 20rem)', aspectRatio: '20 / 9' }}
    >
      <LineArt drawing="pappus-chain" />
    </Surface>
  );
}
