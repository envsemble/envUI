import { Button, EmptyState, Graphic } from '@envsemble/envui';

const drawing =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 96" fill="none">' +
      '<rect x="20" y="16" width="120" height="72" rx="10" stroke="#000" stroke-width="2"/>' +
      '<rect x="34" y="32" width="56" height="8" rx="4" fill="#000" opacity=".5"/>' +
      '<rect x="34" y="48" width="92" height="6" rx="3" fill="#000" opacity=".25"/>' +
      '<rect x="34" y="62" width="72" height="6" rx="3" fill="#000" opacity=".25"/></svg>',
  );

export default function WithIllustration() {
  return (
    <EmptyState
      illustration={<Graphic src={drawing} alt="" size="xl" aspect="5/3" tint="text" />}
      title="No reports yet"
      description="Reports you schedule show here."
      actions={<Button variant="primary">Schedule a report</Button>}
    />
  );
}
