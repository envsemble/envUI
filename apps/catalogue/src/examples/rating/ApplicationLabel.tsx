import { EnvUIProvider, Rating } from '@envsemble/envui';

/** The accessible name in the application's own words, such as "Rated 4.5 out of 5 stars". */
const messages = {
  rating: {
    label: ({ value, max }: { value: string; max: string }) => `Rated ${value} out of ${max} stars`,
  },
};

export default function ApplicationLabel() {
  return (
    <EnvUIProvider messages={messages}>
      <Rating value={4.5} showValue />
    </EnvUIProvider>
  );
}
