import { ColorsPreview } from './foundations/Colors';
import { TypographyPreview } from './foundations/Typography';
import { SpacingPreview } from './foundations/Spacing';
import { ScalePreview } from './foundations/Scale';
import { ResponsivePreview } from './foundations/Responsive';
import { Suspense, useState } from 'react';
import { AccessibilityPreview } from './foundations/Accessibility';
import { CompositionPreview } from './foundations/Composition';
import { ExampleStage } from './Example';
import { Preview } from './Preview';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';
import { Loading } from '../template/Loading';

/** The icon list, with every icon, loads with the page that shows it. */
const iconList = lazyPart(
  () => import('./foundations/Icons'),
  (module) => module.IconsPreview,
  'src/previews/foundations/Icons.tsx',
);

interface FoundationPreviewProps {
  id: string;
}

function IconList() {
  const [, setAttempt] = useState(0);
  const IconsPreview = iconList.component;
  return (
    <LoadBoundary
      what="icon list"
      modules={iconList.modules}
      onRetry={() => {
        iconList.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Loading what="icons" />}>
        <IconsPreview />
      </Suspense>
    </LoadBoundary>
  );
}

function FoundationTopic({ id }: FoundationPreviewProps) {
  switch (id) {
    case 'colors':
      return <ColorsPreview />;
    case 'typography':
      return <TypographyPreview />;
    case 'spacing':
      return <SpacingPreview />;
    case 'scale':
      return <ScalePreview />;
    case 'responsive':
      return <ResponsivePreview />;
    case 'icons':
      return <IconList />;
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
      {/* Every figure sits on a stage: an example's is the recessed canvas, and an explanation of
          the system sits on the page; the icon list is a tool, not a figure. */}
      <ExampleStage value={props.id !== 'icons'}>
        <FoundationTopic {...props} />
      </ExampleStage>
    </Preview>
  );
}
