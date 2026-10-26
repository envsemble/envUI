import { LineArt, PageHeader, Surface } from '@envsemble/envui';

export default function OneAtTheEnd() {
  return (
    <Surface
      background="default"
      padding={6}
      style={{ position: 'relative', overflow: 'hidden', inlineSize: '100%' }}
    >
      <LineArt
        drawing="harmonic-division"
        style={{ position: 'absolute', insetBlock: 0, insetInlineEnd: 0, inlineSize: '40%' }}
      />
      <PageHeader
        title="Onboarding"
        headingLevel={3}
        description="A new teammate's first week."
        style={{ position: 'relative', maxInlineSize: '60%' }}
      />
    </Surface>
  );
}
