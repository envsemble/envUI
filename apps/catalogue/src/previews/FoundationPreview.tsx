import { ColorsPreview } from './foundations/Colors';
import { TypographyPreview } from './foundations/Typography';
import { SpacingPreview } from './foundations/Spacing';
import { Suspense, useState } from 'react';
import { Text } from '@envsemble/envui';
import { AccessibilityPreview } from './foundations/Accessibility';
import { CompositionPreview } from './foundations/Composition';
import { Preview } from './Preview';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';

/** The icon list, with every icon, loads with the page that shows it. */
const iconList = lazyPart(
  () => import('./foundations/Icons'),
  (module) => module.IconsPreview,
  './foundations/Icons.tsx',
  import.meta.url,
);

interface FoundationPreviewProps {
  id: string;
  onIconUsage?: (name: string, filled: boolean) => void;
}

function IconList({ onIconUsage }: Pick<FoundationPreviewProps, 'onIconUsage'>) {
  const [, setAttempt] = useState(0);
  const IconsPreview = iconList.component;
  return (
    <LoadBoundary
      what="icon list"
      modules={['src/previews/foundations/Icons.tsx']}
      onRetry={() => {
        iconList.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Text role="status">Loading icons…</Text>}>
        <IconsPreview onRequestUsage={onIconUsage} />
      </Suspense>
    </LoadBoundary>
  );
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
      return <IconList onIconUsage={onIconUsage} />;
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
