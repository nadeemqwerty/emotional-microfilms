# Topic/version production bundles

One production packet is the source of truth. Department scripts are projections,
not independently invented timelines. Never infer acceptance from a folder name.

```text
outputs\
  <topic-slug>\
    v001\
      scripts\                 story, character-emotion, scene, frame-plan,
                               motion, lighting, camera-edit, audio-music,
                               atmosphere-effects, delivery
      frames\characters\
      frames\scenes\
      frames\effects\
      metadata\                planning packet, produced packet, bundle receipt
      tmpVids\                 retained source motion takes, not final approvals
      audio\                   source/comparison mixes, not implicit acceptance
      finalVid\                <topic>-v001-review.mp4
      reviews\                 source feedback/review history
    v002\
```

Different scripts/topics get different topic folders; every edit/plan revision
gets a fresh positive `vNNN`. Keep rejected versions and actual feedback.
The folder `finalVid` contains delivery candidates, **not automatically accepted
films**. A `review` filename and the receipt explicitly retain pending approvals.

```powershell
$env:FILM_OWNER='<actual-current-owner>'
npm run film -- bundle workspace\<topic>\manifest.json v001
```

For a legacy pilot whose actual generation packet lacks coordinated direction,
provide a complete, explicitly **unapproved next planning packet**:

```powershell
npm run film -- bundle workspace\a-seat-for-dad\manifest.json v002 examples\a-seat-for-dad.json
```

This copies actual media without rendering/generation/upload, verifies source
and destination SHA256 hashes, exports ten department scripts with the same
packet fingerprint and writes `metadata\bundle.json` last. It refuses to overwrite
a version, accept stale hashes, or attach a different-duration delivery.
Use the original owner/CAS workflow for production-state changes; exporting a
bundle never advances stages, grants approval or changes the paid-job ledger.

`metadata\produced-packet.json` preserves the packet actually used, while
`planning-packet.json` and the scripts can hold a proposed next revision.
`planningPacketChanged:true` makes that distinction explicit. Copied historical
assets may include retired cast or rejected sound: consult the original
workspace/reference reviews, not just filenames. Old final assets are listed
as retained legacy deliveries rather than relabelled as the current preview.
The latest hash-bound preview is copied as the review delivery if available.

Every approved assembler output must now use:
`outputs\<topic>\vNNN\finalVid\<topic>-vNNN-<variant>.mp4`.
Flat paths, the wrong topic/version and overwrites fail. Final render does not
become personal acceptance; register/review the actual export as before.
For joined review before sound acceptance, set edit `purpose:"review"`, retain
source registration/rights and use a `-review`/`-comparison` filename. This can
inspect a rejected cue without manufacturing a pass; master gates stay closed.

## Coordination and change control

Before spending, cross-read acting/emotion, scene, frame, motion, camera/edit,
lighting/shadow, atmosphere and sound scripts against the same beat IDs.
Ask what changes, what remains fixed, what the audience should notice and what
emotion the combination communicates. The sound director spots before motion;
actual timing is conformed after motion, never presumed from prompt timestamps.

| Change | Preserve / renew |
|---|---|
| Sound feels heavy/mismatched | Preserve useful picture; revise palette/arrangement/entry/space, compare on the same picture and renew sound/fit/final reviews. |
| Acting/contact is wrong | Diagnose that shot; reuse accepted cast/endpoints where valid; new motion needs bounded consent. |
| Frame/light/geography changes | Renew affected direction/reference/continuity reviews before motion. |
| Organization only | Copy with lineage/hashes; never rewrite history or convert a reject to a pass. |

No automatic move/delete migration is performed. Legacy paths remain valid;
new productions and exports use the structured location. Historical flat files
can be archived only after explicit path/reference reconciliation, not deleted
to make the directory look clean. A partially written version without a bundle
receipt is incomplete: inspect it and choose a new version, do not overwrite it.
All bundle media/private metadata remain Git-ignored.
