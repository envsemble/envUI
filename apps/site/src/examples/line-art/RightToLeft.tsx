import { LineArt, PageHeader, Surface } from '@envsemble/envui';

export default function RightToLeft() {
  return (
    // Right to left, the drawing sits at the banner's end, on the left, mirrored.
    <Surface
      dir="rtl"
      lang="ar"
      background="default"
      padding={6}
      style={{ position: 'relative', overflow: 'hidden', inlineSize: '100%' }}
    >
      <LineArt
        drawing="golden-section"
        style={{ position: 'absolute', insetBlock: 0, insetInlineEnd: 0, inlineSize: '48%' }}
      />
      <PageHeader
        title="تحديث الموقع"
        headingLevel={3}
        description="صفحات جديدة وبحث أسرع."
        style={{ position: 'relative', maxInlineSize: '50%' }}
      />
    </Surface>
  );
}
