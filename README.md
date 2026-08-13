# DoDream

An interactive 3D product experience for DoDream, a next-generation smart cane.

The 3D cane is not an ornament dropped onto a landing page — it is the page. One
product, one camera and one continuous scene run from the first screen to the
waitlist, and the copy scrolls over the top of it.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## The story

Six chapters, defined once in `src/lib/story.ts` and referenced everywhere else
by index — copy, chrome, background colour and the 3D lighting all read from the
same list.

| #   | Chapter        | What the product does                                        |
| --- | -------------- | ------------------------------------------------------------ |
| 01  | Hero           | Stands beside the headline, turning slowly                    |
| 02  | Product reveal | Centres, then the camera walks in on the handle               |
| 03  | Explore        | Holds a three-quarter shot; markers open component details    |
| 04  | Technology     | Steps back and to one side; the writing leads                 |
| 05  | Vision         | Returns to the middle of an open, dark room                   |
| 06  | Waitlist       | Lifts out of frame, leaving the invitation the whole screen   |

## How it fits together

```
src/
  lib/
    story.ts             chapters + their colour and lighting moods
    choreography.ts      camera/product keyframes on the chapter axis
    features.ts          the six hotspots: copy, anchors, focus cameras
    quality.ts           device tiers and per-tier rendering budgets
    experience-store.ts  shared state (see "Two channels" below)
    model-config.ts      where the GLB comes from, and how to switch it on
    waitlist.ts          submission — mocked locally, endpoint-ready
  components/
    3d/                  Canvas, rig, model, lighting, markers, gestures
    sections/            the six story sections
    ui/                  navbar, modal, panels, intro
    experience/          the fixed stage, the scroll driver, composition
```

### Scroll drives everything

`StageDriver` measures where each chapter sits in the document and converts
scroll position into a continuous **chapter axis** — `2.4` means "40% of the way
through chapter 03". `choreography.ts` samples camera and product poses along
that axis, so section heights can change without breaking a single shot.

Because the axis is derived from the real measured layout rather than a fixed
scroll distance, the same choreography holds on a 4K monitor and a phone.

### Two channels of state

Continuous input (scroll, pointer, drag, pinch) is written to a plain mutable
object that the render loop reads directly. It never triggers a React render.

Discrete state (which hotspot is open, which chapter, is the scene ready) lives
in a small subscribable store; components select the slice they need. The store
sits at module scope rather than in a context because the WebGL canvas runs in
its own React reconciler root.

### The 3D never breaks the page

The stage is a fixed layer stack, and the order is the guarantee:

```
z-0   backdrop         painted colour, no input
z-0   gesture surface  receives only what nothing above wanted
z-10  WebGL canvas     pointer-transparent
z-20  story copy       links, buttons and fields opt back in
z-30  hotspot markers  portalled above the copy so they stay clickable
```

Scrolling, links, the modal and the form always win. `touch-action` keeps
vertical scrolling with the browser at all times; native pinch-zoom is only
taken over while the exploration chapter is on screen.

### Same experience, different budget

`quality.ts` scores the device from core count, memory, pixel density and the
GPU string, then picks a rendering budget. What changes is resolution, shadow
fidelity, environment size and geometry density. What does not change is the
product, the story, the sections or the interactions. A sustained frame-budget
miss drops the tier one further step at runtime.

| Tier     | DPR         | Shadows   | Env | Materials |
| -------- | ----------- | --------- | --- | --------- |
| high     | 1–2         | real-time | 256 | physical  |
| balanced | 1–1.6       | contact   | 128 | physical  |
| low      | 0.85–1.25   | contact   | 64  | standard  |

Reflections come from a soft-box studio built in-scene from `Lightformer`
panels, so there is no HDRI to download at runtime.

### Interaction, per device

The verbs change; the experience does not.

|                    | Desktop                 | Touch                        |
| ------------------ | ----------------------- | ---------------------------- |
| Turn the product   | move or drag the cursor | swipe sideways               |
| Move the camera    | drag vertically         | (reserved for page scrolling)|
| Move closer        | scroll into a chapter   | pinch, while exploring       |
| Open a component   | click a marker          | tap a marker                 |
| Dismiss            | click empty space       | tap empty space              |

### Accessibility

Semantic sections, a skip link, visible focus rings, and hotspots that are real
DOM buttons — keyboard reachable while the exploration chapter is on screen and
out of the tab order otherwise. The component list in the panel is a full
equivalent of the floating markers. The waitlist dialog is labelled, modal,
focus-trapped, closes on Escape and restores focus.

`prefers-reduced-motion: reduce` stops idle rotation, pointer parallax and the
product's sway, and snaps camera moves instead of easing them. The product
stays explorable and every chapter still reads.

### When things go wrong

No WebGL, or a lost context, swaps in a drawn poster of the cane and the page
carries on — story, technology, vision and waitlist all intact. A missing or
malformed GLB falls back to the procedural product. The intro overlay releases
on a timeout even if the renderer never reports a frame.

## Swapping in the real model

See [`public/models/README.md`](public/models/README.md). Short version: drop
`dodream-cane.glb` in that folder and set `NEXT_PUBLIC_CANE_MODEL=1`.

## Connecting a real waitlist

`submitWaitlist` in `src/lib/waitlist.ts` posts to
`NEXT_PUBLIC_WAITLIST_ENDPOINT` when one is configured, and holds submissions in
`localStorage` when it is not. Nothing in the UI changes either way.

```bash
# .env.local
NEXT_PUBLIC_WAITLIST_ENDPOINT=https://api.example.com/waitlist
```

The endpoint receives `{ name, email, interest, submittedAt }` as JSON.

## A note on claims

DoDream is an early-stage concept, and the copy is written to stay there:
*designed to*, *aims to*, *built for*. No medical, safety or life-saving claims
appear anywhere on the page, and the technology section says so explicitly.
