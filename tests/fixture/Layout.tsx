import { useState } from 'react';
import {
  Theme,
  Card,
  ActionGroup,
  Button,
  InfoChip,
  DisclosureNote,
  Stack,
  Input,
  NavigationItem,
  IconButton,
  ActionCard,
  ClickableCard,
  FeatureCard,
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
            <ActionGroup>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </ActionGroup>
            <InfoChip>Updated today</InfoChip>
            <DisclosureNote title={`Card guidance ${theme}`} open>
              <p>First detail</p>
              <p>Second detail</p>
            </DisclosureNote>
          </Card>
          <Stack data-testid="layout-stack" gap={3} style={{ maxInlineSize: '20rem' }}>
            <Input label={`Layout field ${theme}`} />
            <Button>Fit action</Button>
            <NavigationItem selected>Destination</NavigationItem>
            <InfoChip>Metadata</InfoChip>
            <DisclosureNote title={`Stack guidance ${theme}`} open>
              <p>Supporting detail</p>
            </DisclosureNote>
          </Stack>
          <ActionGroup stacked data-testid="stacked-actions" style={{ maxInlineSize: '20rem' }}>
            <Button>Continue</Button>
            <Button variant="secondary">Cancel</Button>
            <IconButton icon={<ChevronRight />} aria-label={`Stacked next ${theme}`} />
          </ActionGroup>
          <ActionCard
            title="Shared action card"
            data-testid="flush-action-card"
            actions={<Button>Continue</Button>}
          >
            <p>Keep the action rail attached.</p>
          </ActionCard>
          <ActionCard
            title="Quarterly report"
            meta="Updated today"
            data-testid="meta-action-card"
            actions={<Button variant="secondary">Open</Button>}
          >
            <p>Figures for the last three months.</p>
          </ActionCard>
          <Card heading="Design tokens" meta="12 changes" data-testid="meta-card">
            <p>Colors and spacing shared by every surface.</p>
          </Card>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              throw new Error('Card submitted a form');
            }}
          >
            <ClickableCard
              data-testid="clickable-action"
              onClick={() => setCardActivations((value) => value + 1)}
            >
              <span>Activate card</span>
              <span data-testid="card-activations">{cardActivations}</span>
            </ClickableCard>
          </form>
          <ClickableCard href="#destination" data-testid="clickable-link">
            Open destination
          </ClickableCard>
          <ClickableCard
            disabled
            data-testid="disabled-card"
            onClick={() => setCardActivations((value) => value + 1)}
          >
            Unavailable action
          </ClickableCard>
          <ClickableCard
            href="#blocked"
            disabled
            data-testid="disabled-card-link"
            onClick={() => setCardActivations((value) => value + 1)}
          >
            Unavailable destination
          </ClickableCard>
          <FeatureCard
            title="Additional content"
            description="Supporting context"
            data-testid="feature-extra"
          >
            <p>Extra detail</p>
            <p>Another detail</p>
            <Button>Explore detail</Button>
            <DisclosureNote title={`Feature guidance ${theme}`} open>
              <p>Available options</p>
              <ul>
                <li>First option</li>
                <li>Second option</li>
              </ul>
              <p>Choose an option</p>
            </DisclosureNote>
          </FeatureCard>
        </Theme>
      ))}
    </>
  );
}
