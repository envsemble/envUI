---
'@envsemble/envui': patch
---

Pages load less of envUI's JavaScript:

- The script that draws a skeleton's text as bars loads only once a skeleton shows, so a component that can be a skeleton, such as Alert, Popover or Menu, no longer brings it along.
- An icon writes the path its filled and outlined styles share once: 1,803 icons are smaller.
- Development reports, such as a Tooltip's around a child that takes no ref, and the checks behind them, are left out of production builds.
- CodeDiff loads its code themes with its highlighter, not with the page: 30 KB less before a diff shows.

Alert is 30 % smaller, and a typical application's share of envUI's own code is 5 % smaller.
