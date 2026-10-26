import { LineArt, PageHeader, Surface } from '@envsemble/envui';

export default function BehindTheTitle() {
  return (
    <Surface
      background="default"
      padding={6}
      style={{ position: 'relative', overflow: 'hidden', inlineSize: '100%' }}
    >
      <LineArt drawing="harmonic-division" style={{ position: 'absolute', inset: 0 }} />
      <PageHeader
        title="Onboarding"
        headingLevel={3}
        description="A new teammate's first week."
        style={{ position: 'relative', maxInlineSize: '60%' }}
      />
    </Surface>
  );
}
