# Rating

## React usage

```tsx
import { Rating } from '@envsemble/envui';

<Rating value={4.5} showValue />

<Rating value={3} max={10} formatLabel={(value, max) => `${value} von ${max} Sternen`} />
```

### Props & contracts

| Name              | Contract                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------- |
| value             | The rating from 0 to max; it shows in half-star steps, and a value outside is kept within |
| max               | How many stars; 5 by default                                                              |
| showValue         | Shows the number before the stars, such as 4.5                                            |
| formatLabel       | The accessible name from the shown value and max; "4.5 out of 5 stars" by default         |
| Native span props | className, style, ref and accessible attributes on the root                               |

## Guidelines

- Use Rating to show a rating someone gave, such as an answer to a rating question. It only displays a value; to ask for a rating, offer a control such as a SegmentedControl or a Slider.
- Stars fill to the value in half steps in the warning tone; the rest show in the strong border color, so the scale reads in both themes. A half star fills its inline-start half, the right one in right-to-left text.
- The stars are one image named by formatLabel, so assistive technology reads the rating once; the number from showValue is hidden from it, since the name already says it.

TypeScript declarations provide the complete public API.

## Related topics

- [Badges & counters](../components/badges.md)
- [Stats](../components/stats.md)
