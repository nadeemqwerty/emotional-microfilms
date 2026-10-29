---
name: microfilm-review
description: Project-specific evidence-based review contract for story, cinematography, pacing/hooks, emotional sound, scientific claims and delivery. Reviews prompts, animatics and actual microfilms without confusing planned quality with observed results.
---

# Microfilm Review Contract

Read `AGENTS.md`, the exact selected packet/manifest and the relevant reviewer
definition in `.github\agents\`. Reviewers are read-only; do not silently fix,
spend, generate, upload or publish. Do not launch other agents.

## Evidence discipline

Identify artifact/version/hash and review stage: concept, stills, animatic,
generated motion, audio, final export or audience result.
State what was actually inspected and what could not be played/heard.
Do not pass motion from prompts or sound from an audio brief.
Definitions are available roles, not proof independent reviewers have run.

For reference analysis also inspect the source hash, complete shot timeline,
full playback and every audio track's actual listening/transcript evidence.
Use `microfilm-reverse-engineering`; sampled frames/cut detection cannot establish
complete motion or speech. Check that the adaptation learns mechanisms without
copying protected expression and uses real feedback, not invented preferences.

## Required report

```text
Verdict: PASS | REVISE | BLOCKED
Scope: artifact/version/hash; evidence actually inspected
Finding: observable issue, time/frame/field, why it affects intended meaning
Smallest repair: specific change, not a generic request for "more emotion"
Retest: exact evidence that would resolve it
Untested: unavailable motion/audio/viewer data or rights
```

Use PASS only for the stated scope. A concept PASS is not production acceptance.
BLOCKED means indispensable evidence/rights/approval is missing, not a stylistic
disagreement. Separate objective continuity defects from creative preferences.
Rank findings by story-breaking impact before polish.

## Final cross-checks

- First-view causality and intended payoff for the selected lane; a visible
  choice for connection-led stories, not compulsory sentimentality for comedy.
- Hook promise, information progression, payoff exposure and justified ending
  rhythm; response/hold for connection-led work, not compulsory for poetry/comedy.
- Declared visual-first/text-led comprehension mode. Intentional format text is
  included in muted tests; require phone-size contrast, exposure and composition.
- Identity, screen direction, gaze, prop ownership and plausible contacts.
- Motivated light, source-consistent highlights/cast shadows, contact grounding
  and temporal shadow continuity; declared stylization exceptions.
- Sound perspective, synchronization, no accidental voice, appropriate music
  interpretation, replaceability and actual rights clearance.
- Science/vendor claims match their actual evidence and uncertainty.
- Phone preview, actual encoding/audio inspection and accessible description.
- Exact quote/consent, all charged attempts and resumable historyId ledger.
- Current asset hashes and final user approval; publication is separate.

Use `npm run film -- review ...` only to record a real observed review with user
permission. The latest review for an area/hash governs; a failure supersedes an
older pass. Changed assets require affected reviews again.

For studio-readiness audits use `docs\critic-review.md` and the `critic-loop`
workflow: separate substantive blockers from taste, repair, add focused tests,
re-review with the same critics, then validate/commit/push under approval.
Green names the actual inspected scope, not ungenerated film quality.
