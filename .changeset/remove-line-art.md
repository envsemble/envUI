---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

LineArt is gone: envUI no longer ships decorative drawings or their motion.

Breaking changes:

- `LineArt`, `lineArtDrawings` and the types `LineArtProps`, `LineArtDrawing` and `LineArtMotion` are removed, with the part `env-line-art`, its property `--env-line-art-duration` and its states `data-align` (`data-align='center'`, `data-align='end'`, `data-align='start'`); `data-drawing` (`data-drawing='ford-circles'`, `data-drawing='golden-section'`, `data-drawing='gothic-tracery'`, `data-drawing='graded-quadtree'`, `data-drawing='harmonic-division'`, `data-drawing='logarithmic-grid'`, `data-drawing='monochord'`, `data-drawing='pappus-chain'`, `data-drawing='pointed-arcade'`, `data-drawing='quartered-square'`, `data-drawing='root-rectangles'`, `data-drawing='root-two-halving'`, `data-drawing='sacred-cut'`, `data-drawing='square-circle-triangle'`, `data-drawing='triangle-and-circles'`, `data-drawing='whirling-squares'`); `data-motion` (`data-motion='appear'`, `data-motion='disappear'`, `data-motion='loop'`, `data-motion='play'`); `data-turn` (`data-turn='in'`, `data-turn='out'`). Draw an illustration of the application's own as an SVG in a Graphic instead.
