---
'@envsemble/envui': patch
---

All of envUI's motion follows the motion tokens, so setting `--env-motion-duration-fast`, `--env-motion-duration-medium` and `--env-motion-duration-slow` to `0s` on `.env-theme` switches it off, as [Customize and extend](https://github.com/envsemble/envUI/blob/main/docs/customizing.md#motion) now shows with all six tokens. Notifications glide in the slow duration and a revealed one fades in the medium one, with `--env-motion-ease-enter`, and don't move with durations of `0s`. TopBar's loading bar creeps for forty slow durations, completes in the slow one with `--env-motion-ease-enter`, fades out in the fast one with `--env-motion-ease-exit`, and is removed once its fade has ended. A Spinner turns in six slow durations, a Skeleton pulses in seven and a half and an indeterminate Progress sweeps in five, about as fast as before, with `--env-motion-ease`.
