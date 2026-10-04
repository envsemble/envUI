import { FeatureCard, Button } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

export function FeatureCardsFixture() {
  return (
    <section className="fixture-section">
      <h2>Standalone responsive cards</h2>
      {[true, false].map((withIcon) => (
        <FeatureCard
          key={String(withIcon)}
          data-testid={`standalone-feature-${withIcon ? 'icon' : 'plain'}`}
          icon={withIcon ? <ChevronRight /> : undefined}
          title="Connected workspace"
          description="Supporting details"
          action={<Button>Open workspace</Button>}
          style={{ width: '100%' }}
        />
      ))}
    </section>
  );
}
