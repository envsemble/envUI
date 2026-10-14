# Notices

## React usage

```tsx
import { Button, Notice } from '@envsemble/envui';

<Notice
  tone="warning"
  title="Two decisions are blocked"
  action={
    <Button variant="secondary" onClick={showBlockers}>
      Review blockers
    </Button>
  }
>
  The release cannot start until both are resolved.
</Notice>;

{
  saveFailed && (
    <Notice tone="error" title="Save failed" announce onDismiss={() => setSaveFailed(false)}>
      Try again in a moment.
    </Notice>
  );
}
```

### Props & contracts

| Name         | Contract                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| tone         | info (default), success, warning or error; sets the tint, border and default icon |
| title        | Optional short heading in the notice                                              |
| children     | The message                                                                       |
| icon         | Replaces the tone's icon; false shows none                                        |
| action       | Optional action below the message, such as a Button or Link                       |
| onDismiss    | Shows a dismiss button; the application removes the notice                        |
| dismissLabel | Accessible name of the dismiss button; Dismiss by default                         |
| announce     | Warning and error notices become alerts, announced at once                        |
| Native props | className, id, ref and other div attributes                                       |

## Guidelines

- Use a notice for a message about a page or section that stays until it no longer applies, such as a paused sync or a blocked release. Use a toast for brief feedback about an action, and an empty state when there is no content at all.
- Info and success notices are polite status messages. Warning and error notices have no live role by default, because a notice present when the page loads should not interrupt; set announce when one appears because of something that just happened, such as a failed save.
- Text stays in the primary color on a light tint of the tone; the icon carries the tone. Keep the message understandable without color.
- Place the notice above the content it concerns. Offer one clear action when there is a next step, and onDismiss only when the message can safely be hidden. The dismiss button is a small circle in the notice's tone.

TypeScript declarations provide the complete public API.

## Related topics

- [Toasts](../components/toasts.md)
- [Empty states](../components/empty-state.md)
- [Badges & counters](../components/badges.md)
- [Colors & themes](../foundations/colors.md)
