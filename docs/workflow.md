# Production workflow and durable state

The canonical skill drives this workflow; `data\workflows.json` stores repeatable
checklists and `data\roadmap.json` stores milestone status/exit evidence. Use
`film roadmap` and `film workflow <id>` to resume. These are local checklists,
not a multi-agent orchestration engine.

The required iterative order is **real character images -> user approval ->
real scene images -> user approval -> complete design lock -> motion**.
Read [visual development](visual-development.md) for hook design, butterflies/
nature/glow options, provenance and light/shadow integration. Schematics are
planning aids only, never generated keyframes or accepted character references.

## Authority and writer ownership (current contract)

Use [the host-neutral contract](agent-integration.md); claim the existing
workspace and set `FILM_OWNER` before mutation. Source/tooling ownership does
not transfer production ownership or authorize new spending.

Personal acceptance uses `characters-user`, `keyframes-user`, `design-user`
with `authority:{"type":"personal-user","personallyViewedByUser":true}`.
Only record this after real personal feedback. Delegated acceptance instead uses
`characters-delegated`, `keyframes-delegated`, `design-delegated` with
`authority:{"type":"delegated","delegationId":"<recorded-id>","personallyViewedByUser":false}`.
Both use actual `evidence` and `result`; record via `review-json`, not a pretend
user pass through the free-text command.

Private `manifest.delegations` entries contain `id`, `instruction` (exact actual
authorization), `scope` (subset of `characters`, `keyframes`, `design`),
`status:"active"`, current `productionFingerprint`, `authorizedAt`, `expiresAt`
and nonnegative integer `creditCeiling`. Operator restrictions may narrow but
never expand user authority. Check exact budget/retry consent separately.
Withdrawn/expired/out-of-scope/stale delegation cannot authorize later work.
The newest acceptance path governs; a stale personal label is not a fallback.
Final approval cannot be delegated: require `finalUserApproval:true` AND a
current `final-user` review with personal-user authority. Publication is separate.

Old delegated records under `*-user` remain history. For explicitly evidenced,
still-current legacy records only, `migrate-acceptance <manifest> <receipt.json>`
appends distinct delegated records without changing history or rebinding stale
media. Receipt: checkpoint `manifestSha256` and the bounded `delegation` object.
Test against a checkpoint copy first; terminal jobs and zero reservations are
required. Migration clears spend/final/publication flags. Do not migrate an
actively changing producer's manifest or replace newer typed decisions.
The later walkthrough's `*-user` steps mean the personal path; substitute the
typed delegated path only where the actual instruction covers it.

## 1. Develop -> choose

Read brief, rubric, existing ideas and actual feedback. Generate original varied
stories; apply hard gates before scores. Show a diverse shortlist with dominant
risks, not an alleged viral probability. Record only the user's feedback:
Use `film shortlist 6` and `docs\creative-range.md` to avoid one-genre selection.

```powershell
npm run film -- feedback the-dry-seat 5 select "User's actual stated preference."
npm run film -- packet the-dry-seat
```

The second command requires selection and refuses to overwrite an existing
workspace. The resulting manifest starts at `selected`, budget 0, spend false.
Retain all rejections/rewrites; missing feedback is not rejection.
If selection came without a numerical rating, use `unrated`, not an invented
score: `film feedback <id> unrated select "<actual selection evidence>"`.

## 2. Story proof and direction

Use the [production-direction bundle contract](production-bundles.md) and
[sound-direction/fit contract](audio-scene-fit.md). Fill coordinated
`direction.beats` and `soundPalette` before design lock or motion spending.
Export the ten department scripts from one packet; do not maintain conflicting
acting, audio, lighting and motion timelines. Actual user feedback should improve
the reusable workflow before any optional asset repair.

For the selected workspace create/revise the complete packet from the
examples. Make identity/prop bible, spatial map, literal frames, motion prompts,
single-pass alternative, required lightingPlan/shadow map, sound plan and pacing
timeline. Every beat needs a job; every cut a reason. Connection-led films need
readable reveal/response/hold. Declared lane-specific poetry/comedy may instead
justify progression or a punchline ending; see `docs\pacing.md`.

Use ungenerated sketches, existing cleared material or an animatic for initial
story proof where practical; paid stills also need authorization. Ask cold
viewers once without title or music for visual-first work. Explicit text-led
formats include intended original text and test muted phone-size readability,
contrast and exposure. Record answers, not a fictional pass.
Use story/pacing/visual reviewer checklists. The actual user approves the
provisional storyboard; record `storyboardApproved:true` and `storyboardApprovalEvidence` in
the manifest. `productionDraft` must contain the complete validated packet,
including custom scenarios. Advancement binds the approval to scenario, brief,
packet and a fresh approval revision.

```powershell
npm run film -- advance workspace\the-dry-seat\manifest.json preproduction
```

This structural gate does not independently establish a real approval; the agent
must obtain and honestly record it. The CLI has no paid-generation access.

## 3. Budget, references and live model choice

Use `docs\model-audio-decision.md`; retrieve current catalog and exact form.
Quote fully resolved requests, including actual refs and counts, immediately
before spending. Record discount rounding, retry reserve and consent ceiling.
Reference upload/import and rights need explicit approval too.

Manifest fields: `generationApproved`, exact `spendApprovalEvidence`,
`approvedBudgetCredits`, `spentCredits`, `reservedCredits`,
`nextRequestFingerprint`, and `nextGenerationKind` (`character`, `scene`, `motion`).
Character spending is permitted only at `preproduction`, scene spending at
`characters-approved`, and motion at `design-locked`; all still require consent.
Quotes include `at`, unit/quantity/discount and the
same request fingerprint. `validateSpend` fails closed without matching request,
freshness, exact arithmetic or remaining budget. Pass current scenarios, brief
and feedback as the helper's context argument; embedded revisions alone cannot
establish that a current selection remains valid. Its 24h maximum is a conservative
project guard, not a promise the vendor honors a price for 24h. Requote every call.

No automatic balance check, cost reservation or job submission is implemented in
the local CLI. The human/agent tool workflow must perform and persist those steps.

For every submitted request record:

```text
model/mode + resolved params + schema check
request hash + actual full-request quote + exact consent
reserved credits before call
returned historyId + status immediately after call
actual charged credits, including charged failures
local accepted/rejected asset hashes + reason
```

Keep signed URLs/private provider metadata in ignored workspace files, not Git.
If a call times out, inspect/resume the returned job. `ensureNoDuplicateJob`
rejects an active duplicate request. A completed rejected take still needs new
approval within the user's repair scope before resubmission.

## 4. Real characters -> scenes -> design lock -> motion

Use the full `characterPlan.references[].prompt`, submit only the authorized
cast image, show the result and STOP for user review. Record genuine provider
objects under `characterReferences`. For generated images, store their actual
completed job's `outputAssetHashes` and `assetSources[path]` with
`origin:"generated"` and actual `sourceHistoryId`; authorized reference images
instead need `origin:"authorized-reference"` and actual permission evidence.
Register the image with `asset <manifest> character <file> <reference-id>`,
record `characters` and `characters-user`, and advance to `characters-approved`.
No scene generation before those actual approvals.

Call `validateSceneReferences` on the exact guided-image payload before spending.
Then create literal endpoints from the approved cast. Side-by-side review
identity, geography, hand/prop ownership, lighting and action phase. Use real
accepted refs, never placeholders. Register accepted local files:

Store the genuine provider objects in `manifest.keyframeReferences` before
recording the keyframe review, so it binds both the files and reference map.
Changing that map later requires renewed binding verification.

```powershell
npm run film -- asset workspace\the-dry-seat\manifest.json keyframe media\the-dry-seat\a-start.png
npm run film -- asset workspace\the-dry-seat\manifest.json keyframe media\the-dry-seat\a-end.png
npm run film -- asset workspace\the-dry-seat\manifest.json keyframe media\the-dry-seat\b-start.png
npm run film -- asset workspace\the-dry-seat\manifest.json keyframe media\the-dry-seat\b-end.png
npm run film -- review workspace\the-dry-seat\manifest.json keyframes pass "Observed continuity evidence."
npm run film -- review-json workspace\the-dry-seat\manifest.json workspace\the-dry-seat\scene-user-review.json
npm run film -- advance workspace\the-dry-seat\manifest.json keyframes-approved
```

The private scene review JSON must contain `area:"keyframes-user"`, `result`,
actual `evidence` and the personal-user `authority` object defined above. For
delegated acceptance use the distinct area/authority/delegation record instead.

Record provenance for every scene image too; a PNG of a sketch is not a real
production endpoint. Before the next step finalize `hookPlan`, `sceneChanges`,
`atmospherePlan`, script, beat timings, camera, lighting/shadows and sound route.
For selected composites, register actual `effect` assets/IDs, `effectRights`
evidence and `effect-preflight` review from a tested editor. This assembler does
not implement particles, masks or relighting. Record actual `design-user`
approval, then advance to `design-locked`. Prompt/design changes require renewed
affected reviews; never fill these records with presumed approval.

Each file must map to a packet keyframe ID (inferred from its filename or given
as the final `asset` argument). Every required frame must exist; one endpoint is
not enough. Read [generation preflight](generation-preflight.md), persist genuine
provider objects under `keyframeReferences`, and call `validateMotionReferences`
with the exact shot parameters before paid motion. This local helper is not an
automatic paid-generation client.

Generate one simple shot at a time or an explicitly approved bounded batch.
Review full motion, contact, actual reveal/response times, not just endpoints.
Record actual event times under `productionDraft.pacing.actualEventTimes`.
Hash clips, record motion evidence, then advance to `motion-approved`.
Prefer repairing one shot over rerolling the whole film.

## 5. Sound -> final assembly

Create actual ambience/foley and optional music from an approved source, or inspect
native audio. Cue against actual events. Rights clear the recording/composition
and intended commercial/platform/territory use. Read the neuroscience and audio
playbooks; compare sounds on identical picture where possible.
For nostalgic/modern songs or actual singing, use `microfilm-song-adaptation`,
`docs\song-adaptation.md` and a filled workspace copy of the song-cue template.
`film song-plan <cue.json>` checks phrase/BPM/duration math and reports blockers;
it never sings, modifies a recording or clears rights.

Set `soundDecision` to `silent`, `separate` or `native`. Separate audio needs a
registered audio file; native requires `nativeAudioInspected:true` after actual
inspection. Record sound review AND a structured `audio-scene-fit` pass, then
advance to `sound-approved`. A technically clean, original but heavy/mismatched
cue fails. If actual joined listening is unavailable, keep acceptance blocked.
Use the [fit template and comparison protocol](audio-scene-fit.md).
Before those listening reviews, a rough cut can use edit `purpose:"review"`
and a `-review.mp4`/`-comparison.mp4` output. This explicit route needs locked
design and registered, rights-cleared media, tolerates failed/pending sound,
and grants no approval. Do not fake a sound pass merely to obtain a preview.

The local FFmpeg assembler takes a reviewed edit plan:

```json
{
  "schemaVersion": 1,
  "manifest": "workspace/the-dry-seat/manifest.json",
  "seconds": 10,
  "width": 1080,
  "height": 1920,
  "fps": 30,
  "clips": [
    {"path": "media/the-dry-seat/a.mp4", "in": 0, "seconds": 5},
    {"path": "media/the-dry-seat/b.mp4", "in": 0, "seconds": 5}
  ],
  "audio": {"route": "separate", "path": "media/the-dry-seat/mix.wav", "gain": 1, "rightsStatus": "cleared"},
  "output": "outputs/the-dry-seat/v001/finalVid/the-dry-seat-v001-review.mp4"
}
```

This is a non-executable example until files, manifest hashes and approvals exist.
All clips/audio must be registered with correct hashes. The soundtrack is an
already mixed file; this helper does not compose music or replace a DAW.

```powershell
node scripts\assemble.mjs workspace\the-dry-seat\edit.json --ffmpeg "C:\path\to\ffmpeg.exe"
```

No installation/download. The assembler checks source durations/audio presence,
trims, fits portrait with letterboxing rather than cropping, concatenates shots,
optionally mixes the supplied soundtrack or retains native audio (padding each
shot's short audio to its own picture duration), and writes
H.264/AAC MP4 without overwriting existing output. Upscaling a 720p source does
not create native 1080p detail. It does not evaluate narrative or perceptual quality.

Register the output as `final`, inspect actual phone playback and record all
final areas: silent-comprehension, intended-payoff, continuity,
pacing-hook-reveal-hold, lighting-shadow-continuity, motion-contact,
audio-rights-and-mix, research-claims,
phone-and-export. Include `opening-hook`, `atmosphere-effects` and `entertainment-wow-enjoyment`;
include the current structured `audio-scene-fit` report on the final asset set;
the latter needs the [structured playback report](entertainment-review.md).
Record actual user approval as `finalUserApproval:true` and a typed `final-user`
review against the current final assets.
Only then advance to `final-approved`.

## 6. Publish and learn - separate authorization

Publication is manual and separately approved. The CLI refuses to advance to
published. Record actual post/version, accessible description, current metrics,
account/trial settings and fixed observation windows. Use the experiment template.
No automatic upload or scheduling. Keep private feedback/identity out of public Git.

## Revision and resumption rules

`asset` computes SHA-256; changed assets clear spend/final approval and roll
downstream stages back. Reviews bind to an asset-set hash; the newest matching
review governs, so a later fail overrides an old pass and immediately rolls back
the corresponding approval/clears final and spend flags. Adding/replacing media
requires affected review again. `status` and manifest validation fail if a file
no longer matches its recorded hash.

Resume/advance/assembly also check current scenario, brief and actual selection.
Changing the packet invalidates its approval; changing an intended plan is not
the same as logging observed `pacing.actualEventTimes`. Reviews bind to production
revision as well as assets. Reject/rewrite/withdrawn selection blocks resumption.
After actual reselection or approved revisions:

```powershell
npm run film -- refresh workspace\the-dry-seat\manifest.json
```

This retains assets, jobs, costs and review history, but returns to `selected` and
clears approvals. Update the packet, obtain a new storyboard approval/evidence,
and advance normally. Old revision-bound reviews cannot silently become current.
Never use refresh to invent a user selection.

These are local integrity checks, not tamper-proof permission enforcement.
Never fabricate human review to satisfy a boolean. Resume existing manifests
and provider historyIds; preserve rejected assets and their cost ledger.

## Project-only persistence

Project skills and seven read-only reviewer definitions live under `.github\`.
No personal/global pointer remains. Agent definitions describe available roles,
not agents that have automatically executed. Use direct review for a small
artifact; ask for/delegate only substantial independent review when appropriate.
Persist useful changes in source-to-rule map, packet fields, reviewer checks and
focused tests, then commit/push only under actual user authorization.

Reference-driven work uses [reverse engineering](reverse-engineering.md);
full-span frame samples alone are not full-motion/audio review. Studio-wide
readiness uses the [critic loop](critic-review.md).
