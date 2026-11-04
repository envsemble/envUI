---
title: Graphic
summary: The application's own logo, icon or picture, from a file or an SVG component, at one of envUI's sizes, contained and centered in its box.
status: beta
since: 1.0.0
category: Data display
aliases:
  - logo
  - brand mark
  - image
  - picture
  - img
  - svg
  - custom icon
  - own icon
  - illustration
  - artwork
useWhen:
  - The application's or a company's logo, such as beside the application's name or in a sign-in button
  - An icon of the application's own, where envUI has none for it
  - A picture from a file, such as an empty state's illustration, a photo or a screenshot's thumbnail
avoidWhen:
  - text: An icon envUI already has, among its thousands of symbols.
    see: icons
  - text: A person's or an organization's picture beside their name.
    use: Avatar
  - text: A drawing in hairlines that fills a region, such as behind a sign-in form.
    use: LineArt
components:
  - Graphic
examples:
  SignInWithLogo: overview
  AppLogo:
    role: overview
    caption: The application's logo beside its name.
  Sizes: variants
  InText: example
  FillBox: example
  PhotoThumbnails:
    role: example
    caption: A photo covering a box of its own shape, at full width and as a list row's thumbnail.
  Colors: example
  OwnIcons: example
  ListIcons: example
  TrimmedLogo:
    role: do
    caption: A file trimmed to its drawing fills its box.
  PaddedLogo:
    role: dont
    caption: 'A file with empty edges: the logo looks small and far from its name.'
---

# Graphic

## Variants

```tsx figure=Sizes

```

1. **Icon**
2. **Small**
3. **Medium**
4. **Large**
5. **Extra large**

| Size        | Use for                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Icon        | An icon or a logo in a button, a menu, navigation or a list row: its slot's icon. The default. |
| Small       | The application's logo in a top bar, beside a small avatar.                                    |
| Medium      | A logo beside a name in a list or a card, as large as an avatar there.                         |
| Large       | A logo beside a name with a second line, such as an account header.                            |
| Extra large | The largest, such as on a sign-in screen or a profile page.                                    |

### In a line of text

A graphic in a sentence or a heading takes the size of its text and sits on the line as an icon does.

```tsx figure=InText

```

### Filling its box

A graphic can fill a box of the layout's own, such as an empty state's picture area, contained in it whatever the box's shape.

```tsx figure=FillBox

```

### Photos and screenshots

A photo or a screenshot can cover a box of its own shape instead, cropped at its edges rather than shown whole with space beside it.

- Give the box the shape of the pictures it shows, such as wide for screenshots.
- Keep logos and icons whole: crop only a picture whose edges can go.

```tsx figure=PhotoThumbnails

```

### Colors

A graphic keeps its own colors. A one-color mark or icon can take the color of the text around it instead, so it follows the theme and the button it sits in.

```tsx figure=Colors

```

| Color      | Use for                                                                |
| ---------- | ---------------------------------------------------------------------- |
| Its own    | A logo in its brand colors, a picture or an illustration. The default. |
| Text color | A one-color mark or icon that should read as an icon among envUI's.    |

## Behaviour

### Its size is never the file's

A graphic's box is one of envUI's sizes, and the picture is contained and centered in it, never stretched or cut.

- A file of any size, or an SVG that writes its own width and height, shows at the size chosen.
- A file wider or taller than square keeps its shape, centered in the square.

### In icon slots

Every place that takes an icon, such as a button, a menu item, navigation or a list row, sizes and centers whatever it is given.

- A graphic there takes the slot's icon size, the same as envUI's icons beside it.

```tsx figure=OwnIcons

```

```tsx figure=ListIcons

```

## Rules

Trim a file to its drawing once, when it joins the application, so its box holds the drawing and no empty space.

```tsx figure=TrimmedLogo

```

```tsx figure=PaddedLogo

```

### envUI's icons first

Use one of envUI's icons wherever one fits, and a graphic only for what is the application's own, such as its logo or an icon of a feature only it has.

### Sizes

Choose a size of the place, not of the file: the slot's icon, or the size of the avatars around it.

- Leave a margin off a graphic: empty space around the drawing belongs trimmed from the file.

## Accessibility

### envUI provides

- A graphic with `alt` named as an image by it, with `role="img"`, whether from a file or an SVG component.
- A graphic with an empty `alt` hidden from assistive technology, as decoration.
- In a button, a menu or navigation, the icon slot hides it, since the label names the action.

### You provide

- `alt`: what the picture says, such as the company's name, or `""` when the text beside it says it already.
- Contrast for a picture that carries meaning: its own colors aren't checked against the theme; `tint="text"` takes the text color's.

## Words to use

| Words                  | In code                                                               | Use for                                                          |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Our logo               | `Graphic` with the logo file in `src` and the company's name in `alt` | The application's or a company's logo, at one of envUI's sizes.  |
| Our own icon           | `Graphic` with the icon's SVG component as children, in an icon slot  | An icon envUI doesn't have, beside envUI's own.                  |
| A photo or a thumbnail | `size="fill"` or a step, with `aspect="16/9"` and `fit="cover"`       | A photo or a screenshot that covers a box of its shape.          |
| As large as an avatar  | `size="sm"`, `"md"`, `"lg"` or `"xl"`                                 | A logo the size of the avatars or the text around it.            |
| In the text color      | `tint="text"`                                                         | A one-color mark that follows the theme and the button it is in. |
| Trim the logo          | `npx envui-graphic <file>`                                            | A file with empty space around its drawing.                      |

## Compose

### Usage

A graphic takes a file in `src`, such as an imported PNG, WebP, JPEG or SVG, or an SVG component as its children, and `alt`, which TypeScript requires.

```tsx
import logo from './logo.svg';

<Graphic src={logo} alt="Northwind" size="md" />
<Button startIcon={<Graphic src={logo} alt="" />}>Sign in with Northwind</Button>
<Graphic alt="" tint="text">
  <PipelineIcon />
</Graphic>
```

- `size="icon"`, the default, reads `--env-icon-size`, which an icon slot sets, else `--env-control-icon-size`; `text` sits a little below the middle of the line, as an icon in text does.
- `size="fill"` is a block as wide as its container, and as tall where the container has a definite height; otherwise an `img` takes its own shape's height, and a file in the text color is square.
- `aspect`, such as `"16/9"`, sets the box's `aspect-ratio`: a step is then its height, and a fill takes its height from its width, so it needs no height from its container. `fit="cover"` covers the box and crops a file's picture, for a photo or a screenshot.
- The picture is an `img` with `object-fit: contain`, or `cover`, or the SVG at 100% of the box, in a grid of fixed tracks, so its size never comes from the file. An SVG component needs a `viewBox`; its `width` and `height` don't count.
- `tint="text"` paints an SVG component's filled and stroked shapes in `currentColor`, and a file through a CSS mask of its shape. A file from another origin needs CORS for the mask.

#### Trim a file once

`npx envui-graphic <file>` crops a PNG, WebP or JPEG to its visible content, its transparent or one-color border, and fits an SVG's `viewBox` to its drawing. It writes the trimmed file next to the original, or into `--out <dir>`, and prints the Graphic to use. It reads the files with `sharp`, which envUI doesn't install: add it with `npm install --save-dev sharp`.

```sh
npx envui-graphic src/assets/logo.png
```

### Composition

Every icon slot, the `env-icon` wrapper of Button, IconButton, Menu, navigation, Tabs, Badge, fields and list rows, sizes and centers any child, an `img`, an `svg` or a Graphic, to its `--env-icon-size`. List.Item's and Combobox's `start` give an application's own `svg` or `img` the icon size too, and List.Item's an envUI symbol as well. TopBar's and PageHeader's `start` set a small and a medium picture's size, for a Graphic of the icon size and an `svg` or `img` alike, while an `svg` that follows the text, such as an envUI symbol, keeps its size.

### Customize

`--env-picture-size-sm`, `-md`, `-lg` and `-xl` hold the sizes from `sm` to `xl`, which Avatar and AvatarGroup take too, so they stay the same. The [lint rule `no-raw-graphics`](https://github.com/envsemble/envUI/blob/main/packages/eslint-plugin/README.md#no-raw-graphics) reports a raw `img`, an `svg` with a fixed size, another icon package, a Graphic without `alt` and a margin on one.

## Changelog

- **1.0.0**: Graphic, the application's own logos, icons and pictures at envUI's sizes.
