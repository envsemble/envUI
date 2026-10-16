# Loading

Choose by what is loading:

- A whole page or route: the loading bar, through [AppShell](../components/app-shell.md)'s `loading` prop. It appears after 200 ms so quick loads never flash it, creeps toward the end without implying a completion time, and completes and fades out when the work ends. `loadingLabel` names it, "Loading page" by default.
- Content whose shape is known: [skeletons in a LoadingState](../components/skeleton.md).
- A small area, or an update to content already shown: a [Spinner](../components/spinner.md).
- The result of an action: the `pending` state of the [Button](../components/button.md) that started it.
- A task whose completion can be measured, such as an upload: [Progress](../components/progress.md).

```tsx
import { AppShell, Button, LoadingState, Skeleton, Spinner } from '@envsemble/envui';

// Page progress: a bar along the bottom of the AppShell topbar.
<AppShell loading={router.isLoading} {...shellProps} />;

// Work in place.
<Spinner label="Refreshing seats" />;
<Button pending={saving} onClick={save}>
  Save changes
</Button>;

// Placeholders for incoming content.
<LoadingState label="Loading project">
  <Skeleton width="38%" height="1.25rem" />
  <Skeleton width="100%" height="0.8rem" />
</LoadingState>;
```

Match placeholders to expected content without implying a precise completion time, and announce loading once per region. With reduced motion, the bar fades instead of moving, skeletons stop pulsing and spinners turn slowly.
