---
'@envsemble/envui': minor
---

Dev mode opens in a tab of its own and is rebuilt on today's envUI.

- The Dev mode button and Alt+Shift+D open the page in a new tab with dev mode over the whole window, marked by the `envui-dev` query parameter, which `installDevMode()` reads there; the page they came from stays as it was. Dev mode's tab has no close button and Esc doesn't leave it: closing the tab ends it. The handle's new `openInNewTab()` does the same from code; `open()`, `close()`, `toggle()` and the `open` option open and close dev mode over the page itself, as before, where Esc still closes it.
- The 3D view's toolbar is four dropdowns whose names show at once on hover: View, the angles laid out as they look at the page, Top above Front, Left and Right beside it and Tilted in the top right corner, with Fit; Show, the planes' names, padding and gaps, only the selected and color by window class; Responsive, the responsive frame, then its device and orientation, which apply while it is on; and View settings. How to move around is a button in the view's top right corner, dev mode's theme is at the foot of the node tree, the Close button is gone, and the Nodes and Inspector buttons leave the toolbar: each sidebar hides with the button in its header, which stays in that top corner of the window while the sidebar is hidden.
- The sidebars resize by their inner edge, with the grip, keys and double click of a resizable Drawer, and dev mode remembers their widths and which are hidden. The inspector's Details and Readout are Tabs, and the readout's copy button is a CopyButton.
- Dragging the 3D view always turns it: pressed on text selected across it, such as after Ctrl+A, the browser no longer drags the selection as a picture, which stopped the view turning.
- Dev mode's style sheet is in envUI's components layer, its rules on its own parts of no specificity, from envUI's tokens; picking an angle eases the view there unless reduced motion is preferred, and the legend makes way in a narrow view.
