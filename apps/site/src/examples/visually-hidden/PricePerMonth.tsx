import { Text, VisuallyHidden } from '@envsemble/envui';

export default function PricePerMonth() {
  return (
    <Text variant="title">
      $12<span aria-hidden="true">/mo</span>
      <VisuallyHidden> per month</VisuallyHidden>
    </Text>
  );
}
