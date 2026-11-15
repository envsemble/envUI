import { EnvUIProvider, Rating } from '@envsemble/envui';

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
