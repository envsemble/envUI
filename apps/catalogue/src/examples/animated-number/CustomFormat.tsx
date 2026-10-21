import { useState } from 'react';
import { AnimatedNumber, SegmentedControl, Column, Text } from '@envsemble/envui';

const prices = { monthly: 12, yearly: 120 };
const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

export default function CustomFormat() {
  const [billing, setBilling] = useState<keyof typeof prices>('monthly');
  return (
    <Column gap={3} align="start">
      <SegmentedControl
        aria-label="Billing"
        value={billing}
        onValueChange={(value) => setBilling(value as keyof typeof prices)}
        items={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
      <Text variant="headline">
        <AnimatedNumber value={prices[billing]} formatValue={(value) => euros.format(value)} />{' '}
        <Text render={<span />} emphasis="muted">
          per seat, {billing === 'monthly' ? 'each month' : 'each year'}
        </Text>
      </Text>
    </Column>
  );
}
