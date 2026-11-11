import { Meter, Progress, Spinner, Column } from '@envsemble/envui';

export const mount = 'standalone';

/** Meters and progress bars with and without value texts, and spinners with and without a name. */
export default function MeterFixture() {
  return (
    <Column gap={4} className="fixture-section">
      <Meter label="Storage used" value={40} />
      <Meter label="Seats assigned" value={2} max={5} aria-valuetext="2 of 5 seats" />
      <Progress label="Importing" value={null} />
      <Progress label="Uploading" value={30} />
      <Progress label="Setup" value={50} segments={4} data-testid="segmented" />
      <Spinner data-testid="quiet-spinner" />
      <Spinner label="Refreshing members" size="sm" />
    </Column>
  );
}
