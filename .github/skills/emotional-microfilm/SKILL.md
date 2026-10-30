---
name: emotional-microfilm
description: Project studio for multi-genre original micro-films and Reels: emotion, comedy/memes, nostalgia, poetry and mystery; cinematography, pacing, lighting/shadows, songs/music, OpenArt prompts, reviewers and audience testing.
---

# Emotional Microfilm Studio

## Mission and truthfulness

Create a legible intended experience, not a demonstration of AI effects. Default:
10 seconds, portrait 9:16, dialogue-free, two principals, one location, at most
three shots. Warmth, longing, reunion, sacrifice, kindness and fantasy are all
valid. Comedy, meme-storytelling, nostalgia, visual poetry and micro-mystery are
also valid. Do not reduce the project to one genre, horror, parent-child stories
or grief. Read `docs\creative-range.md` and `data\creative-lanes.json`; visual
style and subtle local texture are separate decisions.

Read `AGENTS.md`, `data\brief.json` and the relevant production manifest first.
For an input video/Reel, use `microfilm-reverse-engineering` and
`docs\reverse-engineering.md` before adapting it. Inspect the entire source with
honest visual/audio coverage; learn craft mechanisms, then propose an original
story from actual user feedback. A public link is not reuse permission.
Use the existing repo/workspace; do not make a second studio or overwrite assets.
Distinguish **primary experimental evidence**, **professional craft guidance**,
**vendor capability/price**, **project hypothesis**, and **actual viewer result**.
Never turn a research finding into a guaranteed hook, dopamine release or reach.

## Approval boundaries

Project research/files are approved within the current task. Scenario selection,
reference uploads, generation and retries, purchases/licences, publication,
commits and pushes need explicit user authorization. A rating, quote, account
balance, allowance assumption or "full workflow" is not consent to spend.
No destructive edits. Leave InterviewReel and unrelated dirty work alone.

There is deliberately no autonomous generation controller. Use genuinely available host tools
only after the user approves an exact request or bounded batch and credit ceiling.
Record the quote, request fingerprint, consent and returned historyId immediately.
Resume an existing job; a timeout is not permission to submit it again.
Authorization may cover a bounded recovery sequence; do not mistake an
operator-imposed one-attempt plan for a user-imposed retry ban. For an authorized
recovery, check terminal status, backoff, net debit, fresh exact quote and remaining
step budget. One controlled retry and a researched provider alternative are not
permission for unlimited rerolls, creative variants or dependent scene spending.

An explicit instruction to finish a bounded reviewed pilot autonomously may
delegate character/scene/design decisions to the agent. Record the exact
instruction, scope, credit ceiling and `personallyViewedByUser:false` with every
delegated decision; never describe it as personal human inspection. Default
review stops still apply without that instruction. Keep final human approval
and publication separately gated. A complete numbered-frame audit plus native
detail checks is bounded agent visual evidence, not real-time playback, a
physical phone test, cold-viewer comprehension or audio listening.
Use typed `characters-delegated`, `keyframes-delegated`, `design-delegated`
acceptance, not `*-user` labels. Read `docs\workflow.md` for authority records and
`docs\agent-integration.md` for capabilities, ownership and host handoff.

## The working loop

1. **Brief:** confirm target feeling, audience/context, realism/fantasy, limits,
   dialogue, budget and boundaries. Use reasonable creative defaults, not a
   presumed paid-generation budget.
2. **Discover:** develop varied original pitches across lanes, not just emotional
   twists. State visible setup, development and intended payoff; a choice is one
   mechanism, not a genre law. Vary visual styles and relationships. Local details
   should be subtle and universally legible, not compulsory geographic themes.
3. **Screen and score:** apply `data\rubric.json`, preserve rejected concepts with
   failed gates. Score 1-5 using anchors and a written rationale. Run
   `npm run film -- rank 6`; use `film shortlist 6` for cross-lane variety.
   Scores are editorial hypotheses, not probabilities.
4. **User feedback:** show a compact diverse shortlist with risk and rough cost.
   Record only feedback actually given. Keep user rating/decision separate from
   editorial score. Selection authorizes preproduction, not uploads or spending.
5. **Story proof:** make essential stills or an animatic of the lane's progression
   and payoff. Visual-first: test without title, caption or music. Explicit
   text-led format: include intended original text, mute audio and test phone-size
   readability, contrast, duration and composition; do not use rescue captions.
   Record `comprehensionMode:text-led` and `textPlan` in scenario and packet.
   Ask cold viewers what
   happened before suggesting an emotion. Fix causality before polishing.
   Apply the Wow & Enjoyment Analyst early to concepts/stills for the stated
   audience/lane; an early scope-limited PASS is not a final playback verdict.
6. **Direct:** create identity/prop bible, blocking map, action axis, eyelines,
   explicit lightingPlan/shadow map, camera/focus intent and accessible crop.
   Use `microfilm-cinematography` and `microfilm-lighting`, not a soup of adjectives.
7. **Pace:** create a beat timeline before choosing shots. Separately specify
   performance speed, information rate, shot length, sound rhythm, reveal
   exposure and reaction hold. Use `docs\pacing.md`. A cut must change information
   or emotional attention; do not cut on every beat by default.
8. **Choose model/route:** read `docs\model-audio-decision.md`; retrieve current
   model catalog, exact mode form and full-request quote. Choose image2video for
   a literal first frame, element2video for reusable subject references in a new
   composition. Inspect the specific model, not just its family marketing.
9. **Characters then scenes:** follow `docs\visual-development.md` and
   `characterPlan.references[].prompt`. Generate a real cast reference and STOP
   for user feedback on faces, ages, wardrobe, style and scale before scenes,
   unless those specific creative decisions were explicitly delegated.
   Then make reference-guided literal scene images for every changed composition
   and light state; show the images, not diagrams, for user or scoped delegated acceptance.
   Differentiate identity refs from literal start/end frames. Approve adjacent
   frames side by side before animation. Real provider references only.
   Every required frame must pass, not just one anchor. Read
   `docs\generation-preflight.md` for limits and conservative prompt ceilings;
   bind accepted frame IDs/files/provider refs and validate exact motion inputs.
   The current iterative workflow requires a separate cast gate; do not reuse
   an unapproved opening as a shortcut. Reuse the accepted cast across scenes.
   Require `hookPlan`, `sceneChanges` and `atmospherePlan`. Consider golden
   butterflies, flowers, sakura, rain, wind/trees, autumn and illuminated props
   as coherent visual options; set purpose, timing, masks/depth and light/shadow
   behavior. Do not add all effects or imply they guarantee positive emotion.
   After actual scene approval lock the final script, pacing, transitions,
   effects, camera, lighting/shadows and sound route at `design-locked`.
10. **Motion:** one readable primary action and one camera intention per shot.
    Preserve contact, geography and identity. Use separately rendered matched
    states plus an editorial cut for hard transformations; do not assume a model
    can morph without artifacts or obey frame-exact prose timestamps.
11. **Sound:** build ambience/foley first, then test music or native audio.
    Read `docs\music-brain-hooks.md`; no biochemical promises. Music supports or
    deliberately reframes action; it must not supply a missing plot. Clear actual
    compositions/recordings, platform/commercial scope and territories. The
    inspected MCP exposes no standalone music generator.
    For nostalgic/modern songs or actual singing, also use
    `microfilm-song-adaptation`; preserve phrase/voice quality rather than blindly
    speeding a song up.
12. **Review and learn:** inspect full motion and real audio on a phone. Record
    asset hashes, evidence and approvals; edits invalidate affected approvals.
    Render only from accepted media. Publish only after explicit approval.
    Follow `docs\review-measurement.md`; report counts and denominators and do not
    call watch-time/duration "completion" or reach/view ratios "rewatch rate".
    Apply the Wow & Enjoyment Analyst in `docs\entertainment-review.md`: beauty/
    freshness, pleasure, anticipation, earned payoff, boredom and voluntary
    replay. Predeclare audience/lane/criteria, give timecoded evidence, and
    distinguish an editorial judgment from actual viewer enjoyment.

## Required production packet

- Intended first-view interpretation; lane-appropriate progression/payoff.
  Connection-led films retain setup / reveal / chosen response / hold.
- Original identity bible and real-reference provenance/rights.
- Real character-reference plan and user-approved images, structured first-frame/
  first-motion hook, every scene transition and timed atmosphere/effect cue sheet.
- Blocking: screen side, gaze target, contact point, prop owner and action axis.
- Camera: shot size, height, one movement or locked choice; focus priority.
- Required lightingPlan: motivated key/fill, exposure priority, caster/receiver
  shadow map, invariants and declared changes. No universal color/emotion code.
- Literal keyframe prompts and endpoints; invariants versus intentional changes.
- Per-shot motion prompts and a continuous/single-pass alternative, actual form
  parameter names, model/mode, exact quote and maximum repair attempts.
- Beat/cut timeline, information density, payoff exposure and ending rhythm.
  Use `pacing.structure:lane-specific` with `endingRationale` for justified
  non-connection poetry/comedy; no compulsory relationship choice or reaction shot.
- Audio cue sheet with actual synchronization points, music brief and silence,
  licensing state and replaceability. Never invent a music API or stems.
- Retry plan, manual review checklist, accessible description and test hypothesis.

## Pacing and hook requirements

The opening offers a readable situation and a genuine question, not clickbait.
The development/payoff repays that question or establishes a deliberate poetic
progression. A connection-led turn needs a voluntary response and time to register;
a punchline can end directly and poetry need not invent a twist or relationship.
Fast movement, fast cuts, loud music and high arousal are not interchangeable
with pleasure, empathy or dopamine. If the story needs 12 seconds, test that
version rather than forcing it into 10. Silent first-view confusion is a rewrite
signal, not proof the audience should watch more times.

## Evidence and tools

- Research register: `docs\research.md`; neuroscience: `docs\music-brain-hooks.md`.
- Craft: `docs\film-language.md`, `docs\pacing.md`, `docs\prompt-playbook.md`.
- Light/shadow: `docs\lighting-shadows.md`; songs: `docs\song-adaptation.md`.
- Operations: `docs\workflow.md`; quote snapshot: `data\model-quotes.json`.
- Validate: `npm run check`, `npm test`, `npm run validate`.
- Review tools verify structure/file integrity, not emotional or perceptual quality.
- Common host/ownership contract: `docs\agent-integration.md`; enjoyment:
  `docs\entertainment-review.md`; full implementation/blockers:
  `docs\completion-plan.md`.
- Short local checks need no packages. Ask before expensive renders/benchmarks.
- Use GPT-family delegated research if delegation is explicitly requested;
  otherwise work directly and keep research scoped. No swarm or custom controller.
