# Private full-video reverse-engineering workbench

This project-local skill and CLI prepare a complete-duration reference, enforce
explicit review evidence, then compile an **original adaptation planning brief**
from actual feedback. No external package, ffprobe, provider client, upload,
paid generation, publication, global configuration or controller is involved.
Node 20+ and a separately available FFmpeg executable are sufficient.

No reference has been supplied yet. The tracked template remains pending. A
prepared directory is not a claim that an AI watched, listened, or understood.

## Commands (PowerShell, repository root)

```powershell
$ffmpeg = 'C:\path\to\ffmpeg.exe'
node scripts\reverse.mjs --help
node scripts\reverse.mjs prepare --input 'C:\exports\my-reference.mp4' --workspace reference-001 --ffmpeg $ffmpeg --interval 2 --max-frames 120
# Optional REAL text supplied by the user; no automatic transcription:
node scripts\reverse.mjs prepare --input 'C:\exports\my-reference.mp4' --workspace reference-002 --ffmpeg $ffmpeg --transcript 'C:\exports\my-transcript.txt'
node scripts\reverse.mjs expand --workspace reference-001 --start 2 --end 4 --interval 0.25 --max-frames 40 --ffmpeg $ffmpeg
node scripts\reverse.mjs validate-review --workspace reference-001
node scripts\reverse.mjs remake-brief --workspace reference-001 --feedback 'workspace\reference-001\feedback.json'
```

`FFMPEG_PATH` may replace `--ffmpeg`. Workspace names are new lowercase
letters/digits/hyphens, not paths. Default analysis is `analysis.json`;
`--analysis reviewed-analysis.json` selects another simple filename in the
same workspace. `--out new-brief.json` is likewise a new workspace filename.

An Instagram Reel URL produces actionable `NEEDS_LOCAL_EXPORT` (exit 2), with
no network request or falsely completed job:

```powershell
node scripts\reverse.mjs prepare --input 'https://www.instagram.com/reel/EXAMPLE/' --workspace reference-003
```

There is **no authorized Instagram resolver configured**. Use the platform's
normal download/export where available and permitted, request the owner's
original, then prepare the local file. No login/cookie extraction, private
content scraping, access circumvention or undocumented page parsing.

Explicitly permitted direct public video retrieval only:

```powershell
node scripts\reverse.mjs prepare --input 'https://public-host.example/owned-video.mp4' --download-public-video --workspace reference-004 --ffmpeg $ffmpeg
```

That flag is consent to download this reference, **not** to adapt/reuse/upload
or spend. HTTPS port 443, public IPv4 DNS pinned for the request, HTTP 200,
`video/*`, no redirects, no credentials/cookies, 30s transfer and 250 MiB cap.
IPv6-only hosts and hosts requiring redirects/auth require a local export.
Only the hostname is retained, not a signed URL/query. Errors never log the
URL. All other commands are offline.

## Preparation artifacts and bounds

`workspace\<name>\` is ignored by git. Keep its private contents out of commits:

- `source.mp4`: byte-for-byte original, streamed SHA-256, container duration,
  video dimensions/stream, FPS when reported, rotation notice and actual audio
  stream presence. The fixed filename does not transcode the container.
- `full-playback.html`: offline player for the exact source, not a sampled proxy.
  If the browser lacks the source codec/container, use a trusted local player.
- `frames\frame-<index>-<seconds>s.jpg` and `contact-sheet.html`: timestamps
  cover the temporal span from 0 to just before EOF. The manifest states the
  requested and actual interval plus the small unsampled tail. Frame count is
  capped; long clips automatically use a coarser interval. Image labels are
  requested seek times, not independently measured decoded frame PTS; the
  decoder may select the nearest available frame.
- `audio-track-<stream>.wav`: each full audio track as 16kHz mono listening aid;
  also listen to the original for mix/stereo meaning.
- `manifest.json`: **last-written completion marker**, source/asset hashes,
  frame times, review-pending flags, heuristic scene-cut candidates (threshold
  0.3), separate empty production ledger and all approvals false.
- `analysis.json`: generated **pending** review scaffold. Fill the richer shot
  fields using `data\reverse-analysis-template.json`, never overwrite that
  tracked template with real source descriptions.
- `preparation.json`: initial intent, not completion. On failure it remains
  `preparing`; absence of `manifest.json` means incomplete, not ready.

Inputs: >0–600s, <=250 MiB, max dimension 8192, <=34 million pixels, <=8 audio
tracks. Stills: 2–180 at requested 0.1–60s intervals, maximum 320px side.
Each FFmpeg operation: 120s wall timeout, 2 MiB diagnostics cap. No ffprobe.
Local FFmpeg inputs disable network protocols (`file,pipe` only). These are
bounded short-video checks, not a safe decoder sandbox or an infinite video
analyzer; use trusted FFmpeg builds and local files. Extremely complex codecs
may fail the processing bounds even if duration/size are acceptable.

Every prepare needs a **new** directory; all generated files use exclusive
creation. Bad options fail before allocation where possible. Failed jobs
retain partial artifacts for inspection and cannot overwrite a completed
workspace. There is deliberately no resume/overwrite/delete operation. Choose
a new name after correcting an error. Expansion writes a unique child directory
and never alters the original manifest or prior review. No fixture deletion.

## Actual full review, not screenshot inference

1. Review the sheet for spatial/temporal orientation. It samples the whole
   span, but cannot establish continuity, speech, timing or audio.
2. **Actually play the entire exact source.** Record the real reviewer, ISO
   timestamp, source SHA, and continuous review ranges from 0 to the exact
   metadata duration, each with observations. Scrubbing thumbnails is not
   playback. Review normal-speed rhythm and slow uncertain action.
3. **Actually listen to every full audio stream** if present. No audio review
   can be silently skipped just because there is no transcript. Add one
   separately covered record per detected stream. There is no ASR or music
   API. Spoken/sung words require a real user-provided transcript and manual
   verification against listening. A transcript alone is not listening.
4. Identify every shot or meaningful within-shot segment. Use cut suggestions
   only as hints: flashes, dissolves and within-shot reveals fool detection.
   Expand uncertain cut/contact/light/reaction ranges at 0.1–0.5s plus actual
   playback. Record unresolved requests in `denseReviewNeeded`; resolve them
   before validation.
5. Fill the timeline from 0 to **exactly** `manifest.source.metadata.seconds`,
   strictly adjacent numeric boundaries, no overlaps, gaps, or missing tail.
   Do not round the final endpoint. Every segment needs a timestamped
   `full-playback` observation and, if audio exists, `audio-listening`.

Each shot must describe action/screenplay; dialogue/no-speech evidence;
subject/relationship; camera framing/movement and **approximate** optics;
blocking/contact/geography/continuity; motivated light, cast/contact shadows
and temporal consistency; cut reason/beat rhythm/information progression/
reveal exposure/reaction hold; music/foley/rights. State evidenced absence or
nonapplicability explicitly, not null placeholders. Record uncertainties
and distinguish observations from inferences (`claim`, `basis`, `confidence`).
Exact lens, gear, color temperature and intent are not observable pixel facts.

### Coverage field conventions

Set the analysis `status` to `reviewed` **only after real inspection**:

```text
coverage.wholeSpanSampling.status = "reviewed"
coverage.fullPlayback = {
  status:"reviewed", sourceSha256:<actual hash>, artifact:"source.mp4",
  reviewer:<actual reviewer>, reviewedAt:<actual ISO time>, notes:<actual notes>,
  ranges:[{start:0,end:<exact full duration>,notes:<actual motion evidence>}]
}
coverage.audioListening = {
  status:"reviewed",
  tracks:[{
    stream:<actual stream index>, status:"reviewed", sourceSha256:<actual hash>,
    reviewer:<actual reviewer>, reviewedAt:<actual ISO time>, notes:<actual notes>,
    ranges:[{start:0,end:<exact full duration>,notes:<actual listening evidence>}]
  }]
}
```

Do not paste placeholder angle-bracket text as evidence. For no audio use
`audioListening.status:"not-present"` and each shot speech
`status:"no-audio-track"` with metadata evidence.

For audio present, speech status is `none|spoken|sung|mixed`, always with
`evidence`. Actual dialogue-free listening uses
`coverage.transcript.status:"not-needed-no-speech"`. Spoken/sung words require
`speech.transcript:{text,provenance:"user-provided",assetSha256}` and
`coverage.transcript:{status:"verified-user-provided",provenance:"user-provided",assetSha256}`.
The words must occur verbatim in `user-transcript.txt`; supplying timed/translated
text is fine if the quoted segment text occurs in that file. If provided later,
prepare a new workspace with the transcript; do not hand-edit a source manifest
to pretend an unrecorded transcript was ingested. No invented words or singing.
For silent sources use `coverage.transcript.status:"not-present"`.

Keep `rights.privateStudyOnly:true` and `publicUrlIsNotPermission:true`.
For `owned`/`licensed`, record actual holder, precise permission, scope (media,
territory, platform, duration, commercial/derivative/voice/music limits) and
evidence. Unknown rights can support private craft learning, never source reuse.
Underlying composition/recording/performer permissions remain distinct.

`validate-review` fails closed for missing evidence, gaps, pending audio,
missing required transcript, source/transcript hash changes, approval
escalation, unresolved dense-review requests and incomplete schemas. Successful
validation fingerprints the analysis but **only verifies structure, files and
human attestations**, not perceptual truth or source copyright clearance.
Reviewers must not assert evidence they cannot actually perceive.

## Real feedback → original adaptation blueprint

Store real feedback privately as `workspace\<name>\feedback.json`:

```text
{
  schemaVersion:1, sourceSha256:<actual source hash>,
  reviewer:<actual author>, providedAt:<actual timestamp>, decision:"adapt",
  goals:[<actual requested outcomes>],
  keepMechanisms:[<craft principles, not copied scenes>],
  changeRequests:[<actual requests>], avoid:[<actual avoidances, or empty>],
  constraints:{seconds:<3–60>,maximumShots:<1–6>,dialogue:<actual constraint>},
  originalDirection:{
    isOriginal:true,
    premise:<new premise>, characters:[<new identities>], setting:<new setting>,
    visualStyle:<chosen style>, audioDirection:<new cleared audio/silence plan>,
    beats:[<original actions, count <= maximumShots>]
  }
}
```

No fabricated feedback/default selection is supplied. The assistant may develop
and show proposed original directions first; record one as actual feedback only
when the user actually chooses/supplies it. `isOriginal` is a human attestation,
not an automated plagiarism determination.

The CLI is a deterministic planner, **not a screenplay-generating AI**. From
the supplied original direction it emits a provisional new-story blueprint,
constraints, identity/style direction, two alternative treatment prompts,
untested quality hypotheses and original per-beat shot/keyframe/motion/light/
pacing/audio planning handoffs. Equal beat timing is explicitly provisional.
It never copies the source action/dialogue/shot sequence into the handoff.
Have the canonical creative skill refine the original story and test alternatives.
There is no promise of “better” performance, retention or emotional response.

The draft carries source/analysis/feedback fingerprints, the reference jobId,
a new briefId, empty provider-job ledger and `generationApproved:false`.
Reference upload, selection, generation and publication remain separately
unapproved. No source rights claim changes that boundary. Actual provider jobs,
quotes, retry limits, consent and asset hashes belong to the existing production
workflow after explicit approval, not this workbench. Source/analysis/feedback/
asset changes invalidate affected approvals. This is planning, not an accepted
production packet.

## Validation and integration

```powershell
node --check lib\reverse.mjs
node --check scripts\reverse.mjs
node --test test\reverse.test.mjs
# Opt-in small synthetic-source FFmpeg smoke, no reference or paid model:
$env:FFMPEG_PATH = 'C:\path\to\ffmpeg.exe'
node --test test\reverse.test.mjs
```

Tests create unique ignored `workspace\reverse-test-*` directories and keep
fixtures. Optional smoke actually decodes a short synthetic source through the
CLI, checks full-span timestamps/audio, pending-review failure, expansion and
no overwrite. It is not a reference understanding or creative-quality test.

The `npm run reverse -- <command>` alias exposes this CLI. Its modules are in
`npm run check` and its tests are in `npm test`. README/master skill discovery,
the `reverse-engineer` workflow and optional `reference-study` roadmap milestone
connect it to the studio. Reviewer roles use the shared review contract. Existing
production approvals and job ledgers remain independent.
