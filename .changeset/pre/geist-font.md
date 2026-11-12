---
'@envsemble/envui': minor
---

envUI's text font is Geist, in place of Inter: `styles.css` loads one local variable face, `envUI Geist`, from regular (400) to bold (700), covering Latin, Latin-1 and Latin Extended-A, and `--env-font-family` names it. The file, `@envsemble/envui/assets/Geist.woff2`, replaces `assets/Inter.woff2` and is about half its size; `licenses/Geist-LICENSE.txt`, the SIL Open Font License, replaces Inter's. An application that refers to `envUI Inter` or the Inter file names `envUI Geist` and `Geist.woff2` instead; code keeps its monospace font.
