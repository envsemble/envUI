import { Button, ColorSwatch, Rating, Theme, type ThemeValue } from '@envsemble/envui';

/** Read-only ratings and a color swatch on a button, mounted with ?fixture=ratings. */
export function RatingsFixture({ theme }: { theme: ThemeValue }) {
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
      <Button variant="secondary" startIcon={<ColorSwatch color="#ffffff" />}>
        #FFFFFF {theme}
      </Button>
    </Theme>
  );
}
