# Studio completion plan and review record

Status: LOCAL TOOLING IMPLEMENTED AND TESTED; external production/host/viewer
acceptance remains open. Independent PASS applies to the plan only.
Implementation subsequently authorized by "implement now"; source ownership and
the existing test suite/short FFmpeg checks explicitly confirmed. Commit/push
authorized for this session's changes only. See execution record below.
Prepared: 30 October 2026, IST.
Scope: emotional-microfilms only; not the separate InterviewReel repository.

## 1. Outcome and boundaries

Deliver an enjoyable, technically reviewed original father-son film and a
repeatable studio that another supported agent can resume without this
conversation. Close every identified gap with evidence, or name its blocker,
owner and next action. "Documented", "implemented", "tested", "agent-accepted",
"user-accepted" and "published" are different states.

This document authorizes no implementation, media generation/import/upload,
purchase, publication, commit/push or expensive validation. Those need their
applicable approvals. Existing production authorization belongs to its recorded
scope, not to this plan. Keep the 1,000-credit whole-request ceiling, fresh
configuration quotes, total authorized budget and charged-attempt ledger.
Supporting Claude/ChatGPT does not authorize using non-GPT delegated reviewers.

The deliverables have three separate finish lines:

| Finish line | Required evidence | Cannot substitute |
|---|---|---|
| A. Pilot delivered | Actual playable film, complete picture/sound inspection, entertainment review, export checks and honest acceptance state | A packet, attractive stills, passing software tests or an old critic verdict |
| B. Studio operational | Exercised agent handoff, reference analysis, audio/effect routes, current approval rules, tests and durable documentation | Listing capabilities, template files or an untested connector |
| C. Audience/business learning | Authorized viewer test/release, declared metrics/windows, actual counts and costs | Editorial scores, follower counts or dopamine claims |

User approval/publication and external services are not guaranteed outcomes of
software work. A blocked item stays open; it is not silently dropped or marked
done. Other portfolio ideas (makeovers, buyer-first real estate, product
creatives) remain preserved in opportunity context, not implementation work for
this studio. Do not copy the supplied reference's protected expression.

## 2. Live baseline and ownership

Observed at 22:13 IST: tracked baseline `d2c10ae`, with an ongoing scenario edit.
The selected private workspace is `workspace\a-seat-for-dad\manifest.json`.
The revised fictional Korean toddler/father cast and all four real scene
endpoints exist. Its recorded stage remains `characters-approved`; actual
keyframe/design acceptance, generated motion and final delivery are not yet
established. Earlier checks passed, but do not validate subsequent media.

The existing production session remains the sole production owner. This plan's
author/reviewer must not edit that workspace, submit jobs, duplicate generation,
or change its source contracts mid-run. At implementation start, re-read current
files and take a new hash-bound checkpoint; do not act on this snapshot as live
truth. Preserve completed media, failed attempts, pending job IDs and history.
Use the running owner's accepted work rather than restart the pilot.

Before any shared-code/approval migration, agree a handoff at a terminal job
boundary. Reconcile outstanding reservations and provider status first. Record
one named producer and a version/hash checkpoint. If ownership is uncertain,
block writes/spend while allowing inspection. No custom orchestration controller.

## 3. Complete request-to-work map

| Request group | Existing foundation | Completion work |
|---|---|---|
| Useful OpenArt/Instagram work; data-led alternatives; retain makeovers/real estate/product tracks | Research/opportunity context and credit safeguards | W0, W3, W8, W9; retain separate directions without promising their implementation |
| Original short connection films; professional cinematography; many scenarios, scoring and real feedback | 41 scenarios, four packets, seven skills and six reviewer definitions | W2, W3, W7, W8; no compulsory tearjerker or copied reference |
| Emotional music, reward/anticipation, hooks and pacing | Evidence map and beat/cut plans | W2, W3, W5, W8; no biochemical measurement or universal timing claim |
| Project-only reusable skills/reviewers/roadmap/workflows | Repository-local definitions and CLI | W0, W1, W2, W7; no personal/global pointers |
| Lighting/shadows; multiple genres/styles; subtle local details | Lighting plans and six creative lanes | W2, W3, W6; review actual motion, not only prompts |
| Nostalgic/modern songs, faster-feeling pacing and actual singing | Song skill and duration planner | W5; actual editing/performance/rights remain unproven |
| Full input-Reel analysis and original improvement from actual feedback | Evidence preparation and review validators | W4; supplied Instagram URL is not playable ingestion |
| Father-son film; real cast -> scenes -> design -> motion; nature/beauty/glow; timing | Actual revised cast/endpoints and staged preflight | W0, W2, W3, W6; reuse completed assets |
| Failure reduction, model limits, keyframes first, controlled retry, credit cap and session identity | Model/request checks, attempt ledger, recovery and cap tests | Preserve/regress these in W0, W1, W3, W7; session identity was already supplied |
| Latest Korean toddler and father in his 30s | Revised cast and active packet | W3; preserve age/scale, wardrobe and toddler-appropriate two-hand action throughout |
| Commit/push, pending-work clarity, independent critique | Earlier verified pushes and scoped preproduction critiques | W7, W9; new work needs current evidence and applicable approval |
| Claude, ChatGPT, Copilot and other agents | Reusable Node CLI; host-specific discovery/operations | W1; compatible documents alone are not verified integration |
| Wow/enjoyment analyst: audiences are here to enjoy | New explicit requirement, not implemented | W2; creative reward and genuine enjoyment are first-class acceptance dimensions |

## 4. Work packages: what changes and why

### W0 - Establish truthful state and approval authority

Why: current records mix actual user review with agent acceptance under delegated
completion authority. Some public status documents still describe the earlier
no-media/no-selection baseline. Resuming that inconsistency can cause either
unnecessary stops or false user-approval claims.

Changes:

1. Reconcile the current private manifest, active jobs, assets/hashes, current
   cast, reservations, spending and actual permissions with the production owner.
   Record what the user authorized versus an operator's allocation.
2. In `lib\workflow.mjs` and `scripts\film.mjs`, distinguish technical review,
   delegated creative acceptance and personal user acceptance. Use explicit
   authority, artifact hash/revision, scope and actual evidence; a free-text
   instruction to finish is not evidence that the user saw an image.
3. Keep genuine `characters-user`, `keyframes-user`, `design-user` records as
   personal-user evidence. Add a clearly named delegated-acceptance path only
   for stages covered by explicit delegation; require its scope/evidence.
   Do not relabel an agent's review as a human pass.
4. Preserve old records. Migrate ambiguous active acceptance explicitly at the
   handoff, without replaying spending or silently promoting legacy flags.
   Expired/withdrawn/out-of-scope delegation must not authorize later work.
5. Keep `finalUserApproval` and publication as genuine separate user decisions.
   A working agent-reviewed film can be delivered as awaiting user acceptance;
   it must not be called user-approved or published.
6. Update `AGENTS.md`, canonical studio/review skills and `docs\workflow.md` /
   `docs\visual-development.md` together after the production handoff.

Acceptance: focused workflow/CLI regressions cover human versus delegated
acceptance, missing/out-of-scope delegation, stale assets/revisions, changed
cast/design, later failure invalidation and final/publication separation.
Re-run validation against a copy of the active checkpoint before migrating the
real workspace. No invented user evidence or destructive refresh.

### W1 - Make the workflow genuinely agent-integrable

Why: the pipeline's local functions are reusable, but present discovery,
OpenArt operations and reviewer invocation assume Agency/Copilot.

Changes:

1. Add `docs\agent-integration.md` as the host-neutral execution/handoff contract.
   Make root `AGENTS.md` the common entry point; keep canonical skills/review
   criteria in one location. Host adapters must link to them, not fork their text.
2. Verify current official Claude, ChatGPT and Copilot integration capabilities
   before choosing their discovery/configuration paths. Record documentation
   date and separate support by host/product, not model name alone.
3. Define a capability matrix: repository access, local CLI invocation, private
   media access, image inspection, full video playback, full audio listening,
   OpenArt tool/auth availability and approval interaction. Missing capability
   returns a specific pending/blocked state, never fabricated inspection.
4. Map common operations to existing `film`, `reverse` and assembly commands and
   actual OpenArt forms/quotes/job tools. Never invent equivalent tool names.
   External generation remains a separately authorized operation with the same
   exact request, real references and saved job ID.
5. Where a host lacks local command access, provide a verified, approved thin
   connector to the existing CLI or an explicit operator-assisted handoff.
   Do not create a second pipeline or custom controller. If no usable transport
   is available, mark that host blocked; do not advertise automatic integration.
6. Define a private handoff containing relative file references/hashes, source
   revision, scenario/packet, stage, remaining tasks, authority scope, limits,
   job status and required inspection. Exclude credentials/signed URLs from
   public adapters. Preserve original media and derivative lineage.
7. Enforce one producer per workspace during cross-host handoff. Reuse an
   existing ownership safeguard; if absent, add the smallest exclusive
   workspace-write guard needed. Verify owner transfer and stale-lock recovery
   against actual pending jobs, not a timeout-only takeover.
8. Document Node 20+/FFmpeg setup and exact exercised host/OS combinations.
   Relocate a private test bundle; do not copy credentials, caches as installed
   prerequisites, virtual environments or machine-specific absolute paths.

Acceptance: each requested host runs the same plan/status and synthetic
workflow through its real available transport. Transfer a synthetic pending job
and failed review between hosts: the new owner resumes the same ID, refuses a
duplicate submission, honors approvals and reports absent perception honestly.
Test relocation, missing tools and concurrent-write refusal. Then perform one
real production handoff without purchasing duplicate media. Unavailable host
accounts/permissions remain named external blockers, not a supported-host pass.

### W2 - Add the Wow & Enjoyment Analyst and real entertainment acceptance

Why: correct images and legible causality can still produce a dull film.
Audience enjoyment is an explicit product goal, not optional technical polish.

Changes:

1. Add `.github\agents\microfilm-entertainment-reviewer.agent.md`, read-only and
   project-local. Integrate its instructions into the shared review skill,
   canonical studio skill, reviewer/workflow lists and README.
2. Add `docs\entertainment-review.md` with anchored 1-5 editorial dimensions:
   wow/beauty or freshness, enjoyment/genre reward, anticipation, earned payoff,
   pacing/boredom, and voluntary replay/share appeal. Include reasons and
   timestamp/frame evidence, not just numbers or a blended "viral score".
3. Respect genre: warmth, awe, laughter, nostalgia, satisfying resolution and
   contemplative beauty can all be enjoyable. Do not force shock, overstimulation,
   a twist, sadness, fast cuts or particles into every film.
4. Ask: what is rewarding in the first view, where attention weakens, does the
   payoff repay the hook, what is memorable, and is replay motivated by pleasure,
   a new detail, or confusion? Inspect the actual picture and sound separately.
5. Treat "dopamine" only as a reward/anticipation hypothesis linked to the
   existing evidence map. Do not infer neural release from scores, chills,
   watch time or replay. State editorial opinion versus actual viewer reports.
6. Add a required final review area, `entertainment-wow-enjoyment`, to
   `REVIEW_AREAS`; use existing revision/hash binding and failure invalidation.
   Record actual inspection scope and actionable repairs. An unsupported-host
   review is BLOCKED, not a guessed pass.
7. Run concept/still feedback early and actual-media review before delivery.
   Predeclare audience/lane and project acceptance criteria before evaluating
   the next version. Repeated indispensable-payoff confusion or credible
   boredom findings require a diagnosed revision, not merely a higher score.
8. Keep entertainment reports separate from the existing seven-criterion
   scenario rankings initially. Do not invent 41 retrospective scores or
   silently alter ranking weights. Later weight changes require evidence.

Acceptance: workflow tests reject missing/stale/failed entertainment review at
final approval and preserve it only for unchanged reviewed media. Sample
comedy/poetry/connection cases demonstrate lane-sensitive assessment. The pilot
receives a timecoded actual-media report, concrete repairs/retest where needed,
and honest disclosure that editorial approval is not audience validation.

### W3 - Finish and actually review the father-son pilot

Why: the requested working film is the principal undelivered artifact.

Changes/actions, owned by the current producer:

1. Reinspect existing revised cast and all four endpoints side by side. Keep
   the toddler/father identities, relative scale, wardrobe, bench geography,
   two-hand lightweight-jacket action, dry-seat evidence and motivated lighting.
   Retire the earlier cast only as an active reference; preserve its history.
2. Evaluate opening hook, beauty/enjoyment and story payoff before buying motion.
   Record diagnosed issues with frames. Repair only affected approved images,
   under current quote/consent. Do not regenerate all endpoints for minor polish.
3. Lock actual accepted endpoints, script, shot transitions, pacing, lighting,
   effects and sound route together. The 8-second suggestion is not an approved
   replacement for the current 10-second draft. Any duration change updates all
   dependent beats, requests, budget and approvals first.
4. Retrieve live forms and exact reference-bound quotes. Check limits, media
   size/type, genuine start/end refs, per-request cap, remaining budget and
   active duplicate jobs before each submission. Preserve job IDs immediately.
5. Generate only the next authorized shot/bounded batch. Inspect complete motion
   for identity, hands/coat contact, age/scale, grounded shadows, rain behavior
   and achieved reveal/response/hold timing. Record actual event times.
6. Inspect actual playback/listen with a capable host or human. If perception
   is unavailable, create the inspection artifacts and explicitly hand off;
   stills or a successful decode do not establish full review.
7. Assemble accepted footage via the existing FFmpeg path. Decide intentionally
   between silent, native or separately mixed audio. Silence is a valid pilot
   choice only if its artistic/entertainment test passes; it does not prove W5.
8. Verify duration/frames, resolution/aspect, full decode, streams, seams,
   framing, caption/text route if used, audible boundaries and accessible copy.
   Export an actual reviewable final plus a concise hash-bound delivery record.
9. Run all applicable story, pacing, visual, sound, evidence, entertainment and
   delivery reviews. Fix diagnosed failures within approval; do not enter an
   unbounded taste/reroll loop. Retain uncertainty and obtain actual user final
   acceptance separately; do not auto-publish.

Acceptance: real MP4 and associated provenance/edit/review evidence, no current
substantive technical or stated creative failure, all four endpoints preceding
motion, no unaccounted charges, and explicit agent/user/publication status.
Human/device evidence that cannot be obtained is a visible delivery gate.

### W4 - Complete the supplied reference-Reel study and adaptation

Why: a Reel URL and a preparation tool do not satisfy full-video understanding.

Changes/actions:

1. Obtain the supplied reference as an authorized playable export or genuinely
   supported normal-access source. Request a local MP4 if Instagram cannot
   provide authorized access. No cookie scraping or access-control workaround.
2. Reuse `scripts\reverse.mjs` / `lib\reverse.mjs` for source hashes, full-span
   samples, transition expansion, exact playback and all detected audio tracks.
3. Route to an actually capable reviewer. Record complete motion/listening
   coverage, contiguous timecoded screenplay/action, camera/blocking,
   light/shadows, pacing, text and sound. Label inference and unknowns.
4. If speech/singing exists, obtain and verify a legitimate transcript. An
   unsupported host must hand off instead of claiming no speech or full review.
5. Collect actual like/change/avoid feedback, then generate original adaptation
   alternatives and a concrete improvement hypothesis. Use the existing
   `remake-brief` handoff; never equate compiled structure with better artistry.
6. Select an adaptation only with applicable authorization. If a resulting
   proof-of-concept is requested, run it through the same actual-media gates
   and bounded budget; do not claim a new film has been made from a brief.

Acceptance: source-bound complete analysis, validated real feedback and an
original adaptation brief. The user approves whether it satisfies the requested
"similar or better" direction; measured superiority is not promised. Missing
export/rights/perceptual access remains an explicit blocker. This does not block
the independent original pilot.

### W5 - Implement and prove audio, song adaptation and singing routes

Why: `film song-plan` calculates timing and blockers; it does not edit or sing.

Changes:

1. Select the least expensive suitable real route for foley/ambience/music and
   an authorized human or singing service for actual vocals. Verify service
   availability, terms, inputs, commercial/platform/territory rights and cost.
   No invented standalone OpenArt endpoint or assumed stems.
2. Reuse existing asset/provenance and assembly paths. Where repeatable local
   editing is needed, add a small `lib\audio.mjs`, `scripts\audio.mjs` and
   focused `test\audio.test.mjs`: approved excerpts, phrase-preserving trim,
   bounded pitch-preserving tempo adjustment, fades and duration/level checks
   using existing FFmpeg. Do not build a DAW or install a new stack by default.
3. Keep BPM math, perceived pace and actual pitch/diction quality distinct.
   Document supported tempo ranges from the tested route; reject impossible
   fits rather than truncate words or silently change pitch.
4. For one selected test picture, compare a cleared nostalgic option, a modern
   option and an original/foley control. Discovery, licensing and subjective
   choice remain real work, not a frozen "trending" list.
5. Exercise actual singing with an original or properly cleared short phrase
   and authorized voice. Inspect diction, breath, phrase integrity, artifacts,
   pitch/timbre and sync. A tone fixture is not proof of singing capability.
6. Save replaceable accepted audio, cues, rights scope, hashes and review
   evidence privately. Update song/music skills and route documentation to say
   exactly what works and what needs an external operator/service.

Acceptance: focused software/FFmpeg tests plus actual listened-to adapted audio
and an actual authorized sung example. At least one real complete audio route
is usable on a film. Nostalgic-track clearance, service access, paid generation
and listening support can block their respective subitems; a silent pilot must
not mark these capabilities complete.

### W6 - Make requested beauty/effects operational, not a list of adjectives

Why: hooks, butterflies/nature and illumination need an actual execution route;
the current assembler is not a compositor.

Changes:

1. Add a capability table to `docs\visual-development.md` covering golden
   butterflies, flowers, sakura, rain, wind/trees, autumn and illuminated/glow
   accents. For each specify intended story job, route, depth/masks, timing,
   light/shadow behavior, restrictions, failure signs and fallback.
2. Choose in-generation effects where the accepted endpoints and real motion
   route support them. For compositing, choose an actually available editor
   workflow or a narrowly scoped tested FFmpeg extension for simple overlays.
   No claim that alpha overlay implements tracking, occlusion or relighting.
3. Use original/cleared effect assets; test edges, motion, masks, scale, material
   response, spill/shadows, flicker and face/prop readability at phone size.
   A glow halo is not a physically lit face.
4. Demonstrate every route advertised as operational with actual media. For
   motifs sharing a route, document which behavior has been inspected; do not
   promote untested bloom/growth or emissive interaction from a rain test.
   Unverified motifs stay pending until their relevant behavior is exercised.
5. Activate effects in the pilot only when they improve its chosen experience.
   A restrained rainy pilot need not contain all seven motifs. A rejected
   decorative addition does not justify rerendering good performance.
6. Update packet checks/reviewers only for supported required route fields;
   tests must fail design lock for missing effect assets, rights or preflight.

Acceptance: reproducible route instructions, actual effect/media evidence and
honest supported/unverified labels for the full menu; selected pilot effects
pass visual and entertainment review. New paid experiments require separately
bounded approval and cannot consume the pilot's reserve by implication.

### W7 - Reconcile records and validate the changed implementation

Why: stale completion documents and old green reviews cannot describe new code,
new media or new acceptance rules.

Changes:

1. Update `docs\request-coverage.md`, `data\roadmap.json`,
   `data\workflows.json`, README and relevant instructions to agree on current
   counts, real artifacts, blockers, approval authority and tested scope.
2. Preserve earlier critic records as dated baseline evidence. Append a named
   current-scope review/reconciliation rather than rewrite history or label
   the new implementation/film green from the old verdict.
3. Add focused regressions in existing workflow/CLI/assembly/reverse tests for
   changed behavior only. Add audio/connector tests only when those routes are
   actually introduced. Use synthetic fixtures, no real spending in tests.
4. Retain existing model/reference, credit cap, active-duplicate, failure,
   source-revision, native-audio timing, genre and text-led regressions.
   Add handoff/approval/entertainment regressions specified in W0-W2.
5. Run syntax and project/workspace validation first. Run focused tests for
   changed behavior. Obtain explicit approval before a time-consuming full
   suite, render or integration experiment; then run the repository-required
   checks/FFmpeg cases without silently skipping unavailable integrations.
6. Review exact changed artifacts with a bounded independent critic when
   authorized. Repair substantive findings and obtain same-reviewer
   reconciliation. A structural pass never approves actual film perception.

Acceptance: current test results/review scope, source/artifact hashes, no
unexplained skip or stale success, no broken documented entrypoint, and an
up-to-date matrix showing each request closed or explicitly blocked.

### W8 - Test real enjoyment and chosen-lane demand

Why: viewers are here to enjoy; a technically correct film or spreadsheet score
does not validate the product or earning potential.

Changes/actions:

1. Refresh a bounded direct-competitor sample for the actual short-film lane:
   account/source, sampling rule, post age, genre, hook/payoff, originality,
   observable results and limits. Separate Instagram data from YouTube proxies,
   advertising reach, follower counts and actual purchase signals.
2. Predeclare intended audience, interpretation, enjoyment questions, primary
   outcome, evaluation window and stopping rule. Do not select thresholds after
   seeing favorable results or invent an industry benchmark.
3. Extend `docs\review-measurement.md` and the existing experiment template with
   free-response enjoyment, surprise/beauty/comedy/feeling, boring moment,
   memorable payoff and why replay/share. Record comprehension first, before
   leading reward labels. Keep first-view versus replay answers separate.
4. Use actual fresh-viewer answers. Compare locked-picture audio or a bounded
   pacing variant when isolating that factor; different generated pictures are
   a whole-package comparison. Small convenience samples diagnose, not prove
   universal demand or neuroscience.
5. Publish only under explicit separate approval. Record current platform
   metric definitions, actual counts/denominators, settings and declared
   windows. No average-watch/duration "completion" or views/reach "rewatch".
6. Record all charged attempts, licences and edit effort per accepted film.
   Audience interest is not earnings: keep inquiries/commissions/purchases
   separate, and do not claim revenue absent evidence.

Acceptance: dated competitor evidence and an actual anonymized viewer report,
with diagnosed revisions/limitations. Organic results require an authorized
release and elapsed observation window. If those are unavailable, finish line
C remains pending; do not call the whole project audience-validated.

### W9 - Deliver, hand over and persist

Why: a local-only result and stale GitHub checkout are not a reusable studio.

Changes/actions:

1. Deliver the actual pilot with exact version/hash, playable export, edit/cues,
   accessible description, cover/post copy where applicable, review findings,
   costs and outstanding user decisions. Do not copy InterviewReel assets.
2. Provide the tested source entrypoints and a private handoff method for media,
   manifests and feedback. Generated/private work remains ignored; a public
   Git clone alone is not a complete production-state backup.
3. Verify restore/relocation of a private handoff and a fresh source checkout
   with documented prerequisites. Do not publish private media, signed URLs,
   account data, reviewer identities or active-job secrets.
4. Under commit/push approval, inspect the diff/staging scope, run the approved
   required checks, commit intended source/docs, push and verify remote SHA.
   Never stage unrelated active changes blindly or delete prior work.
5. Report finish lines A/B/C separately, with evidence links and an owner/next
   action for every remaining blocker. Update canonical files in place; no
   "final-v2-final" documentation copies.

Acceptance: verified authorized push, usable private-state handoff, tested
resume instructions, and a final request-to-evidence reconciliation with no
unmentioned pending requirement.

## 5. Dependencies and execution order

| Work | Prerequisites | Can proceed independently | External approval/input |
|---|---|---|---|
| W0 state/authority | Production-owner checkpoint before migration | Read-only reconciliation now | Actual delegation scope; migration/write approval |
| W1 agent integration | W0 contract for mutating handoff | Host capability research and read-only adapters | Host accounts/auth, connector writes, real handoff |
| W2 entertainment analyst | W0 before final-gate migration | Draft reviewer/anchors now | Implementation approval; capable media reviewer |
| W3 pilot | Current producer; W0/W2 before claiming the new final contract | Continue its already authorized current workflow without source interference | Current generation limits/budget, actual perception, user final decision |
| W4 reference study | Playable authorized reference | Does not block original W3 | Local export/rights, transcript where needed, feedback |
| W5 audio/singing | Picture for synchronization; W0 authority | Route research and software fixtures | Track/voice rights, actual performance/service, listening |
| W6 effects | Accepted design for a selected use | Route discovery/isolated cleared examples | Effect assets/editor, paid test consent if needed |
| W7 validation/reconciliation | Relevant changed W0-W6 artifacts | Validate bounded independent changes as ready | Explicit approval for costly/full checks |
| W8 audience/demand | Finished reviewed version for viewer/release tests | Bounded competitor refresh now | Real viewers, release approval, elapsed window |
| W9 delivery/persistence | W3/W7 for pilot; exercised W1/W4-W6 for capability claims | Source/private handoffs can be staged per verified milestone | Actual user acceptance and commit/push approval |

Do not make the reference export, singing or every effect a prerequisite for
delivering the independent pilot. Conversely, do not mark those studio features
done merely because the pilot used silence or rain. W9 can deliver A while
reporting B/C still open. Full completion requires their evidence, not a waiver
invented by the agent.

## 6. Stop, repair and verification rules

- Unknown current owner, nonterminal/uncertain job or unreconciled reservation:
  stop duplicate submission; inspect/resume the existing job.
- Missing exact quote/consent, exceeded per-request/remaining budget, expired
  reference or unsupported parameter: block that request before spending.
- Missing personal user review: label it missing; use delegated acceptance only
  where explicitly in scope. Never invent full playback, listening or feedback.
- Creative failure: name the observable issue, smallest repair and expected
  retest. Paid repair stays inside its authorized attempt/budget scope; stop and
  propose a revised bounded plan when that scope is exhausted.
- Changed source/packet/asset: revalidate affected contracts/reviews. Do not
  blanket-regenerate unchanged media or recycle an old approval.
- External blocker: record owner, required artifact/permission and next action;
  continue independent work. No silent skip or unrelated scope expansion.

## 7. Independent plan review and reconciliation

Requested review: one bounded GPT-family read-only reviewer, no agents nested,
no media calls, no edits and no full test suite. Challenge the plan against all
original asks and the nine identified gaps. Check exact change/why/acceptance,
sequencing, live-production interference, authority, host integration, actual
perception, entertainment, audio/effects, reference blockers, budgets and final
evidence. Report substantive omissions, not taste-only expansion.

| Revision | Reviewer verdict | Findings and reconciliation | Scope |
|---|---|---|---|
| Draft 1 | PASS | Independent GPT-family AI critic found no substantive omissions or contradictions requiring revision. Changes, rationale, acceptance evidence and independent dependency lanes were adequately specified. No implementation repairs or framework expansion requested. | Plan completeness/feasibility only; no code/media/tests approved |

Reviewed draft SHA-256:
`cd978f5179ac8ee069a565884eea39db734141e5c42888cd9045a90d72f13ac5`.
The post-review change records this verdict and the residual gates only; it does
not change the reviewed implementation plan.

The critic explicitly retained these external gates:

1. Production ownership, authority and budget reconciliation (W0/W3).
2. Actual host transports/accounts and media perception (W1/W4).
3. Authorized source export/transcript, music/voice/effect rights and real
   demonstrations (W4-W6).
4. Fresh viewers, release approval and elapsed observation window (W8).

No substantive reconciliation repair was needed. These gates stay open until
their actual evidence exists; passing software tests cannot close them. The
independent critic performed no edits, media operations or test runs.

A reviewed plan is not implemented code, an approved spend request or proof
that a film, host connector, song/effect or audience experiment works.

## 8. Implementation execution and remaining acceptance

30 October 2026, IST. Preserve the plan-review verdict above as PLAN ONLY.
The producer separately committed/pushed pilot baseline `8f1b8d1`; that is not
this session's source commit. The user then rejected v1's missing sound and
abrupt omitted sitting motion. The producer owns its new 13-second motion/audio
repair, actual jobs/reservations and live manifest. Its new typed delegated
records are preserved; this session did not refresh/migrate/submit over them.

| Work | Implemented / verified scope | Open evidence, owner and next action |
|---|---|---|
| W0 | Typed personal/delegated authority, source/assets/reference binding, expiring/revocable delegation, explicit history-preserving migration, separate final-user gate | Producer already adopted typed repair decisions; no second migration. User/capable reviewer must supply actual final viewing/acceptance |
| W1 | Common host contract, thin Claude entry, official host docs, operator-assisted ChatGPT route, CLI snapshot/claim/transfer, exclusive lock/CAS, synthetic pending-ID/failure preservation and relocation | Host operator: exercise real Claude/ChatGPT/Codex transport/accounts/auth/perception, then real agreed handoff; not advertised as tested automatic integration |
| W2 | Seventh read-only Wow & Enjoyment Analyst, anchored genre-sensitive playbook, required structured final review with actual playback/timecodes, stale/failure tests | Capable reviewer: predeclare repaired-film criteria and inspect actual full picture/audio; no film entertainment PASS fabricated |
| W3 | Reused genuine pilot artifacts/history and recorded actual rejection rather than restarting or pretending delivery | Producer: finish approved motion/audio repair. Reviewer/user: full playback, phone/export, enjoyment and final acceptance |
| W4 | Existing reverse workbench preserved; no inaccessible source or inferred transcript promoted to analysis | User/operator: authorized playable reference/transcript, real perception and feedback. Other concurrent reverse-tool changes are excluded from this session's commit |
| W5 | Local FFmpeg source-hash/rights-attestation/phrase-bounded trim, 0.8-1.25 atempo, fades, sample-peak limiter, decode/duration/level checks and private receipt; synthetic real-encoder/pitch tests | Sound operator: actual cleared nostalgic/modern/original comparison and authorized sung phrase, listened-to diction/phrase/sync. A tone is not singing; sample peak is not true-peak mastering |
| W6 | Full motif route/depth/timing/light/failure/fallback and demonstration ledger; in-generation/editor handoff, no false compositor claim | Visual operator: actual relevant motif/editor demonstrations and playback; rain frames do not prove other motifs, tracking/masks or relighting |
| W7 | Focused regressions, canonical instructions/workflow/coverage/roadmap/README and private-state boundaries reconciled | Verify exact session-only staged source and its restored checkout; no independent implementation/media review claimed from the earlier plan PASS |
| W8 | Predeclared audience/criteria and unprompted enjoyment/boredom/payoff/replay questions in existing measurement/template | Research/viewer owner: usable direct-competitor source sample, actual fresh viewers, authorized release and elapsed windows. Search refresh failed/irrelevant; no results invented |
| W9 | Session-only commit/push authorized; explicit private-bundle/operator handoff instructions, synthetic restore test | Verify remote source SHA. Real private production bundle restore and finished-film/user acceptance remain distinct from source-only push |

Validation record:
- First focused run: 36 passed, zero skipped, including actual FFmpeg audio CLI.
- Restored exact staged source into an ignored verification checkout:
  `npm run check`, full `node --test --test-reporter=spec test` with an explicitly
  supplied existing FFmpeg, and `npm run validate` all PASSED. **62 tests,
  62 passed, zero failed/skipped.** This includes the separately committed
  public-Reel import baseline; this session did not stage its implementation.
- Verified source restore contains this session's selected files, not unrelated
  uncommitted scenario/packet edits. Documentation instructions/reviewer updates
  are validated with the existing project-link/reviewer checks.
- Commit/push is authorized for this session only. Inspect the implementation
  commit and verified remote SHA in Git/delivery output; do not infer private
  media backup or film acceptance from the source push.

Finish line A is still open on the producer's repaired film and actual review.
Finish line B has implemented local tooling but real host/reference/vocal/effect
demonstrations remain open. Finish line C has no fresh audience/business result.
No new paid generation/upload/publication was performed by this session.

## 9. Pre-generation frame/beat requirements and beautiful characters

User approval, 30 October 2026, IST: plan with a critic, then improve the
workflow; include beautiful characters. This extends local tooling, not consent
for generation, recasting, publication or a new soundtrack. Preserve other
sessions' uncommitted direction/bundle/audio work and the production owner's
private manifest. No automatic migration or re-approval of historical media.

### What changes and why

Before this extension, the packet had separate story, lighting, motion, effects
and emotional direction. `frame-plan` export contained endpoints/timing only.
Coordinated direction was enforced at design lock, too late to require a complete
provisional specification before the first paid cast/scene operation.

Add one structured `framePlan` covering the complete intended delivery timeline.
Frame-wise means half-open integer frame ranges at a declared delivery FPS,
plus explicit beginning/intermediate/ending action states. It is not hundreds
of independently generated images or a promise that a provider obeys exact
timestamps. Source-generation FPS/durations may differ; conform and inspect
actual achieved timing after generation.
Use one seconds-to-delivery-frame conversion in validation/export:
`round(seconds * fps)` with a declared nearest-frame quantization tolerance of
half a delivery frame. Reject collapsed intervals after conversion. Canonical
direction beats have stable IDs; a frame interval must be contained in its
actual shot AND referenced beat, not merely name an existing ID.
Resolve all overlapping canonical effects/audio cues by converted timing.
Split intervals at relevant timing changes or retain explicit timed subevents;
never select only one overlapping sound or attach an inactive effect.

| Requirement | Explicit planned evidence |
|---|---|
| Story/attention | Range's story purpose, information viewers should notice and direction-beat/shot association |
| Character performance | Required identities, visible/offscreen state, intention, emotion, expression, gaze, body language and screen position |
| Beauty/cast design | Per-identity intended appeal/style, age-appropriate presentation, distinctive natural features, wardrobe/grooming, avoid list and observable acceptance criteria |
| Camera/composition | Framing, focus priority and camera motion or explicit locked choice |
| Lighting/shadows | Resolve canonical lighting plan; declare interval-specific change or explicit unchanged state, with key/fill/exposure/contact/cast-shadow requirements visible in export |
| Motion/animation | Initial, intermediate and final state, readable action, contact/weight/physics and animation style; explicit stillness is valid |
| Effects/environment | Exact active canonical effect IDs, timing/depth/occlusion/light/shadow plan or explicit none |
| Sound | Resolve canonical cue/palette/direction roles, including intentional silence and actual rights/route boundaries |
| Transitions/continuity | Continuous action or planned cut at each boundary, causal justification and canonical continuity invariants |
| Acceptance | Range-specific observable checks and forbidden artifacts; no automatic beauty/enjoyment certification from filled text |

Reference canonical packet fields rather than fork lighting/effect/audio plans;
export a resolved view so requirements can be reviewed together. Every range
must identify its shot and emotional direction beat; reject gaps/overlaps,
fractional/out-of-range frames, unknown identities/effects and cross-shot
intervals. Effect changes and essential action boundaries must be represented,
not hidden inside a generic whole-film statement. Explicitly assess whether
start/end poses and transition mechanism can show the required intermediate
action; a sitting beat cannot be satisfied by two unrelated endpoint poses.

Beautiful characters means deliberate original, appealing, expressive and
coherent casting for the chosen world, not a universal beauty score. Children
remain naturally charming and age-appropriate; do not adultify a toddler.
Adult beauty/handsomeness may be a style aim without celebrity imitation,
compulsory skin tone, homogenized faces, cosmetic filtering or broken anatomy.
Keep diversity, distinctive identities and natural material/skin detail.
Existing accepted identities are not regenerated merely to satisfy new prose.

Explicit VFX palette requested by the user: glitter/sparkle dust, neon glow and
neon trails, golden shiny butterflies and golden butterfly dust, sakura petals/
flower dust, plus optional fireflies, bokeh, soft bloom, light rays, rain, wind
and autumn leaves. Extend the existing visual-development palette, not a second
playbook. These are selectable treatments, not compulsory overlays or a claim
that a renderer/model already implements them. For every activated effect,
require appearance/material/color, density/intensity/scale and emission versus
reflection intent in addition to the existing route/timing/motion/depth/
occlusion/light/shadow/fallback fields. Link active frame intervals to these
canonical effect cues, including timed starts/stops and overlapping particles.
Neon/emissive dust needs an explicit spill/shadow decision; a glow halo does
not prove relighting. Actual supported model/editor tests remain separate.

### Implementation and compatibility

1. Add `validateFramePlan` to the workflow contract. Read-only validation may
   inspect legacy packets without this new field; if present, validate it.
   New preproduction advancement and every paid-generation preflight require
   the complete plan, including direction and character-design requirements.
   Validate scene/motion helpers too so calling a different helper cannot
   bypass the planning check. Reuse existing consent, hash, budget and owner gates.
2. Before first generation, accept a complete provisional plan using intended
   identities and planned states, without requiring nonexistent generated IDs.
   After actual cast/scenes, reconcile the same plan with real accepted assets
   and obtain the existing design lock before motion. No circular requirement
   that motion exist before its own planning gate can pass.
3. Keep the plan inside `productionDraft` so existing production fingerprints,
   stale-packet rejection and review invalidation apply. A design/beauty change
   is not an organization-only change; renew affected approval, no blanket reroll.
4. Update all four existing example packets coherently, not by inserting
   placeholders or inventing media acceptance. Keep scene/story differences
   and explicit quiet/poetry/comedy possibilities. New expectations do not
   retroactively describe how historical assets were generated.
5. Upgrade the coordinated production bundle's frame script to include the
   full resolved requirements, source revision and same shared timeline.
   Link root AGENTS/instructions, studio/production-direction skills and
   workflow/visual/bundle docs; do not create a second canonical playbook.
6. Add focused regressions for missing/incomplete plans, coverage and reference
   errors, action-state/camera/lighting/character-design omissions, unknown
   effects, stale revision, consent remaining closed, and complete valid lane-
   specific examples. Verify read-only legacy inspection still works but new
   paid/preproduction operations cannot silently bypass the gate.
7. Run scoped tests and required syntax/project validation; use existing full
   suite approval for short local regressions, no paid media calls. Preserve
   concurrent source deltas and report exact tested/untested scope. A critic
   PASS for the plan is not a film/beauty/entertainment PASS.

### Critic and reconciliation

First critic: REVISE, one substantive finding. A known beat/effect ID can still
refer to the wrong time. Reconciled above: one quantization policy, stable beat
IDs, temporal containment and resolved overlapping cue timing. Add regressions
for a known-but-wrong beat, inactive effect, overlapping sounds, fractional
boundaries, unchanged hold and exact last-frame coverage. The critic otherwise
accepted the provisional gate, action states, beauty and legacy safety scope.

Follow-up critic: PASS for revised section 9, plan only. Timing repair and the
explicit VFX palette/controls resolved the finding; no remaining substantive
plan correction. No implementation, film, beauty or effect performance was
verified by this critic. Implementation proceeds against this reconciled scope.

### Execution evidence

Implemented the reconciled scope in workflow validation, paid/reference
preflights, resolved bundle exports and all four example packets. Character
reviews now bind the new beauty designs without changing legacy review hashes
when no frame plan exists. Original accepted media and the producer's manifest
were not migrated, reapproved or regenerated.

Added the 14-treatment inspectable `film effects` palette and documented
glitter/sparkle dust, neon glow/trails, golden butterflies/dust and sakura
petals/flower dust with appearance, density, intensity, scale, light mode,
depth/occlusion/spill/shadow and fallback controls. Updated root instructions,
studio/direction skills, visual reviewer and existing workflow/bundle/coverage
playbooks. This adds planning capability, not a particle renderer.

Validation: the shared working tree passed 78 tests, including four unrelated
concurrent transcription tests. A separately restored exact session-only staged
source then passed **74 tests, zero failures/skips**, with real synthetic FFmpeg
checks enabled, syntax checks and project validation (41 scenarios, four
packets). Targeted regressions cover complete/legacy gates for all generation
kinds, coverage errors, wrong-time known IDs, malformed canonical effects,
overlapping sounds, fractional/collapsed cues, quiet holds, stale beauty approval
and fully resolved department exports. Whitespace checks passed.

Persistence scope is 23 explicitly selected source/documentation files over the
committed coordinated-production baseline; unrelated transcription/reverse-
engineering changes remain excluded. Actual effect demonstrations, capable
playback/listening, phone/enjoyment review and personal final acceptance remain
separate production gates. No paid call, upload or publication occurred here.

## 10. Camera choreography, emotional dialogue and bounded production proof

User-directed extension: implement camera plays/movement/zoom and emotional
dialogue, then perform a real production test. Typed fields alone do not close
the production requirement.

| Change | Why / required result |
|---|---|
| Canonical `cameraPlan` | Time movement, axis/framing, direction, speed/easing, zoom type and focus for every shot. Distinguish physical travel/parallax from optical zoom or a digital crop; require feasibility, fallback and observable acceptance |
| Canonical `dialoguePlan` | Explicit no-dialogue or original exact lines, voice/speaker/language, emotion/intensity, intent/subtext, delivery, pace, pauses/breath, pronunciation, body/gaze performance and visible/offscreen lip sync |
| Creation/prompt/export binding | Require both plans before new creation; resolve overlapping cues into frame scripts and share motion/camera/edit/audio exports. Native prompts carry the canonical instructions; disabled exposed native audio blocks spoken dialogue |
| Bounded post renderer | Actual digital zoom/pan/tilt, with easing/crop protection, source-shot binding and review-only explicit legacy mappings. Not a physical camera, optical lens, rack-focus or voice synthesizer |
| Actual review gates | Camera changes require `camera-execution`; spoken lines require listened `dialogue-performance`. Full playback, every planned segment/line, timecoded findings and no unresolved failures. Samples, ASR, preserved audio and successful encoding do not grant these passes |

Updated root instructions, studio/cinematography/production/sound skills, visual/
sound reviewer roles and canonical workflow/film-language/audio/bundle/coverage
docs. All eight current examples have intentional camera/dialogue plans; legacy
inspection remains possible without retrospective media acceptance.

### Real evidence and retained failure

Created non-destructive camera review variants from existing Quiet Crayon footage:

- **v002: sampled framing FAIL.** The inherited editorial child cutaway excludes
  most adult faces, contradicting the proposed all-faces requirement. Retained
  the video and failure receipt; a subtle crop cannot repair missing source faces.
- **v003: technical proof and sampled framing only.** Used the continuous wide
  source instead: hold 0-2s, digital push 1.00 to 1.08 during 2-8s, tighter hold
  8-10s. Actual 1080x1920, 30fps, 10 seconds/300 decoded frames; no detected
  black interval, encoded audio payload unchanged, original manifest unchanged.
  Five viewed frames at 0/3/5/7/9.9s retain all three faces and blue crayon.
  This does not certify full motion, mother-to-child gaze, emotional speech,
  lip sync, physical dolly/parallax, phone playback or personal final approval.

Private media and receipts are under `outputs\the-quiet-crayon\v002` and `v003`.
The original Korean cast, original film and active manifest were not recast.

### Approved next test and actual blocker

The user explicitly selected the Quiet Crayon test only, English dialogue,
delegated agent creative review and a **1,000-credit total ceiling**. The latest
approved casting is an original fair-complexioned Indian family, classic
cinematic glamour and an athletic young-adult male inspiration, not celebrity
replicas. The child remains naturally age-appropriate. Approved maximum outputs:
**one cast reference, up to two scene references and one video attempt**.
No automatic retries, publication or fabricated personal acceptance.

Prepared and validated the separate private packet/authorization in
`workspace\the-quiet-crayon-camera-test`: Ananya33, Arjun35 and Diya6, the
planned camera hold/push/hold and mother's original reassurance at 4-8s.
This is a plan, not actual casting or a new spoken take. The motion prompt is
within the conservative 2,000-character ceiling. Scene endpoints require the
genuine newly accepted cast and stable table/axis/light; no old reference ID is
silently reused for the Indian cast.

Initial OpenArt live discovery failed with OAuth HTTP 401. The user confirmed
reconnection; subsequent OpenArt discovery returned no tools. No fresh quote,
upload or new paid generation was submitted; this session's new spend is zero.
Resume through available official tools only: refresh live model/form/account/
job/quote data, claim the separate test workspace, inspect the real cast before
dependent scenes, bind accepted endpoints and submit at most the approved take.
Actual full playback/listening, camera/per-line emotional/lip-sync review and
user final acceptance remain **BLOCKED/PENDING**, not silently complete.

### Software verification and source scope

The shared working tree passed syntax checks, project validation (45 scenarios,
eight packets), whitespace checks and **95 tests, zero failures/skips**, with
existing real FFmpeg enabled. This includes concurrent narrative-format and
reference-audio tests; those implementations are not this session's work.
Focused regressions cover camera timing/type/zoom/focus contradictions, dialogue
speaker/timing/emotion/visibility/overlap, disabled native audio, legacy versus
new-creation gates, source-shot binding/legacy preview mapping, omitted post
camera shots, stale approvals and rejection of sampled/meter-only evidence.
A real synthetic pixel-area test verifies actual zoom enlargement and duration/
frame count, not just encoder exit status.

The separately restored session-only source also passed syntax checks, project
validation and **88 tests, zero failures/skips**, with real FFmpeg enabled.
It excludes concurrent narrative-format/reference-audio implementations and
retains the original Afternoon Again story plus this session's camera/dialogue
addition. The live working tree's newer story remains untouched.

Commit only this session's delta. Preserve concurrent Afternoon Again story/
format/reference work and transcription/reverse changes; verify an isolated
exact source snapshot before pushing. Source tests and source persistence are
not proof that the blocked new camera/dialogue film was generated or accepted.
