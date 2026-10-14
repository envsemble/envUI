# Loading

## React usage

```tsx
import { AppShell, Button, LoadingBar, LoadingState, Skeleton, Spinner } from '@envsemble/envui';

// Page progress: under the AppShell topbar, or at the top of the viewport.
<AppShell loading={router.isLoading} {...shellProps} />;
<LoadingBar active={isNavigating} />;

// Work in place.
<Spinner label="Refreshing seats" />;
<Button pending={saving} onClick={save}>
  Save changes
</Button>;

// Placeholders for incoming content.
<LoadingState label="Loading project">
  <Skeleton width="38%" height="1.25rem" />
  <Skeleton width="100%" height="0.8rem" />
  <Skeleton width="72%" height="0.8rem" />
</LoadingState>;
```

### Props & contracts

| Name                          | Contract                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| LoadingBar active             | Shows progress while true; the bar then completes and fades out                            |
| LoadingBar delay              | Milliseconds before it appears, 200 by default, so quick loads never flash it              |
| LoadingBar contained          | Pin it to the top of its positioned container instead of the viewport                      |
| LoadingBar label              | Accessible name of the progress bar while it shows; "Loading" by default                   |
| Spinner label / size          | Accessible name, or none when a busy control announces the work; small, standard or large  |
| Button pending                | A spinner replaces the content at the same size; the button is busy and ignores activation |
| Skeleton width / height       | CSS dimensions appropriate for anticipated content                                         |
| LoadingState label / children | Accessible loading announcement and visual placeholders                                    |

## Guidelines

- Choose by what is loading:
  - A whole page or route: the loading bar, through AppShell's loading prop.
  - Content whose shape is known: skeletons in a LoadingState.
  - A small area, or an update to content already shown: a spinner.
  - The result of an action: the pending state of the button that started it.
- The loading bar creeps toward the end without implying a completion time and completes when the work ends.
- Match placeholders to expected content without implying a precise completion time.
- Announce loading once per region. With reduced motion, the bar fades instead of moving, skeletons stop pulsing and spinners turn slowly.

TypeScript declarations provide the complete public API.

## Related topics

- [Application shell](../components/app-shell.md)
- [Buttons](../components/buttons.md)
- [Empty states](../components/empty-state.md)
- [Cards](../components/cards.md)
- [Accessibility](../foundations/accessibility.md)
