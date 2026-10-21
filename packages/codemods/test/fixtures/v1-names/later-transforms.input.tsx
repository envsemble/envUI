import { ActionGroup, Button, FeatureCard, AppShellSkeleton, ActionCard, Stack } from '@envsemble/envui';

export const Actions = () => (
  <ActionGroup align="end">
    <Button>Save</Button>
  </ActionGroup>
);

export const Feature = () => <FeatureCard title="Plans" description="Pick a plan" />;

export const Loading = () => <AppShellSkeleton label="Loading" navigationItems={4} />;

export const Details = () => <Stack direction="row" gap={2} />;

export const cards = { action: ActionCard };
