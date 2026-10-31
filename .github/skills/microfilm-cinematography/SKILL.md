---
name: microfilm-cinematography
description: Project-specific film direction and OpenArt visual prompting: blocking, framing, lenses/focus, motivated light, performance, continuity, match cuts, identity references, literal keyframes and motion.
---

# Microfilm Cinematography

Read `AGENTS.md`, `docs\film-language.md`, `docs\prompt-playbook.md` and the selected
packet. Research grounding is F1-F11/V1-V5 in `docs\research.md`.
Use `microfilm-lighting` and `docs\lighting-shadows.md` for the required light and
shadow plan; respect the selected lane/style in `docs\creative-range.md`.

## Input -> decisions -> artifacts

Input: user-selected setup/turn/choice and intended interpretation.
If selection or actual storyboard is missing, work as a draft; do not generate.

1. Assign an information job to each shot.
2. Map geography: screen positions, gaze heights, travel direction, prop owner,
   contact point and camera side of action axis.
3. Describe performance as visible verbs, with start pose and end pose.
4. Choose shot size, height and focus priority; then describe approximate optics.
   One camera intention per shot, often locked for a small expression.
5. Motivate a light source, direction, softness and fill. Preserve it unless the
   change is the dramatic action. Do not prescribe a universal emotional palette.
6. Make identity anchor and reference-guided literal endpoint prompts. Preserve
   face, clothing, prop count, hand ownership and set geometry. Distinguish a
   reusable subject ref from a literal starting frame.
7. For context transformations, plan separately generated registered states and
   an editorial match cut. Avoid complex morph/contact unless a benchmark earns it.
8. Add timing and pacing intentions, not claims of frame-exact control.
9. Side-by-side review keyframes before paid motion. Check actual video contacts
   and transitions afterward; a correct still cannot establish correct animation.

Output: revised packet, continuity table, literal still prompts, per-shot motion
prompts, single-pass alternative, actual model form mapping, dominant risk and
cheapest repair. Preserve untested status and existing user work.

## Required camera choreography

Use canonical `cameraPlan`, not only a free-text "locked" field. Read
`docs\film-language.md`, camera choreography. Time every segment against its
actual shot; declare movement/direction, framing start/end, subject anchor,
height/angle/lens intent, axis, speed/easing, zoom and focus. A motivated push,
reveal, follow, orbit, whip pan or rack focus is a choice, not a compulsory effect.
Optical zoom changes field of view; physical travel changes perspective; a
digital crop cannot recreate parallax or new depth-of-field information.
Use `cameraInstruction` in the exact native prompt and supported live form fields
only. Reconcile endpoints and eye/hand visibility throughout the move, including
the middle. Existing source edits may already crop away required faces.
The assembler supports a bounded post digital crop/zoom/pan/tilt per referenced
clip, not physical camera simulation. Camera changes need actual full-playback
`camera-execution` evidence; source frames or a successful render are not a pass.

Use the visual and pacing reviewer definitions for acceptance criteria. No
reference upload, generation, licence purchase or spend permission is implied.
