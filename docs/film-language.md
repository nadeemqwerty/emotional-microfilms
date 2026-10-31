# Film language: direct the intended experience

Source basis: research F1-F11. The microfilm applications below are our production
hypotheses, not universal cinematic rules or guarantees of AI compliance.

## Build the selected lane's event

The following relationship pattern applies to **connection-led** films, not every
genre. Observational poetry can develop a visual pattern without a character
choice; comedy can end on its punchline without an explanatory reaction shot.

Write: **someone wants/needs something -> someone notices -> a voluntary action
changes the relationship**. A fantasy reveal changes the conditions; the
character's response supplies the feeling. A beautiful transformation without
the response is an effect demonstration.

Show a physical verb: offers, waits, turns back, makes room, returns, protects.
"Heartbroken" alone gives the generator neither blocking nor a readable action.
For sacrifice, show the benefit and what was relinquished in the same geography.
For reunion, supply a recognition cue rather than inventing a biography afterward.

## Frame and block

- Compose the actual 9:16 image; do not rely on cropping landscape later.
- Name who is left/right, standing/seated, facing whom and how far apart.
- Keep significant eyes, hands, props and contact points visible throughout motion.
- Pick a focus priority. Deep enough focus may be more useful than fashionable
  shallow focus if the reveal is an object in the background.
- Describe the shot's information job before its optics: establish, reveal,
  recognize, choose, resolve. A wider lens is not inherently more emotional.
- Protect action from platform overlays; inspect the current account's preview.
  Central staging is a conservative starting point, not an official safe-zone map.

**Blocking template:** A is seated screen-left, facing three-quarters right. B
approaches from screen-right, stops beside the empty seat, looks down at the
offered place. Camera stays on pavement side of the A-B action axis. The coat is
always lifted by A's right hand. B's bag stays on the right shoulder until the cut.

## Light and performance

Use one motivated source: overcast sky, window, doorway, desk lamp or streetlight.
Specify direction, softness, fill and enough separation to read the action.
Preserve source direction between shots unless a change is part of the story.
Warm/cool contrast may organize a particular design; neither color has a universal
emotional meaning.

Performances need a readable change, not maximum intensity: hesitation -> gaze
shift -> decision -> eased shoulders. Small expressions require frame size and
time. Don't demand restraint while making the face tiny.

## Cut for meaning, preserve relationships

A **graphic match** connects shape/position; **match on action** preserves an
ongoing movement. They are not interchangeable. A graphic cut can leap between
worlds; a continuous-action cut must preserve motion phase and direction.

For a transformed-world cut, write two lists:

| Invariant | Intentionally different |
|---|---|
| Subject silhouette, gesture phase, relative screen position | Environment or material |
| Hand/prop ownership and action direction | Costume if essential to reveal |
| Camera height, framing and dominant light direction | Context that changes the gesture's meaning |

Generate states separately if necessary; assemble the cut in editing. The model
does not have to perform an anatomical morph. When a relationship response supplies
the meaning, it follows the reveal and remains visible long enough to understand.
Other lanes need readable payoff exposure and a justified ending rhythm, not a
compulsory response/hold. See [pacing.md](pacing.md).

## Camera choreography

`cameraPlan` is the canonical per-shot camera score. Inspect available planning
options with `film cameras`. One motivated movement can enrich a film; movement
is not a requirement for every shot or a substitute for performance.

| Choice | What actually changes | Acceptance risk |
|---|---|---|
| Locked | Deliberate fixed viewpoint; an expressive hold can be the right choice | Unrequested model zoom/reframe or focus hunting, especially mid-shot |
| Pan / tilt | Rotation left/right or up/down from a position | Cropped reveal, lost eyes/hands, confusing screen direction |
| Dolly / truck / pedestal | Physical forward/back, lateral or vertical travel | Perspective/parallax, collision, axis and contact inconsistency |
| Orbit / crane | Motivated arc or elevated spatial reveal | Unstable geography, excessive complexity, newly exposed missing geometry |
| Handheld / gimbal follow | Deliberate supported following or controlled handheld energy | Shake hiding action, mismatched subject/camera travel |
| Optical zoom | Planned optical field-of-view change, not camera translation | Claimed lens behavior unsupported by model/editor; no automatic dolly parallax |
| Digital zoom / pan / tilt | Post crop within existing pixels | Resolution loss and clipped faces/props; no recovered offscreen information |
| Rack / tracking focus | Attention across depth planes or a maintained moving target | Lost expressions, false blur, no actual depth information in a flat crop |

Whip pans, reveals and crash zooms are deliberate speed/framing choices with
settled endpoints, not extra magic API fields. A dolly zoom is an explicitly
motivated compound movement, not an accidental mixture of contradictory terms.
Camera speed/easing does not retime acting or audio.

Each shot declares purpose, axis, height/angle/lens intent, execution route,
actual control mapping, fallback and acceptance/forbidden artifacts. Its
segments cover the exact shot with stable IDs, `from/to`, movement/direction,
speed/easing, start/end framing, anchor, zoom mode/magnification and focus
mode/targets. Physical travel declares expected parallax; rotations and crops
do not pretend to create it. All canonical cues resolve onto delivery frames.
Use `cameraInstruction(packet, shotId)` in the exact in-generation prompt.
This binds intention, not a guarantee of provider compliance. Refresh live
forms; do not invent `camera`, `zoom`, lens or tracking fields in a provider API.

The local assembler implements digital post crop, zoom, pan and tilt only.
Reference a canonical `post` camera shot with `edit.clips[].cameraShotId`.
One continuous crop segment per clip is currently supported; split more complex
edits explicitly. `zoom.mode:"digital"` uses relative factors >=1; pan/tilt
needs overscan/crop margin and normalized `cropPosition.from/to` in [0,1] across
the available crop space. Easing is linear, ease-in, ease-out or smooth
ease-in-out. Output duration/FPS and audio timing stay unchanged.
Post cannot synthesize dolly/parallax, optical zoom or rack focus.

An alternate `edit.cameraPlan` is allowed for unapproved review only; masters
must match the approved production plan and bind the actual source shot.
Legacy source mappings need explicit review-only evidence, never automatic
new acceptance. Existing editorial cutaways may already remove required faces:
inspect actual source frames before adding another crop.

Camera/focus changes require `camera-execution`: full playback, all planned
shot/segment IDs, actual timecodes and observations that movement, framing,
focus and continuity match, with no unresolved failures. Geometry/pixel tests
and selected stills help diagnose but cannot grant that perceptual pass.

## Sound is part of the shot design

Choose sound source, perspective and transition while storyboarding. A continuous
rain bed can connect two takes; an incoming knock can motivate a look. A musical
cue that announces the twist before it becomes visible can weaken the reveal.
That is a hypothesis to test, not a blanket ban on anticipation.

## Director's glossary

| Term | Working meaning / use |
|---|---|
| Mise-en-scene | Setting, costume, objects, lighting and performance in front of camera |
| Blocking | Performer placement and movement; positions must be reproducible |
| Shot size | Amount of subject/environment shown; controls what information is available |
| Two-shot | Two principal subjects in one composition; efficient relationship geography |
| Looking / leading room | Space toward gaze / intended motion |
| Depth of field | Range of scene depth appearing acceptably sharp |
| Rack focus | Intentional shift of focus between depth planes |
| Key / fill / backlight | Main modeling source / shadow control / rear separation |
| Practical | A light source visible or plausibly present in the story world |
| Action axis / 180-degree convention | Stable side of a relationship to preserve screen orientation |
| Screen direction | Apparent left/right facing or travel |
| Eyeline match | A look connected to its implied target, including height |
| Graphic match | Similar visual forms joined across a cut |
| Match on action | Continuing movement joined across views |
| Ellipsis | A deliberate omission of time, such as cutting to someone already seated |
| Reaction shot | Visible interpretation or choice after an event |
| Diegetic / nondiegetic | Sound within the story world / outside that world |
| Sound bridge | Sound continuing or arriving across a visual cut |
| J-cut / L-cut | Incoming sound before its image / outgoing sound continuing afterward |
| Foley | Designed/recorded physical action sounds matched to picture |
| Tempo | Rate of musical pulses; not the same as edit or performance speed |
| Rhythm / pacing | Pattern and felt progression of action, attention, cuts and sound over time |

These are functional descriptions. Prompt terms approximate an intended image;
they do not guarantee a particular lens, shutter, optical simulation or emotion.
