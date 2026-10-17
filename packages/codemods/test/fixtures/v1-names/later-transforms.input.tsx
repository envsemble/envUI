import { ActionGroup, Button, FeatureCard, AppShellSkeleton, ActionCard } from '@envsemble/envui';

export const Actions = () => (
  <ActionGroup align="end">
    <Button>Save</Button>
  </ActionGroup>
);

export const Feature = () => <FeatureCard title="Plans" description="Pick a plan" />;

export const Loading = () => <AppShellSkeleton label="Loading" navigationItems={4} />;

export const cards = { action: ActionCard };
