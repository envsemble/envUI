---
'@envsemble/envui': major
---

TopBar: its loading bar is the only one envUI renders, so `env-loading-bar` always lies along the top bar's edge and the part that said so goes. See [TopBar](https://github.com/envsemble/envUI/blob/main/docs/components/top-bar.md).

Breaking changes:

- The part `env-loading-bar-contained` is removed: select the bar with `.env-loading-bar`, or with `.env-top-bar-loading-bar` for TopBar's.
