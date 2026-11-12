---
'@envsemble/envui': minor
---

Every public custom property has a contract:

- The token list, `src/generated/tokens.json`, also lists the hand-written tokens, `--env-radius-full`, `--env-viewport-gutter` and `--env-type-display`, marked `handwritten`, and `--env-line-height-body` is a token now, 1.4, which an application may set as before.
- The part contract lists each component's other public custom properties under `properties`, with what each does and whether an application sets or reads it: Popup's `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, Tooltip's `--env-tooltip-opacity` and `--env-tooltip-shadow`, Scaffold's `--env-scaffold-sticky-top`, LineArt's `--env-line-art-duration`, IconButton's `--env-icon-button-hit-area` and TableOfContents' `--env-table-of-contents-depth`.
- Every other custom property is private, such as the badge, count, key and diff stat hooks a control sets on what it holds, the avatar rings and `--env-table-of-contents-stroke`; the docs no longer name them.
