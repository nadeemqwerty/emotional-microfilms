# Production workflow and durable state

The canonical skill drives this workflow; `data\workflows.json` stores repeatable
checklists and `data\roadmap.json` stores milestone status/exit evidence. Use
`film roadmap` and `film workflow <id>` to resume. These are local checklists,
not a multi-agent orchestration engine.

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

## 2. Story proof and direction

For the selected workspace create/revise the complete packet from the three
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
storyboard; record `storyboardApproved:true` and `storyboardApprovalEvidence` in
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
`nextRequestFingerprint`. Quotes include `at`, unit/quantity/discount and the
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

## 4. Keyframes -> motion

Create original anchor, then guided literal endpoints. Side-by-side review
identity, geography, hand/prop ownership, lighting and action phase. Use real
accepted refs, never placeholders. Register accepted local files:

```powershell
npm run film -- asset workspace\the-dry-seat\manifest.json keyframe media\the-dry-seat\a-start.png
npm run film -- review workspace\the-dry-seat\manifest.json keyframes pass "Observed continuity evidence."
npm run film -- advance workspace\the-dry-seat\manifest.json keyframes-approved
```

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
inspection. Record sound review, then advance to `sound-approved`.

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
  "output": "outputs/the-dry-seat/final.mp4"
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
phone-and-export. Record actual user approval as `finalUserApproval:true`.
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

Project skills and six read-only reviewer definitions live under `.github\`.
No personal/global pointer remains. Agent definitions describe available roles,
not agents that have automatically executed. Use direct review for a small
artifact; ask for/delegate only substantial independent review when appropriate.
Persist useful changes in source-to-rule map, packet fields, reviewer checks and
focused tests, then commit/push only under actual user authorization.

Reference-driven work uses [reverse engineering](reverse-engineering.md);
full-span frame samples alone are not full-motion/audio review. Studio-wide
readiness uses the [critic loop](critic-review.md).
