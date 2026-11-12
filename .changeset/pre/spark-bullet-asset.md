---
'@envsemble/envui': patch
---

The spark that marks a bullet in formatted text ships as a local asset, `assets/spark.svg`, beside the font, instead of a `data:` URL in the stylesheet, so the stylesheet keeps to local assets only.
