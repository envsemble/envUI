---
'@envsemble/envui': patch
---

Checkbox and Switch follow the scale: the checkbox's box takes the medium icon size and the smallest corners, 1 rem in the compact scale, and the switch's thumb is half the small control height, so its track is 2.125 by 1.3125 rem in the compact scale. The comfortable sizes are unchanged. Their label rows are at least the 24 px minimum target in both scales, and a Checkbox without a visible label takes presses across a 24 px hit area, 44 px under a coarse pointer, with its box and layout unchanged. The check mark's padding snaps to whole pixels.
