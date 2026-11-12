---
'@envsemble/envui': patch
---

ButtonGroup's buttons meet with a hairline between them and small inner corners, `--env-radius-xs`, so the group reads as one control with pill ends rather than buttons side by side; outline buttons in a group share their edge. It joins buttons of one variant, and filled primary and secondary buttons together, such as a split button; a group that mixes an outline, ghost or text button with another variant, such as an outline Cancel beside a primary Save, keeps them apart as whole pills a small gap from each other.
