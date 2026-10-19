---
'@envsemble/envui': minor
---

Content components follow EnvUIProvider's locale and messages.

- Rating shows its number in the locale's format, such as 4,5 in German, and names its stars with `messages.rating.label`, which receives the value and the scale as text in the locale's digits; `formatLabel` still overrides it.
- RelativeTime takes the provider's `locale` and `messages.relativeTime.now`; its own `locale` and `nowLabel` still win.
- AnimatedNumber's default format is the provider's locale's number format.
- CalendarHeatmap names its months, weekdays and days and writes its values in the locale, from `Intl`, and its legend comes from `messages.calendarHeatmap`; its label and format props still override them. Its tooltip is the shared tooltip popup.
- SegmentedControl writes its counts in the locale's number format, AvatarGroup separates the names in its label as the locale lists them, and Avatar's initials take the locale's capitals, from the provider's locale or, without one, the runtime's.
- Rating, DiffStat, AvatarGroup and Disclosure are client components.
