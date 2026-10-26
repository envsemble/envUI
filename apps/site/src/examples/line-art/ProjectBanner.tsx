import { LineArt, PageHeader, Surface } from '@envsemble/envui';

export default function ProjectBanner() {
  return (
    // The banner holds the drawing at its end, across about half its width; the header stays
    // above it, and its text keeps to the start.
    <Surface
      background="default"
      padding={6}
      style={{ position: 'relative', overflow: 'hidden', inlineSize: '100%' }}
    >
      <LineArt
        drawing="golden-section"
        style={{ position: 'absolute', insetBlock: 0, insetInlineEnd: 0, inlineSize: '48%' }}
      />
      <PageHeader
        title="Website refresh"
        headingLevel={3}
        description="New pages, faster search and a lighter look, due in March."
        style={{ position: 'relative', maxInlineSize: '50%' }}
      />
    </Surface>
  );
}
