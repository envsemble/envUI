import { Button, Column, Text, VisuallyHidden } from '@envsemble/envui';

export default function VisuallyHiddenFixture() {
  return (
    <Column gap={4} className="fixture-section">
      <VisuallyHidden render={<h2 />}>Plan</VisuallyHidden>
      <Text data-testid="price">
        $12<span aria-hidden="true">/mo</span>
        <VisuallyHidden> per month</VisuallyHidden>
      </Text>
      <Button data-testid="save">
        Save<VisuallyHidden data-testid="hidden"> draft</VisuallyHidden>
      </Button>
      <Button data-testid="plain-save">Save</Button>
    </Column>
  );
}
