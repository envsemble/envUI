import {
  AnimatedNumber,
  DiffStat,
  EnvUIProvider,
  Rating,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';

/** German names for the stars, from the provider's messages. */
const german = {
  rating: {
    label: ({ value, max }: { value: string; max: string }) => `${value} von ${max} Sternen`,
  },
};

/** Read-only ratings and a color swatch on a button, mounted with ?fixture=ratings. */
export function RatingsFixture({ theme }: { theme: ColorScheme }) {
  return (
    <Theme theme={theme} data-testid={`ratings-${theme}`} className="fixture-section">
      <Rating value={3.5} showValue data-testid={`rating-half-${theme}`} />
      <Rating value={7} max={10} data-testid={`rating-ten-${theme}`} />
      <Rating
        value={9}
        formatLabel={(value, max) => `${value}/${max}`}
        data-testid={`rating-over-${theme}`}
      />
      <div dir="rtl">
        <Rating value={2.5} data-testid={`rating-rtl-${theme}`} />
      </div>
      {/* Numbers in the provider's locale: a decimal comma and a period between thousands. */}
      <EnvUIProvider locale="de-DE">
        <Rating value={4.5} showValue data-testid={`rating-de-${theme}`} />
        <EnvUIProvider messages={german}>
          <Rating value={3.5} data-testid={`rating-de-named-${theme}`} />
        </EnvUIProvider>
        <DiffStat additions={1234} deletions={5} data-testid={`diff-de-${theme}`} />
        <AnimatedNumber value={12800} data-testid={`number-de-${theme}`} />
      </EnvUIProvider>
    </Theme>
  );
}
