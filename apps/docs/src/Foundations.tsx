import { ColorsPreview } from './previews/foundations/Colors';
import { TypographyPreview } from './previews/foundations/Typography';
import { SpacingPreview } from './previews/foundations/Layout';
import { IconsPreview } from './previews/foundations/Icons';
import { AccessibilityPreview } from './previews/foundations/Accessibility';
import { CompositionPreview } from './previews/foundations/Composition';
import { Preview } from './previews/Preview';

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
