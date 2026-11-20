import { Badge, Button, Theme, type ColorScheme, Row } from '@envsemble/envui';

export const themes = true;

const emphasis = {
  primary: { variant: 'primary' },
  secondary: { variant: 'secondary' },
  outlined: { variant: 'outline' },
  destructive: { variant: 'primary', tone: 'danger' },
  important: { variant: 'primary', tone: 'accent' },
  text: { variant: 'text' },
} as const;
const variants = ['primary', 'secondary', 'outlined', 'text', 'important'] as const;

export default function ButtonCountsFixture({ theme }: { theme: ColorScheme }) {
  return (
    <Theme theme={theme} data-testid={`button-counts-${theme}`} className="fixture-section">
      <Row wrap align="center" gap={4}>
        {variants.map((variant) => (
          <Button key={variant} {...emphasis[variant]}>
            {variant} <Badge count={7} /> <Badge tone="success">New</Badge>
          </Button>
        ))}
      </Row>
      <Button data-testid={`show-tasks-${theme}`}>
        Show <strong data-testid="tasks-count">33</strong> tasks
      </Button>
      <Badge count={7} data-testid={`badge-${theme}`} />
      <Row>
        <div>
          <Button variant="text" data-testid={`text-alone-${theme}`}>
            Alex Morgan
          </Button>
        </div>
      </Row>
    </Theme>
  );
}
