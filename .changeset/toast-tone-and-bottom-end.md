---
'@envsemble/envui': major
---

Toast takes the 1.0 vocabulary and reads in every language and direction.

- A notification's `variant` is `tone`: `neutral`, `success`, `info` or `danger`, where `error` was. `ToastVariant` is `ToastTone`.
- The `bottom-right` placement is `bottom-end`, the default, which is the left edge in right-to-left text and keeps clear of that side's safe area; the `top-center` stack is centred in either direction.
- A danger notification is an alert as it appears, read once and outside any polite region, readable without moving focus to its region first, and never waits behind the count of older notifications: it takes its place first. The other notifications are read by a polite status beside the regions, and a swipe toward the end of the line dismisses one, to the left in right-to-left text.
- The region names, now Notifications and Top notifications, the hidden count and the dismiss button's name come from `EnvUIProvider`'s `messages.toast`. The dismiss button is a CloseButton.
- The manual `Toast` component and `ToastProps` are deleted.
- Classes: `env-toast-{variant}` is `.env-toast[data-tone]`, and `env-toast-viewport-{placement}` is `.env-toast-viewport[data-placement]`.

Migrate with the codemods: `envui-codemods v1-props` moves `variant` and `placement` in `useToast().show({ … })` object literals and `defaultPlacement` on Toast.Provider, and reports an argument it can't read; `v1-names` renames `ToastVariant`; `v1-classes` rewrites the classes.
