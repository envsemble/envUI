---
'@envsemble/envui': patch
---

TableOfContents' marker of the reader's place keeps its shape as it moves: it follows the scroll as it is, and glides calmly to a section further away in `--env-motion-duration-medium` with `--env-motion-ease-enter`, rather than trailing behind on springs that stretched, leaned and wobbled it as it landed. The current label's color changes in `--env-motion-duration-fast` with `--env-motion-ease-enter`, ahead of the marker, so only one label reads as current, and the swell under the pointer grows in `--env-motion-duration-fast` without popping past its size.
