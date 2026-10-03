import { ColorsPreview } from './previews/foundations/Colors';
import { TypographyPreview } from './previews/foundations/Typography';
import { SpacingPreview } from './previews/foundations/Layout';
import { IconsPreview } from './previews/foundations/Icons';
import { AccessibilityPreview } from './previews/foundations/Accessibility';
import { Preview } from './previews/Preview';

function FoundationTopic({ id }: { id: string }) {
  switch (id) {
    case 'colors':
      return <ColorsPreview />;
    case 'typography':
      return <TypographyPreview />;
    case 'spacing':
      return <SpacingPreview />;
    case 'icons':
      return <IconsPreview />;
    case 'accessibility':
      return <AccessibilityPreview />;
    default:
      return null;
  }
}

export function FoundationPreview({ id }: { id: string }) {
  return (
    <Preview>
      <FoundationTopic id={id} />
    </Preview>
  );
}
