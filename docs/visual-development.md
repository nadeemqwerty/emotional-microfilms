# Iterative visual development: real cast, real scenes, then motion

The earlier four-panel preview was a blocking sketch, not production keyframes.
The Korean toddler/30s father revision now has a real cast image, all four guided
scene endpoints and an assembled silent video. Decisions were explicitly
delegated to the agent for autonomous completion, not personally viewed by the
user. Human playback/phone and final-release review remain pending. A diagram can explain
geography but cannot establish faces, wardrobe, materials, lighting quality or
usable references.
Do not present it as a substitute for the actual images the user must review.

Without explicit delegation, retain the review stops below. With it, preserve
the exact authorizing instruction, scope and `personallyViewedByUser:false`;
do not fabricate personal approval. This does not authorize publication.
Refine motion against accepted actual endpoint poses: this pilot uses a hovering
hand invitation, not an unsupported coat lift or guaranteed palm-seat contact.

## Required sequence and review stops

| Stage | Actual artifact and decision | What remains blocked |
|---|---|---|
| `preproduction` | Provisional story/style, character prompts and bounded authorization for the first real cast image | Scene and video generation |
| `characters-approved` | Real original cast images; user accepts faces, ages, wardrobe, style and relative scale | Motion; scene images without those references |
| `keyframes-approved` | All literal scene endpoints and every changed composition/light state; side-by-side user review | Motion until the full design is locked |
| `design-locked` | User accepts script, opening hook, beat timing, scene transitions, camera, lights/shadows, effects and sound route together | Unapproved alterations and unquoted jobs |
| `motion-approved` | Actual clips pass motion, identities, effects, contact, light continuity and achieved timing | Final export until sound and final reviews pass |

Show the first real cast image before buying scene images. Generate a scene
candidate, show it and incorporate feedback before paying for dependent variants.
Do not silently turn an iterative request into a large batch. A user may explicitly
approve a bounded batch, but character and final scene review stops still apply.
Each new paid step needs the applicable quote, authorization and remaining budget.

Use `characterPlan.references[].prompt` for the actual character image, not the
older scene-oriented `identityBible.anchorPrompt` study. A neutral cast reference
is NOT the film's first frame. Pair references can save credits only if both faces,
wardrobe and scale are readable; otherwise propose separate references and quote
the additional work. Changing a story location need not mean regenerating good cast.
The actual first cast take includes a visible studio softbox and a facial-key
direction that does not fully match the prompt. Those are reference-background
caveats, not approved scene design. Preserve accepted faces, hair, wardrobe and
scale only; explicitly exclude studio equipment and relight the actual location.
User character acceptance remains independent of this operator assessment.

The first scene uses accepted character references. Later scene images also use
accepted geometry/prop references where useful. Preserve faces/wardrobe, but
deliberately relight and restage for the actual scene. Do not copy neutral reference
lighting into every shot. Account for all changed shot sizes, worlds, seasons,
poses and light states. If an important intermediate state needs an anchor, create
it and split the shot or use a tested supported route; do not invent a middle-frame
API field on a model that only accepts start/end.
The current edit path supports cuts, ellipses and graphic match cuts, not an
automatic dissolve/transition renderer. Other transitions need a tested extension
or editor workflow before claiming support.

## An opening hook is a designed shot, not a sparkle preset

Every packet requires `hookPlan`: the actual first-frame evidence, first motion,
inspection window, honest question, promised payoff and test. Inspect the literal
0s frame and a short opening excerpt muted at phone size. Identify the focal point,
what can be understood before explanation, and whether UI/crop/effects hide it.
One second is an initial project inspection choice, not a universal hook law.

Possible mechanisms: an intriguing relationship, visual contradiction, unexpected
scale, a beautiful revealed detail, incomplete purposeful action, or a strong
silhouette/color contrast. A golden butterfly can direct attention, but a swarm
covering the child's face can destroy the actual hook. Motion for its own sake,
flashing highlights and misleading shock are not evidence of reduced swiping.
Compare proposed compositions first; buy additional variants only with approval.
Audience retention remains unmeasured until an actual declared experiment runs.

## Atmosphere and beauty palette

Consider this menu at style development, not as a ban on expressive imagery.
Choose a coherent world/season and a small motion budget, not every effect at once.

| Motif | Potential story/attention job | Design and failure checks |
|---|---|---|
| Golden shiny butterflies | A gentle gaze guide, wonder or a response accent | Count/path, wing form, foreground/background depth, no face occlusion; distinguish reflected gold from true emission |
| Flowers / a bloom | Reveal detail, renewal, an offered gift | Species/scale and stable petal geometry; growth is a separate primary action, not an assumed free background effect |
| Sakura / drifting petals | Soft directional rhythm and environmental depth | Coherent season, wind and scale; petals do not become fingers, snow or facial features |
| Rain | Texture, vulnerability, shelter or reflection | Wetness, rate, gravity/wind, shelter boundary and readable dry evidence |
| Trees moving / breeze | Living background without another plot event | Subtle leaf motion, rooted trunks, consistent wind; no warped faces/architecture |
| Autumn leaves | Warm texture, change or a motion guide | Species/season and fall direction; avoid unexplained simultaneous spring blossoms |
| Illuminated props / fireflies | An attention anchor or motivated light-state change | Source position, plausible spill/reflection, contact/cast shadows, exposure and stable brightness |
| Highlights / restrained bloom | Separate a subject or emphasize a valued detail | Preserve skin/eye detail and the reveal; no strobe, clipped halos or arbitrary glowing outlines |

These are creative hypotheses, not guaranteed happiness, dopamine or reach.
Select one main performance action and a restrained secondary environmental layer.
Visual poetry may make the environment itself the main action. Do not prohibit
beauty merely because a grounded baseline is cheaper; show alternatives and cost.

## Required effect cue sheet

`atmospherePlan` records the motion budget, chosen effects and why alternatives
are omitted. Each effect has an ID, active shots, from/to times, purpose, depth,
motion, occlusion, light interaction, shadow interaction, continuity and fallback.
`in-generation` effects must be designed in every affected literal endpoint and
the actual motion prompt. Endpoints establish intended appearance, not successful
motion. Inspect flutter, drift, deformation and light pumping in actual playback.

`composite` effects require an actual registered `effect` asset, rights evidence
and an `effect-preflight` review before design lock. Test alpha/edges, perspective,
masking around bodies/props, tracking, spill and the phone-size result. The current
FFmpeg assembler does NOT generate butterflies, masks, tracking or relighting.
Use a capable editor for the actual composite, register the resulting clip/hash
and review it. A route label is not an implemented compositor.

Changing the effect, its timing or light state changes the production packet and
invalidates the affected design/motion approvals. Reuse unchanged media where
possible; no automatic full-film rerender.

## Light and shadow integration

Read [lighting/shadows](lighting-shadows.md) for key/fill, exposure and caster/
receiver mapping. Emissive objects, reflected highlights and lens/post glow are
different. Glow added around a butterfly does not by itself relight a nearby face.
Decide whether spill is negligible, intentionally added, or requires another
approved lighting state. Map affected skin, wood, cloth and water highlights;
keep shadows consistent with the declared source and depth. Tiny distant lights
should not create unexplained large opposing shadows. Fantasy exceptions must
be explicit and coherent rather than accidental artifacts.

Official technical sources inspected: [Blender Emission](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/emission.html)
describes emitting surfaces/light color and strength; [Glare](https://docs.blender.org/manual/en/latest/compositing/types/filter/glare.html)
describes bright-region bloom/glow and threshold/clamp controls. These establish
rendering concepts, not OpenArt controls or psychological effects. No Blender
installation, effect rendering or generated-output benchmark is claimed.

## Provenance and executable checks

For `character` and `keyframe` assets, record `assetSources[relativePath]` before
CLI registration: `origin:"generated"` and actual `sourceHistoryId`, or
`origin:"authorized-reference"` plus real permission evidence. A generated asset's
SHA-256 must occur in that completed job's `outputAssetHashes`, recorded from the
actual downloaded output. Preserve genuine provider objects in `characterReferences`
and `keyframeReferences`. A sketch/missing provenance cannot pass the image gate.
Local checks cannot authenticate a remote image or human testimony: never forge
job metadata, permissions, inspection or user approval to satisfy them.

Record `characters` and `characters-user` reviews, then advance to
`characters-approved`. Character reviews bind just the cast identity/assets/refs;
adding a scene image does not invalidate an unchanged cast approval. Replacing
cast or changing faces/wardrobe does. Use `validateSceneReferences` before paid
guided scene generation.

Record `keyframes` and `keyframes-user`, advance to `keyframes-approved`, then
record actual `design-user` evidence and advance to `design-locked`. This is the
final packet lock, not permission to spend. Set `nextGenerationKind` to
`character`, `scene` or `motion` for the respective stage; call `validateSpend`
and, for video, `validateMotionReferences` against the fully resolved request.
Source/design reviews ignore subsequently added video assets, so submitting a
second approved shot does not require pretending the source images changed.

No automatic paid client exists. Old manifests need explicit refresh, the new
packet fields and genuine missing reviews; do not silently promote legacy
`keyframes-approved` state into a locked design.

A failed take clears generation approval and blocks advancement. Diagnose it and
obtain/reassert only the specifically applicable repair authorization, fresh
request/quote and remaining budget before another call. The earlier-stage repair
must remain possible without falsely passing the failed image; replace the actual
asset and repeat its affected reviews. No automatic retries or approval recycling.
