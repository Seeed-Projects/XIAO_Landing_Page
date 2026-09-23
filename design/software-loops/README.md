# Software card animations

Six silent 1200 × 720, 30 fps, ten-second MP4 loops accompany the official
software stories. Each has a WebP poster for loading and reduced motion.
The webpage uses native video playback; animation-authoring tools are separate
from the website runtime.

## Sources

- `ha.html`: the approved Home Assistant composition.
- `build.mjs`: five companion compositions and their timed actions; generates
  six self-contained rendering directories from these sources.
- `design.md`: shared palette, typography and scene concepts.
- `assets/`: local Montserrat fonts and GSAP 3.14.2 for reproducible rendering.
  GSAP retains its upstream license header. Montserrat is licensed under the
  SIL Open Font License; see https://github.com/JulietaUla/Montserrat.
- XIAO photographs: `public/home/playground-boards/`.
- `posters.mjs`: extracts a representative frame from each finished video,
  then uses the project's existing Sharp image library to encode WebP.

## Export

Use Node.js 22+, FFmpeg and HyperFrames 0.6.29. These tools run during asset
production; the website serves only the exported video and poster files.

From the repository root:

```bash
node design/software-loops/build.mjs /tmp/xiao-software-loops
```

For each generated directory (`ha`, `zephyr`, `gfx2`, `esphome`, `micropython`,
`sensecraft`), run:

```bash
npx hyperframes@0.6.29 lint
npx hyperframes@0.6.29 validate
npx hyperframes@0.6.29 inspect --at 0,5.5,9.9
npx hyperframes@0.6.29 render --output animation.mp4 --fps 30 --quality high --workers 2
```

Copy the finished MP4 into `public/software-animations/<id>.mp4`, then run
`node design/software-loops/posters.mjs` from the repository root.

## Playback and checks

`StoryDiagram({ id, lang })` selects an illustration and localized pause control.
`createStoryPlayback(video, source, onChange)` manages viewport visibility,
browser-tab visibility, manual pause, motion preferences and media failures.
It returns methods for those events and reports playback/poster state.

Open `/software-center/`, scroll a card into view and observe the full loop.
Scroll away and back to see it replay. Pause a card and repeat the scroll to
confirm it stays paused. Enable the system's reduced-motion preference to see
the static poster. Check at desktop and phone widths: the entire illustration
should remain visible with its original aspect ratio.
