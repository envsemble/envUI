---
'@envsemble/envui': patch
---

Progress and Meter draw their track's edge at 3:1 against the surface, as a switch that is off does, so the track's extent stays clear in the light theme. A segmented Progress draws each segment's fill as `.env-progress-segment::before`, over that edge.
