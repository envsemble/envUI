---
title: Meter
summary: A measurement within a known range, such as the storage used of a quota.
status: stable
since: 1.0.0
category: Data display
aliases:
  - gauge
  - usage bar
  - usage meter
  - quota
  - capacity
  - level
  - meters
useWhen:
  - A quantity within a known range, such as storage used of a quota
  - Several limits compared at a glance, such as a plan's seats and projects
avoidWhen:
  - text: How much of a task is done, such as an upload or an import.
    use: Progress
  - text: A value people set within a range, such as a volume or a limit.
    use: Slider
components:
  - Meter
examples:
  SeatsAssigned: overview
  MeterAnatomy: anatomy
  InlineUsage: example
  LongLabel: example
---

# Meter

## Anatomy

```tsx figure=MeterAnatomy

```

1. **Meter** (`env-meter`)
2. **Label** (`env-meter-label`, `label`)
3. **Value** (`env-meter-value`, `valueText`)
4. **Track** (`env-meter-track`)
5. **Indicator** (`env-meter-indicator`, `value`)

## Behaviour

### On one line

```tsx figure=InlineUsage

```

### Adapting to width

```tsx figure=LongLabel widths="12 24" sweep

```
