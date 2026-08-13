# DoDream cane model

Drop the production model here as **`dodream-cane.glb`**, then switch it on:

```bash
# .env.local
NEXT_PUBLIC_CANE_MODEL=1
```

(or set `FORCE_GLB = true` in `src/lib/model-config.ts` if you would rather not
use an environment variable).

That is the whole swap. Nothing else in the site needs to change.

## What happens to your file

`SmartCaneModel` measures the GLB and normalises it into **cane space** before
anything else sees it:

| Cane space   | Meaning                        |
| ------------ | ------------------------------ |
| `y = -1`     | the tip of the ferrule         |
| `y = +1`     | the top of the handle          |
| `x = z = 0`  | the axis of the shaft          |
| `+z`         | the direction the sensors face |

So the model can be any size, in any units, centred anywhere — the camera
choreography and the hotspot anchors keep working. If the model faces the wrong
way or needs a nudge in scale, adjust `GLB_ADJUST` in
`src/lib/model-config.ts`.

## Hotspot placement (optional)

The six markers fall back to the anchors in `src/lib/features.ts`. To place
them from the model instead, add empties named:

```
hotspot_handle     hotspot_haptics    hotspot_battery
hotspot_sensors    hotspot_body       hotspot_detection
```

Any that exist win; any that are missing use the code-side anchor. This lets
the model author move a marker without a code change.

## Keep it light

The whole scene budget assumes a product in the low hundreds of KB:

- Draco or Meshopt compression (both are handled by the loader)
- KTX2/Basis textures if the model is textured at all — the procedural model
  uses one 128px canvas (the grip knurl) and nothing else, and the studio
  environment does the heavy lifting for the look
- Merge meshes where you can; the procedural model is ~17 draw calls
- No animation tracks are read, and no cameras or lights are used from the file

## If the file is missing or broken

The procedural model renders in its place and the page carries on without an
error. That is deliberate: the model is an asset, not a dependency.

## The procedural model

`components/3d/ProceduralCane.tsx` reproduces the product from the three-view
reference in `public/references/smart-cane-model-ref.png`. Its constants are
measurements off that image, so it is the reference for proportions until the
real GLB lands.
