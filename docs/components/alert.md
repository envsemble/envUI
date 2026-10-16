---
title: Alert
summary: Inline banners for page- or section-level messages in four tones.
status: beta
since: 0.5.0
category: Feedback & overlays
aliases:
  - Notice
  - banner
  - callout
  - inline message
  - inline notification
related:
  - toast
  - empty-state
  - badge
  - colors
components:
  - Alert
---

# Alert

## React usage

```tsx
import { Alert, Button } from '@envsemble/envui';

<Alert
  tone="warning"
  title="Two decisions are blocked"
  action={
    <Button variant="secondary" onClick={showBlockers}>
      Review blockers
    </Button>
  }
>
  The release cannot start until both are resolved.
</Alert>;

{
  saveFailed && (
    <Alert tone="error" title="Save failed" announce onDismiss={() => setSaveFailed(false)}>
      Try again in a moment.
    </Alert>
  );
}
```

### Props & contracts

| Name         | Contract                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| tone         | info (default), success, warning or error; sets the tint, border and default icon |
| title        | Optional short heading in the alert                                               |
| children     | The message                                                                       |
| icon         | Replaces the tone's icon; false shows none                                        |
| action       | Optional action below the message, such as a Button or Link                       |
| onDismiss    | Shows a dismiss button; the application removes the alert                         |
| dismissLabel | Accessible name of the dismiss button; Dismiss by default                         |
| announce     | Warning and error alerts take the alert role and are announced at once            |
| Native props | className, id, ref and other div attributes                                       |

## Guidelines

- Use an alert for a message about a page or section that stays until it no longer applies, such as a paused sync or a blocked release. Use a toast for brief feedback about an action, and an empty state when there is no content at all.
- Info and success alerts are polite status messages. Warning and error alerts have no live role by default, because an alert present when the page loads should not interrupt; set announce when one appears because of something that just happened, such as a failed save.
- Text stays in the primary color on a light tint of the tone; the icon carries the tone. Keep the message understandable without color.
- Place the alert above the content it concerns. Offer one clear action when there is a next step, and onDismiss only when the message can safely be hidden. The dismiss button is a small circle in the alert's tone.

TypeScript declarations provide the complete public API.

## Related topics

- [Toast](../components/toast.md)
- [EmptyState](../components/empty-state.md)
- [Badge](../components/badge.md)
- [Colors & themes](../foundations/colors.md)
