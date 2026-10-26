import { LineArt, PageHeader, Surface } from '@envsemble/envui';

export default function CroppedFromItsStart() {
  return (
    // As the banner narrows, the drawing keeps its end in view and loses its start.
    <Surface
      background="default"
      padding={6}
      style={{ position: 'relative', overflow: 'hidden', inlineSize: '100%' }}
    >
      <LineArt
        drawing="root-two-halving"
        style={{ position: 'absolute', insetBlock: 0, insetInlineEnd: 0, inlineSize: '48%' }}
      />
      <PageHeader
        title="Quarterly report"
        headingLevel={3}
        description="Figures for January to March."
        style={{ position: 'relative', maxInlineSize: '50%' }}
      />
    </Surface>
  );
}
