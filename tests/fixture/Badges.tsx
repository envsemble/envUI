import {
  Badge,
  Drawer,
  Rail,
  Column,
  Surface,
  Theme,
  type BadgeTone,
  type ThemeValue,
} from '@envsemble/envui';
import { Inbox } from '@envsemble/envui/icons/Inbox';

const tones: BadgeTone[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'];

export function BadgesFixture({ theme }: { theme: ThemeValue }) {
  return (
    <Theme theme={theme} data-testid={`badges-${theme}`} className="fixture-section">
      {(['canvas', 'pane', 'row'] as const).map((surface) => (
        <Surface
          key={surface}
          background={surface === 'canvas' ? 'page' : surface === 'row' ? 'muted' : 'default'}
          padding={4}
          data-surface={surface}
        >
          <Column gap={2}>
            {(['soft', 'solid', 'outline'] as const).map((variant) => (
              <div key={variant} className="fixture-actions">
                {tones.map((tone) => (
                  <Badge key={tone} tone={tone} variant={variant} data-testid="badge">
                    {tone} {variant}
                  </Badge>
                ))}
              </div>
            ))}
            <div className="fixture-actions">
              {tones.map((tone) => (
                <span
                  key={tone}
                  data-testid="tone-text"
                  style={{ color: `var(--env-color-fg-${tone === 'neutral' ? 'muted' : tone})` }}
                >
                  {tone}
                </span>
              ))}
            </div>
          </Column>
        </Surface>
      ))}
      <Drawer
        aria-label={`Badges ${theme}`}
        destinations={[{ label: 'Inbox', icon: <Inbox />, href: '#inbox', count: 12 }]}
      />
      <Rail
        aria-label={`Badges rail ${theme}`}
        destinations={[{ label: 'Inbox', icon: <Inbox />, href: '#inbox', count: 12 }]}
      />
    </Theme>
  );
}
