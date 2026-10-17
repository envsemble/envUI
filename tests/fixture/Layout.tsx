import { useState } from 'react';
import {
  Theme,
  Card,
  Button,
  Badge,
  Disclosure,
  Stack,
  TextField,
  NavList,
  IconButton,
} from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

export function LayoutFixture() {
  const [cardActivations, setCardActivations] = useState(0);
  return (
    <>
      {(['light', 'dark'] as const).map((theme) => (
        <Theme
          key={theme}
          theme={theme}
          className="fixture-section"
          data-testid={`layout-${theme}`}
        >
          <Card data-testid="layout-card" style={{ maxInlineSize: '24rem' }}>
            <h3>Related content</h3>
            <p>A description with enough content to wrap on a narrow screen.</p>
            <Stack direction="row" wrap align="center" gap={4}>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </Stack>
            <Badge>Updated today</Badge>
            <Disclosure title={`Card guidance ${theme}`} open>
              <p>First detail</p>
              <p>Second detail</p>
            </Disclosure>
          </Card>
          <Stack data-testid="layout-stack" gap={3} style={{ maxInlineSize: '20rem' }}>
            <TextField label={`Layout field ${theme}`} />
            <Button>Fit action</Button>
            <NavList.Item selected>Destination</NavList.Item>
            <Badge>Metadata</Badge>
            <Disclosure title={`Stack guidance ${theme}`} open>
              <p>Supporting detail</p>
            </Disclosure>
          </Stack>
          <div className="fixture-shrink-row" data-testid="shrink-row">
            <span className="fixture-shrink-label">
              A long label that fills the row and squeezes what sits beside it
            </span>
            <span className="fixture-shrink-slot">
              <IconButton icon={<ChevronRight />} aria-label={`Squeezed next ${theme}`} />
            </span>
          </div>
          <Stack gap={2} data-testid="stacked-actions" style={{ maxInlineSize: '20rem' }}>
            <Button fullWidth>Continue</Button>
            <Button variant="secondary" fullWidth>
              Cancel
            </Button>
            <IconButton icon={<ChevronRight />} aria-label={`Stacked next ${theme}`} />
          </Stack>
          <Card
            render={<article />}
            heading="Shared action card"
            data-testid="flush-action-card"
            actions={<Button>Continue</Button>}
          >
            <p>Keep the action rail attached.</p>
          </Card>
          <Card
            render={<article />}
            heading="Quarterly report"
            meta="Updated today"
            data-testid="meta-action-card"
            actions={<Button variant="secondary">Open</Button>}
          >
            <p>Figures for the last three months.</p>
          </Card>
          <Card heading="Design tokens" meta="12 changes" data-testid="meta-card">
            <p>Colors and spacing shared by every surface.</p>
          </Card>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              throw new Error('Card submitted a form');
            }}
          >
            <Card
              data-testid="clickable-action"
              onClick={() => setCardActivations((value) => value + 1)}
            >
              <span>Activate card</span>
              <span data-testid="card-activations">{cardActivations}</span>
            </Card>
          </form>
          <Card href="#destination" data-testid="clickable-link">
            Open destination
          </Card>
          <Card
            disabled
            data-testid="disabled-card"
            onClick={() => setCardActivations((value) => value + 1)}
          >
            Unavailable action
          </Card>
          <Card
            href="#blocked"
            disabled
            data-testid="disabled-card-link"
            onClick={() => setCardActivations((value) => value + 1)}
          >
            Unavailable destination
          </Card>
          <Card
            layout="feature"
            headingLevel={2}
            heading="Additional content"
            description="Supporting context"
            data-testid="feature-extra"
          >
            <p>Extra detail</p>
            <p>Another detail</p>
            <Button>Explore detail</Button>
            <Disclosure title={`Feature guidance ${theme}`} open>
              <p>Available options</p>
              <ul>
                <li>First option</li>
                <li>Second option</li>
              </ul>
              <p>Choose an option</p>
            </Disclosure>
          </Card>
        </Theme>
      ))}
    </>
  );
}
