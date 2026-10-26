import { Suspense, useState } from 'react';
import { Alert, Button, Column, IconButton, Row } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Person } from '@envsemble/envui/icons/Person';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Star } from '@envsemble/envui/icons/Star';
import { LoadBoundary, lazyPart } from '../../template/LoadBoundary';
import { Loading } from '../../template/Loading';
import type { FoundationFigure } from './FoundationFigures';
import { Figure, FigureRun, type LegendEntry } from './Topic';

/*
 * The figures of the Icons foundation. Its words are in docs/foundations/icons.md, the page's one
 * source, which places each figure by name and gives it its legend.
 */

/** Icons in buttons, an icon button and a message, each in the color of its words. */
function FollowTextFigure() {
  return (
    <Figure label="Icons take the color of their text">
      <Column gap={4} align="center" inert className="catalogue-icons-sample">
        <Row gap={2} wrap justify="center" align="center">
          <Button startIcon={<Add />}>New report</Button>
          <Button variant="secondary" startIcon={<Edit />}>
            Rename
          </Button>
          <Button variant="ghost" tone="danger" startIcon={<Delete />}>
            Delete
          </Button>
          <IconButton variant="ghost" icon={<MoreVert />} aria-label="More" />
        </Row>
        <Alert tone="success" title="The report is shared with your team" />
      </Column>
    </Figure>
  );
}

const sample = [Home, Inbox, Star, Person, Settings] as const;

/** The same icons outlined and filled, named by the legend in that order. */
function OutlinedAndFilledFigure({ legend }: { legend: readonly LegendEntry[] }) {
  return (
    <FigureRun
      className="catalogue-icons-forms"
      figures={[false, true].map((filled, index) => ({
        name: legend[index]?.name ?? '',
        text: legend[index]?.text ?? '',
        picture: (
          <Row gap={4} justify="center">
            {sample.map((Symbol, key) => (
              <Symbol key={key} filled={filled} width="2rem" height="2rem" />
            ))}
          </Row>
        ),
      }))}
    />
  );
}

/** Every icon, a tool rather than a figure: its list loads when it is shown. */
const iconList = lazyPart(
  () => import('./IconCatalogue'),
  (module) => module.IconCatalogue,
  'src/previews/foundations/IconCatalogue.tsx',
);

function CatalogueFigure() {
  const [, setAttempt] = useState(0);
  const IconCatalogue = iconList.component;
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
        <IconCatalogue />
      </Suspense>
    </LoadBoundary>
  );
}

/** The figures docs/foundations/icons.md places, by name. */
export const iconsFigures: Record<string, FoundationFigure> = {
  FollowText: { render: FollowTextFigure },
  OutlinedAndFilled: { render: OutlinedAndFilledFigure, wide: true },
  Catalogue: { render: CatalogueFigure, wide: true },
};
