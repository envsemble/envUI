---
'@envsemble/eslint-plugin-envui': minor
---

A new rule, `no-raw-graphics`, on as an error in `configs.recommended`, points pictures to envUI's Graphic and icons. It reports a raw `<img>`, which Graphic replaces for logos and, with `fit="cover"`, photos; a raw `<svg>` with a fixed `width`, `height` or `fill`, such as `width="24"`, outside an icon slot or a Graphic, and tells an icon component to write `width="1em" height="1em" fill="currentColor"`, as envUI's own icons do; imports from other icon packages, such as `lucide-react` or `react-icons/fa`; a `<Graphic>` without `alt`; and a margin on a `<Graphic>`, which `npx envui-graphic <file>` replaces by trimming the file's empty edges. Its `allow` option keeps an icon package you still need. See [no-raw-graphics](https://github.com/envsemble/envUI/blob/main/packages/eslint-plugin/README.md#no-raw-graphics).
