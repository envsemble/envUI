# Stats

## React usage

```tsx
import { AnimatedNumber, Stat, StatGroup } from '@envsemble/envui';

<StatGroup aria-label="Project health">
  <Stat
    label="Active projects"
    value={<AnimatedNumber value={activeProjects} />}
    trend={{ direction: 'up', label: '+12% from last month' }}
    detail="Last 30 days"
  />
  <Stat
    label="Error rate"
    value="0.4%"
    trend={{ direction: 'up', label: '+0.1 points', tone: 'danger' }}
  />
  <Stat label="Lead time" value="2.5 days" detail="Median" />
</StatGroup>;
```

### Props & contracts

| Name                 | Contract                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Stat label           | What the figure measures, as muted text above it                                            |
| Stat value           | The figure in large tabular digits, such as formatted text or an AnimatedNumber             |
| Stat detail          | A muted line below, such as the period                                                      |
| Stat trend direction | up, down or flat; chooses the icon and the default tone                                     |
| Stat trend label     | The change in words or signs, such as +12% from last month                                  |
| Stat trend tone      | success, warning, danger or neutral; up is success, down danger and flat neutral by default |
| StatGroup tone       | pane (default), row, canvas or alternate, as for Surface; use row for a group on a pane     |
| StatGroup padding    | Spacing step 0–9; omitted uses the responsive surface padding                               |
| Native element props | Stat and StatGroup take div attributes, including aria-label, className and ref             |

## Guidelines

- Use stats for the few figures that sum up a view, such as on a dashboard. Use a Table for many values to compare, and a Meter for a quantity within a range.
- Keep labels short and put units in the value or the detail. Format numbers in the application, in the reader's locale; an AnimatedNumber value rolls to new figures as they change.
- A trend shows an icon and its label in the trend's tone, so it never depends on color. Write the label so it reads well without the icon, such as +12% or 2 fewer than last week, and set tone when a rise is bad news, as for costs and errors.
- StatGroup puts its stats on one pane in as many even columns as fit, each at least 11 rem wide; they wrap onto new rows as space runs out. A narrow group, such as on a phone, keeps two columns down to 6.5 rem each, with its figures a little smaller so they stay on one line, and stacks only below that. Gaps separate the stats, without dividers. Name the group with aria-label or aria-labelledby when it stands for a section; a named group is exposed as a group, so screen readers announce its name as people enter it.
- A Stat on its own has no surface; place it in a Card or Surface where it needs one.

TypeScript declarations provide the complete public API.

## Related topics

- [Animated numbers](../components/animated-number.md)
- [Meters & progress](../components/meters.md)
- [Surface](../components/surface.md)
- [Colors & themes](../foundations/colors.md)
