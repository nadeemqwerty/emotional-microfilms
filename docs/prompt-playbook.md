# Prompt engineering: from direction to reproducible shots

Use the cinematography and music/pacing skills. Professional sources establish
craft concepts; V1/V2 provide vendor prompt advice, not a deterministic contract.
Do not name a model's unexposed parameter just because another model supports it.

## Separate four kinds of text

1. **Creative brief:** audience, feeling, observable choice, constraints.
2. **Identity reference:** face/body/material, costume, prop design and provenance.
3. **Literal keyframe:** actual camera, composition, pose and moment to animate.
4. **Motion prompt:** how the approved frame changes, including what stays fixed.

An identity sheet with several views is not a suitable literal first film frame.
Use element mode to carry subject identity into a new composition, and image mode
to animate a specifically approved opening image. Read each model's current form.

## Initial original anchor

An inspected Nano Banana 2 text2image form accepts:

```json
{
  "prompt": "The complete approved anchor prompt, not this placeholder.",
  "imageCount": 1,
  "aspectRatio": "9:16",
  "resolution": "1K",
  "autoEnhancePrompt": false
}
```

This is documentation, not a ready/approved submission. The example JSON
packets contain full `characterPlan.references[].prompt` cast prompts. Use those,
not the older scene-oriented `identityBible.anchorPrompt` study. Quote the
chosen exact prompt and configuration after approval.

After reviewing the anchor, reference it for later frames with genuine returned
`visualReferences`. Text-only repeated descriptions do not establish persistent
identity. Save accepted original media locally with hashes and provenance.
Show the real cast image and stop for actual user approval before scene generation.
Then review real scene endpoints and lock the complete design before motion;
follow [iterative visual development](visual-development.md).

## Literal still prompt order

`reference instruction -> identity/wardrobe -> position/pose -> decisive prop
state -> shot size/camera height -> focus intent -> motivated light/palette ->
aspect/crop -> continuity constraints -> necessary exclusions`

Make every frame usable as an actual shot endpoint, not a collage of beats.
Compare consecutive frames before motion: hand ownership, contact location,
screen direction, eye height, background geometry, prop count and shadow source.
Separate invariant details from intentional changes.

## Motion prompt order

`literal starting state -> one primary action -> performance change -> camera
intention -> target end state/hold -> invariants -> sound intent if supported ->
exclusions`

Translate chosen atmosphere cues into the actual prompt: motif, active interval,
path/density, depth/occlusion, key light, spill/highlight/shadow behavior and what
must remain clear. A named effect or glow adjective alone is not a complete plan.
Do not invent butterfly, mask, particle or relighting API fields. A separate
composite requires an actual tested editor/asset path, not an unimplemented promise.

Use visible verbs and action phases, not only "cinematic", "emotional", or "8K".
Keep motion simple enough to repair. Exact lens behavior, timestamps, tap counts,
endpoints and facial acting require inspection; prose does not enforce them.

Default to one camera move or locked framing. An orbit plus an embrace plus a
transformation plus a rack focus is several risks, not a more professional prompt.
Do not add unsupported `negativePrompt`, `fps`, `aspectRatio` or audio fields;
include necessary exclusions in prose when the actual form lacks such fields.

## Continuity across clips, not just within a prompt

- Use the accepted preceding endpoint or an approved matching frame as the next
  starting image where the intended action is continuous.
- If changing camera size, make an approved new composition from identity/set
  references rather than asking motion to invent an arbitrary camera jump.
- For a deliberate ellipsis, specify omitted action. The Dry Seat cuts to Dev
  already seated; this avoids asking the model to solve sitting contact.
- For a changed-world graphic match, generate aligned states and cut them in
  editing. Preserve silhouette/gesture; do not demand a continuous body morph.
- A ten-second single-pass version is an alternative, not a replacement for the
  shot plan. It can fail exact timing/continuity even if it is visually attractive.

## Pacing belongs inside the packet

Every packet has `pacing.hook`, hypothesis, continuous beat timeline, reveal
or payoff evidence, cut reasons and unfilled actual-event times. The validator
rejects gaps/overlaps. Connection-led structure requires response/hold; a declared
non-connection `lane-specific` structure instead requires an ending rationale.
It does not judge whether the intervals
are emotionally sufficient. The pacing reviewer must inspect actual media.

## Audio prompting

For native audio state the story-world bed, actual physical sound events, absence
of unwanted speech/lyrics, music intention and silence. Do not assume isolatable
stems or precisely timed harmony. For separate production write a cue sheet for
an actual approved source/editor; there is no inspected OpenArt music endpoint.

No phrase such as "dopamine boost" tells a model what music to produce. Replace
it with testable musical direction: sparse/dense texture, timbre, pulse, phrase,
harmonic tension, dynamic contour and resolution after a visible response.

## Exact-request approval record

Before a tool submission record model/mode, live schema check time, fully resolved
params, real refs, quote, current discount calculation, user consent/ceiling,
repair scope and request hash. No placeholders. Reserve cost before submitting;
store historyId immediately. Timeouts resume that ID. Do not automatically rerun
a rejected/failed generation.

Review against the story, not only prompt compliance. A clip that follows camera
language but obscures the emotional choice is still a failed take.
