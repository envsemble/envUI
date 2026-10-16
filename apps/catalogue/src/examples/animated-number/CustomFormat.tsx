import { useState } from 'react';
import { AnimatedNumber, SegmentedControl, Stack, Text } from '@envsemble/envui';

const prices = { monthly: 12, yearly: 120 };
const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

export default function CustomFormat() {
  const [billing, setBilling] = useState<keyof typeof prices>('monthly');
  return (
    <Stack gap={3} align="start">
      <SegmentedControl
        aria-label="Billing"
        value={billing}
        onValueChange={(value) => setBilling(value as keyof typeof prices)}
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
      <Text variant="page-heading">
        <AnimatedNumber value={prices[billing]} format={(value) => euros.format(value)} />{' '}
        <Text as="span" tone="muted">
          per seat, {billing === 'monthly' ? 'each month' : 'each year'}
        </Text>
      </Text>
    </Stack>
  );
}
