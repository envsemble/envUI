---
'@envsemble/envui': major
---

CalendarHeatmap leaves the library: a calendar of daily counts is a code host's contribution grid, the application's to design. An app that shows one copies the example on [Tooltip](https://github.com/envsemble/envUI/blob/main/docs/components/tooltip.md) into its own code: a grid of days named by its heading, one tab stop that the arrow keys, Home and End move through, each day named by its date and count and showing them in a Tooltip, with a legend hidden from assistive technology.

Breaking changes:

- `CalendarHeatmap`, `CalendarHeatmapProps`, `CalendarHeatmapDay` and `CalendarHeatmapCell` are removed, with the parts `env-calendar-heatmap`, `env-calendar-heatmap-corner`, `env-calendar-heatmap-day`, `env-calendar-heatmap-grid`, `env-calendar-heatmap-month`, `env-calendar-heatmap-pad`, `env-calendar-heatmap-scroll`, `env-calendar-heatmap-swatch`, `env-calendar-heatmap-tooltip`, `env-calendar-heatmap-tooltip-positioner`, `env-calendar-heatmap-weekday` and `env-calendar-heatmap-legend`, their states `data-date`, `data-day`, `data-level`, `data-closed` and `data-tone` (`primary`, `accent`, `neutral`, `success`, `warning`, `danger` and `done`), and EnvUIProvider's `messages.calendarHeatmap`: copy the daily activity example from Tooltip's page, an element with `role="grid"` holding a `role="row"` per weekday, whose days are each a `role="gridcell"` inside a `<Tooltip>`, colored by mixing a tone's text color, such as `var(--env-color-fg-success)`, into `var(--env-color-bg-page)`.
