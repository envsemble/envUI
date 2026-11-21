import { Badge, List, Radio, RadioGroup, Row, Text } from '@envsemble/envui';

const plans = [
  { value: 'free', label: 'Free', description: '3 projects, community support', price: '€0' },
  { value: 'team', label: 'Team', description: 'Unlimited projects, 10 seats', price: '€12' },
  { value: 'business', label: 'Business', description: 'SSO and audit log', price: '€29' },
];

export default function PlanRows() {
  return (
    <RadioGroup
      label="Plan"
      name="plan"
      defaultValue="team"
      style={{ inlineSize: 'min(100%, 28rem)' }}
    >
      <List.Root>
        {plans.map((plan) => (
          <List.Item
            key={plan.value}
            label={plan.label}
            description={plan.description}
            end={
              <Row align="center" gap={2}>
                {plan.value === 'team' && <Badge tone="accent">Popular</Badge>}
                <Text variant="body-sm">{plan.price} per seat</Text>
              </Row>
            }
            control={<Radio value={plan.value} />}
          />
        ))}
      </List.Root>
    </RadioGroup>
  );
}
