import { ColorsPreview } from './foundations/Colors';
import { TypographyPreview } from './foundations/Typography';
import { SpacingPreview } from './foundations/Spacing';
import { IconsPreview } from './foundations/Icons';
import { AccessibilityPreview } from './foundations/Accessibility';
import { CompositionPreview } from './foundations/Composition';
import { Preview } from './Preview';

interface FoundationPreviewProps {
  id: string;
  onIconUsage?: (name: string, filled: boolean) => void;
}

function FoundationTopic({ id, onIconUsage }: FoundationPreviewProps) {
  switch (id) {
    case 'colors':
      return <ColorsPreview />;
    case 'typography':
      return <TypographyPreview />;
    case 'spacing':
      return <SpacingPreview />;
    case 'icons':
      return <IconsPreview onRequestUsage={onIconUsage} />;
    case 'composition':
      return <CompositionPreview />;
    case 'accessibility':
      return <AccessibilityPreview />;
    default:
      return null;
  }
}

export function FoundationPreview(props: FoundationPreviewProps) {
  return (
    <Preview>
      <FoundationTopic {...props} />
    </Preview>
  );
}
