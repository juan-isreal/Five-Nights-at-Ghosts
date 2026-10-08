# Five Nights at Ghosts

A web-based 3D horror survival game inspired by Five Nights at Freddy's (FNAF). Built with Vite, React, TypeScript, and React Three Fiber.

## Gameplay

You're trapped in a haunted office from 12 AM to 6 AM. A ghost stalks you through five locations — the Stage, Camera 2, Camera 3, the Door, and the Window. Manage your limited power wisely as you use your flashlight, door, and security cameras to survive the night.

### Ghost AI

The ghost moves through 5 position states:

| State | Location |
|-------|----------|
| 0 | Stage |
| 1 | Camera 2 |
| 2 | Camera 3 |
| 3 | Door |
| 4 | Window |

- The ghost advances randomly every few seconds.
- If you close the door while the ghost is at the Door (state 3), it teleports to the Window (state 4).
- At the Window, the ghost is locked for exactly 2 seconds.
- After the 2-second lock, a 1-second interval timer begins with a 20% chance each tick that the ghost resets to the Stage (state 0).
- **Instant death**: If you open the door while the ghost is at the Door (3) or Window (4), a jumpscare triggers and the game ends.

### Power Management

Everything drains power:
- Base drain (passive)
- Flashlight: extra drain while on
- Door: extra drain while closed
- Cameras: extra drain while viewing
- When power hits 0%, all systems shut down

### Controls

#### Desktop (Keyboard)

| Key | Action |
|-----|--------|
| A | Pan view left |
| D | Pan view right |
| Ctrl | Toggle flashlight |
| E | Open / Close door |
| Space | Toggle cameras (cycles Cam 1 → Cam 2 → Cam 3 → Office) |

#### Mobile (Touch)

- Left/right arrow buttons on screen edges for panning
- Bottom dock buttons: Flashlight, Door, Cams
- Camera selection buttons appear when in camera mode

### Camera Views

| Camera | Focus Area |
|--------|------------|
| Cam 1 | Stage |
| Cam 2 | Left Hall |
| Cam 3 | Right Hall |

## Tech Stack

- **Vite** — build tool and dev server
- **React 18** — UI framework
- **TypeScript** — type safety
- **React Three Fiber (R3F)** — React renderer for Three.js
- **@react-three/drei** — R3F helpers
- **Three.js** — 3D rendering engine

All 3D models are built procedurally using Three.js primitives (spheres, cylinders, cones, boxes) with emissive materials — no external 3D assets required.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── GameContainer.tsx    # Core game loop, state management, timer cycles
│   ├── OfficeCanvas.tsx     # R3F Canvas, 3D room, lighting, ghost model
│   └── GameUI.tsx           # HTML/CSS HUD overlay, cross-platform controls
├── styles/
│   └── game.css             # Vanilla CSS for screen-space UI
├── main.tsx                 # App entry point
└── vite-env.d.ts            # Vite type declarations
```

## License

This is an open-source fan project inspired by Five Nights at Freddy's by Scott Cawthon.
