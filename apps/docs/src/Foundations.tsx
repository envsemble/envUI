import { ColorsPreview } from './previews/foundations/Colors';
import { TypographyPreview } from './previews/foundations/Typography';
import { SpacingPreview, ResponsivePreview } from './previews/foundations/Layout';
import { IconsPreview } from './previews/foundations/Icons';
import { MotionPreview } from './previews/foundations/Motion';
import { Preview } from './previews/Preview';

function FoundationTopic({ id }: { id: string }) {
  switch (id) {
    case 'colors':
      return <ColorsPreview />;
    case 'typography':
      return <TypographyPreview />;
    case 'spacing':
      return <SpacingPreview />;
    case 'responsive':
      return <ResponsivePreview />;
    case 'icons':
      return <IconsPreview />;
    case 'motion':
      return <MotionPreview />;
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
