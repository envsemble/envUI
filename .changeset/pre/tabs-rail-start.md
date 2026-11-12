---
'@envsemble/envui': patch
---

A Tabs rail with more tabs than fit starts with the chosen tab in view: the rail is its tabs' offset parent now, so it measures the chosen tab from its own start when it scrolls it into view. Inside a positioned container set in from the page's start, such as a centred frame, it once measured from the container's start and rested scrolled past the chosen tab.
