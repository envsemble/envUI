import { EnvUIProvider, Rating } from '@envsemble/envui';

/** German: the number with its decimal comma, 4,5, and the name "4,5 von 5 Sternen". */
const messages = {
  rating: {
    label: ({ value, max }: { value: string; max: string }) => `${value} von ${max} Sternen`,
  },
};

export default function TranslatedLabel() {
  return (
    <EnvUIProvider locale="de" messages={messages}>
      <Rating lang="de" value={4.5} showValue />
    </EnvUIProvider>
  );
}
