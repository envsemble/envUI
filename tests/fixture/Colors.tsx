import {
  Theme,
  Button,
  IconButton,
  NavigationItem,
  Stack,
  Surface,
  Card,
  GroupedRows,
  Row,
  Tabs,
  Link,
  DirectionLink,
  Input,
  Select,
  RadioGroup,
  Radio,
  Checkbox,
  Switch,
  InfoChip,
  Skeleton,
  Toast,
  type ThemeValue,
  type ButtonVariant,
} from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Home } from '@envsemble/envui/icons/Home';
import { planOptions } from './SelectOptions.js';

export function ColorControls({ theme }: { theme: ThemeValue }) {
  const variants: readonly ButtonVariant[] = [
    'primary',
    'secondary',
    'outlined',
    'destructive',
    'important',
  ];
  return (
    <Theme theme={theme} data-testid={`color-controls-${theme}`} className="fixture-section">
      <h2>{theme} interactive colors</h2>
      {variants.map((variant) => (
        <Button key={variant} variant={variant} data-testid={`${theme}-button-${variant}`}>
          {theme} {variant}
        </Button>
      ))}
      <IconButton
        icon={<ChevronRight />}
        aria-label={`${theme} chevron`}
        data-testid={`${theme}-icon-button`}
      />
      <NavigationItem icon={<Home />} data-testid={`${theme}-navigation`}>
        {theme} navigation
      </NavigationItem>
      <NavigationItem selected data-testid={`${theme}-navigation-selected`}>
        {theme} selected navigation
      </NavigationItem>
      <Stack gap={3}>
        <Surface tone="row" data-testid={`${theme}-color-surface`}>
          Surface
        </Surface>
        <Surface data-testid={`${theme}-color-pane`}>Pane</Surface>
        <Card data-testid={`${theme}-color-card`}>Card</Card>
        <Card tone="pane" data-testid={`${theme}-color-pane-card`}>
          Pane card
        </Card>
        <Card tone="canvas" data-testid={`${theme}-color-canvas-card`}>
          Canvas card
        </Card>
        <GroupedRows>
          <Row title="Row" data-testid={`${theme}-color-row`} />
        </GroupedRows>
        <GroupedRows contrast data-testid={`${theme}-color-contrast-rows`}>
          <Row title="Contrast row" />
        </GroupedRows>
        <Tabs
          aria-label={`${theme} color isolation tabs`}
          data-testid={`${theme}-color-tabs`}
          items={[
            {
              value: 'primary',
              button: <Button data-testid={`${theme}-tab-primary`}>First tab</Button>,
              content: 'First panel',
            },
            {
              value: 'secondary',
              button: (
                <Button variant="secondary" data-testid={`${theme}-tab-secondary`}>
                  Second tab
                </Button>
              ),
              content: 'Second panel',
            },
            {
              value: 'navigation',
              button: (
                <NavigationItem icon={<Home />} data-testid={`${theme}-tab-navigation`}>
                  Third tab
                </NavigationItem>
              ),
              content: 'Third panel',
            },
          ]}
        />
        <Link href="#" data-testid={`${theme}-color-link`}>
          Inline link
        </Link>
        <Button variant="text" data-testid={`${theme}-color-text-button`}>
          Text button
        </Button>
        <DirectionLink direction="next" href="#" data-testid={`${theme}-color-direction`}>
          Next page
        </DirectionLink>
        <Input label={`${theme} isolated field`} data-testid={`${theme}-color-field`} />
        <Input
          label={`${theme} isolated error`}
          error="Validation error"
          data-testid={`${theme}-color-error-field`}
        />
        <Select
          label={`${theme} isolated select`}
          hint="Select hint"
          options={planOptions}
          defaultValue="starter"
          data-testid={`${theme}-color-select`}
        />
        <Select
          label={`${theme} isolated select error`}
          error="Select validation error"
          options={planOptions}
          defaultValue="starter"
          data-testid={`${theme}-color-select-error`}
        />
        <RadioGroup variant="rows" data-testid={`${theme}-color-radio-row`}>
          <Radio
            value="sample"
            label={`${theme} isolated radio`}
            data-testid={`${theme}-color-radio`}
          />
        </RadioGroup>
        <Checkbox
          label={`${theme} isolated checkbox`}
          defaultChecked
          data-testid={`${theme}-color-checkbox`}
        />
        <Switch
          label={`${theme} isolated switch`}
          defaultChecked
          data-testid={`${theme}-color-switch`}
        />
        <InfoChip data-testid={`${theme}-color-chip`}>Info</InfoChip>
        <Skeleton data-testid={`${theme}-color-skeleton`} />
        <Toast
          variant="error"
          message="Error preview"
          action={{ label: 'Toast action', onClick: () => {} }}
          announce={false}
          data-testid={`${theme}-color-error-toast`}
        />
      </Stack>
    </Theme>
  );
}
