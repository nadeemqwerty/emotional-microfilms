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

There is deliberately no autonomous generation controller. Use live Agency tools
only after the user approves an exact request or bounded batch and credit ceiling.
Record the quote, request fingerprint, consent and returned historyId immediately.
Resume an existing job; a timeout is not permission to submit it again.

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
9. **Keyframes:** use `docs\prompt-playbook.md` and the selected example packet.
   Create an initial original identity anchor, then reference-guided shot frames.
   Differentiate identity refs from literal start/end frames. Approve adjacent
   frames side by side before animation. Real provider references only.
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

## Required production packet

- Intended first-view interpretation; lane-appropriate progression/payoff.
  Connection-led films retain setup / reveal / chosen response / hold.
- Original identity bible and real-reference provenance/rights.
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
- Short local checks need no packages. Ask before expensive renders/benchmarks.
- Use GPT-family delegated research if delegation is explicitly requested;
  otherwise work directly and keep research scoped. No swarm or custom controller.
