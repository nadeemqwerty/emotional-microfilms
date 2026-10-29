---
name: microfilm-reverse-engineering
description: Private, evidence-bound full-video and Instagram Reel reference analysis, screenplay/camera/light/audio breakdown, and original feedback-led adaptation planning. No generation or uploads.
---

# Reference reverse-engineering workbench

Read `AGENTS.md` and the canonical `emotional-microfilm` skill first. This is a
project-local skill plus dependency-free Node CLI, not an installed provider
plugin or autonomous controller. Read `docs\reverse-engineering.md`.

## Input and scope

1. Obtain a local video the user is permitted to study. Run `node
   scripts\reverse.mjs prepare --input "<video>" --workspace "<new-name>"
   --ffmpeg "<executable>"`. Full original bytes stay in ignored `workspace\`.
2. An Instagram page URL is accepted as an input request, but this workbench has
   no authorized Instagram resolver: report `NEEDS_LOCAL_EXPORT` and instructions.
   Never claim ingestion succeeded, scrape a login, extract cookies, bypass
   access restrictions or request a private account login.
3. Only when specifically authorized, use `--download-public-video` for a direct
   public HTTPS video. No redirects/auth; bounded size/time; no hidden network.
   Public accessibility does not grant adaptation, upload, voice or music rights.
4. Record owned/licensed permissions precisely (holder, permission, scope and
   evidence). Default to private learning of mechanisms, not reproduction.

## Full-reference evidence

Preparation produces source hash/metadata, timestamped whole-span stills,
an offline contact sheet, cut candidates and extracted audio tracks if present.
The source playback is exact, not a few-frame proxy. Browser failure means open
the exact source in a trusted local player; do not mark playback reviewed.

**Stills are not full-motion understanding.** Actually play the entire source,
listen to every entire audio track, and inspect transitions, motion, contact,
shadow continuity, reveal exposure and reaction hold. Use `expand` at 0.1–0.5s
intervals around uncertain cuts/actions, plus normal-speed/slow full playback.
Cut detection is a suggestion, not proof of shot boundaries.

If the current host cannot watch/listen, stop at **prepared, review pending**.
Ask the user or a capable reviewer for actual inspection evidence; never
manufacture it. The CLI validates attestations, not the truth of perception.

Fill `analysis.json` in the ignored workspace using
`data\reverse-analysis-template.json`. Every shot/time segment must cover
exactly 0 through the full duration, no gaps/overlaps. Distinguish:

- whole-span sampling;
- actual full playback review with hash, reviewer, timestamp, ranges and notes;
- actual full-track listening, separately for every detected stream;
- provided transcript and actual verification; no available ASR/music endpoint;
- timestamped observations versus labeled inferences/uncertainties.

Record action/screenplay, dialogue or evidenced absence of speech, subject and
relationship, camera framing/movement/approximate optics, blocking and continuity,
motivated light, cast/contact shadows, editing/beat rhythm/information
progression/reveal/reaction, music/foley/rights. Do not assert exact lens, camera
gear, Kelvin or motivation as observable fact. Inference is labeled.

Use a real user-provided transcript for spoken or sung words. Provide it during
prepare with `--transcript`; if received later, prepare a new workspace from the
same local source and re-review. Silence cannot be inferred merely from missing
ASR. Audio-present references require actual listening even if dialogue-free.

Run `validate-review`; pending/partial/missing evidence fails closed. Keep
generation/upload/selection/publication approvals false. Do not move source
scripts, private review identities, signed URLs or reference media into tracked
files.

## Feedback and original adaptation

Obtain actual structured feedback (schema in the docs): goals, retained craft
mechanisms, requested changes, avoidances, constraints and a genuinely original
direction with new premise/characters/setting/beats/style/audio direction.
As the creative assistant, propose alternatives to the user, but never label
your proposals as already-given feedback or silently invent an approval.

Only validated actual analysis plus actual feedback can enter `remake-brief`.
This deterministic CLI compiles the chosen original direction into a provisional
blueprint; it does not autonomously write a better screenplay or prove quality.
Develop alternative original scripts through the canonical studio's feedback
loop. Learn craft, not a protected screenplay, distinctive frame sequence,
voice, song or performer identity. Scores and quality hypotheses are not
performance predictions.

Carry the reference jobId, source/analysis/feedback fingerprints and new briefId
into downstream planning. The result is a draft with shot/keyframe/motion/light/
pacing/audio handoffs, untested alternatives and `generationApproved:false`.
Actual scenario/storyboard selection, asset rights, uploads, exact model/form/
quote and bounded spend approval remain separate. Preserve actual provider job
IDs if later production is separately approved; this workbench creates none.
