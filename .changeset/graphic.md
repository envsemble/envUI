---
'@envsemble/envui': minor
---

New: `Graphic`, an application's own logo, icon or picture at envUI's sizes, from a file in `src`, such as an imported PNG or SVG, or an SVG component as its children. `size` is `icon`, the default, the icon size of the slot it sits in, such as Button's `startIcon`, `text`, the size of the text around it, `sm`, `md`, `lg` and `xl`, Avatar's sizes, or `fill`, its container's box. The picture is contained and centered in that box, never stretched and never at the file's size. It keeps its own colors, and `tint="text"` paints a one-color picture in the text color: an SVG component's shapes in `currentColor`, a file through a CSS mask, which a file from another origin needs CORS for. `alt` is required: it names the graphic as an image, and `alt=""` hides it as decoration. The parts are `env-graphic`, with `data-size` and `data-tint`, `env-graphic-image` and `env-graphic-mask`. See [Graphic](https://github.com/envsemble/envUI/blob/main/docs/components/graphic.md).

`npx envui-graphic <file> [--out <dir>]` trims a file's empty edges once, when it joins the application: it crops a PNG, WebP or JPEG to its visible content and fits an SVG's `viewBox` to its drawing, writes the trimmed file, and prints the Graphic to use. It needs `sharp`, which envUI doesn't install: add it as a dev dependency of the application to run it.

Every icon slot sizes and centers whatever it holds, an `img` or a component as well as an `svg`, to its icon size, so an application's own picture there no longer shows at its file's size. List.Item's and Combobox's `start` give an application's own `svg` or `img` the icon size too, TopBar's `start` a small picture's and PageHeader's a medium one's.

The picture sizes are tokens, `--env-picture-size-sm`, `-md`, `-lg` and `-xl`, 1.5, 2, 3 and 5.5 rem in both scales, which Avatar, AvatarGroup and Graphic take.
