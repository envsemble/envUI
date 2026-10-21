---
title: Dashboard
summary: A page inside the app frame with the workspace's key figures for a period and panels of activity, storage, goals, recent documents, what's due and alerts.
status: beta
since: 1.0.0
frame: app
aliases:
  - dashboard
  - overview page
  - home page
  - metrics
  - analytics page
  - reports overview
  - KPIs
useWhen:
  - People start their day from a summary of how the work is going, then go to the details.
  - A handful of figures and short lists answer the questions people ask most often.
avoidWhen:
  - text: Comparing or acting on many objects of one kind.
    see: index-page
  - text: One object's facts and activity.
    see: details-page
composes:
  - Page
  - PageHeader
  - Select
  - Button
  - Column
  - Row
  - Stat
  - Surface
  - Text
  - CalendarHeatmap
  - Meter
  - Progress
  - Table
  - Link
  - RelativeTime
  - List
  - Badge
  - EmptyState
related:
  - stat
  - calendar-heatmap
  - meter
  - progress
  - empty-states
---

# Dashboard

## Overview

The workspace's overview inside the [app frame](app-frame.md): four figures for the chosen period with their trends, then panels of activity, storage, goals, recent documents, what's due soon and alerts. The panels share rows and wrap, two or three to a row on a desktop and one on a phone. Start from it for an application's home page or a team's overview. envUI has no line or bar charts: the page uses figures, meters, progress bars and a calendar heatmap, and doesn't fake a chart.

```tsx template=DashboardPage

```

## Anatomy

1. **Header:** a [PageHeader](../components/page-header.md), "Dashboard", with `controlSize="sm"` and two actions: a [Select](../components/select.md) "Period", Last 7, 30 or 90 days, and an "Export" [Button](../components/button.md) link.
2. **Figures:** a [Stat.Group](../components/stat.md) of four `Stat.Root`s, each with its label, value and `trend`. The trend's `tone` says whether the change is good news: fewer open tasks and a shorter lead time are `success`, more open tasks and a longer lead time `danger`.
3. **Panels:** a [Row](../components/row.md) that wraps, each panel a `section` on a muted [Surface](../components/surface.md), named by its `h2`:
   - **Activity:** a [CalendarHeatmap](../components/calendar-heatmap.md) of the tasks completed each day;
   - **Storage:** a [Meter](../components/meter.md) of the space used, with a line on what takes it;
   - **Goals:** three [Progress](../components/progress.md) bars, each with its count;
   - **Recent documents:** a compact [Table](../components/table.md), `density="sm"`, with a [Link](../components/link.md) per document and [RelativeTime](../components/relative-time.md);
   - **Due soon:** a [List](../components/list.md) of tasks with their due dates as [Badge](../components/badge.md)s, formatted with `Intl.DateTimeFormat` in the reader's language;
   - **Alerts:** an [EmptyState](../components/empty-state.md), "No alerts", that says what would show there.

## States and behaviour

- **Period:** choosing another period changes the figures and their trends at once; the other panels show the present, so they stay. Keep the period in the address.
- **Export:** a link to the report for the chosen period, which the browser downloads. For a report that takes a while, start it and say when it's ready with a toast that carries a Download action ([Notifications and feedback](../patterns/feedback.md)).
- **Empty panels:** a panel with nothing to show keeps its place and says so in its own words, as Alerts does; the page never hides a panel people look for.
- **Loading:** show each panel as a skeleton, with `skeleton` on its surface, while its data arrives, panel by panel, rather than one spinner for the page.
- **A panel fails:** replace its content with an EmptyState with `tone="danger"` and "Try again", and keep the other panels.
- **Widths:** the page is `width="full"`. On a desktop the panels share rows of two or three, the wide ones taking more of a row; on a tablet they share rows of one or two; on a phone each takes the width, the figures stack and the table's rows stack.

### Connect your data

- Replace `stats`, `goals`, `documents`, `upcoming` and `completedPerDay` with your service's data for the period.
- Point "Export" and the documents' links at your routes; they're plain paths through the application's `LinkProvider` ([setup](../setup.md)).
- Write each trend's label as a change with its period, "+12% from last month", and choose its direction by whether the number went up or down. Set its `tone` where that direction is good or bad news against the default, as for open tasks and lead time ([Stat](../components/stat.md#variants-and-sizes)).

## Content guidelines

- Label figures with a noun phrase that says what is measured, "Tasks done", "Median lead time", and keep the value short, with its unit: "2.5 days".
- Format dates and numbers in the application, in the reader's language: "Due 6 Mar" in British English, "Due Mar 6" in American.
- Title panels with what they show, and keep each to one question people ask.
- An empty panel's title states the fact, "No alerts", and its description says what would appear ([Empty states](../foundations/content.md#empty-states)).

## Do and don't

### Do

- Lead with the few figures people check every day, and link onwards to the details.
- Show every figure's period, in the header's Select and the group's name.
- Give the meter and progress bars an `aria-valuetext` that says what is counted.

### Don't

- Don't draw charts from boxes and colors of your own; use the figures and bars envUI has, or a chart library styled with envUI's tokens.
- Don't fill the page with every metric there is; a dashboard answers a few questions well.
- Don't leave a trend in its default tone when its direction is bad news, such as more open tasks; and don't rely on the tone alone, since the arrow and the label say what changed.

## Accessibility

### Landmarks and headings

- The frame's `nav` "Primary" and one `main`.
- One `h1`, "Dashboard", in the PageHeader; each panel is a region named by its `h2`, and the Alerts empty state's title is an `h3`.
- The figures are a group named by their period; the heatmap, the table and the list are named.

### envUI provides

- Stats with their labels, values and trends read in order, with the trend's direction in words.
- A Meter and Progress bars with their roles, values and value text; a heatmap whose days each have a name and a tooltip.
- A table that stacks its rows on a phone, keeping its roles.

### You provide

- The figures' period in the group's name, and the values' units.
- `aria-valuetext` on each meter and progress bar.
- What a panel shows when it is empty or fails.
