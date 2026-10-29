# Generation preflight: spend on a tested plan, not an unchecked request

Verified 30 October 2026 against live OpenArt catalog/forms/quotes and the official
PixVerse references below. This is a conservative pilot policy, not proof that a
valid request will render well or never fail. No generation has run for this pilot.
Account identity and balance must not be copied into this public document.

## Live wrapper constraints

| Route | Exposed limits / fields | Pilot choice |
|---|---|---|
| Nano Banana 2 text2image | imageCount 1-8; 1K/2K/4K; 9:16 supported; no exposed prompt maximum | One 1K portrait image per request, autoEnhancePrompt false |
| Nano Banana 2 image2image | Same output options; 1-14 genuine visualReferences required | Reference the accepted original cast/composition, not independent text-only redraws |
| PixVerse V6 image2video | 1-15s; 360p/540p/720p/1080p; prompt 1-5000 chars; count 1-8; required startFrame; optional endFrame; generateAudio | One 5s / 720p clip, actual accepted start AND end frame; explicit audio flag |
| Seedance Mini image2video | 4-15s; 480p/720p; prompt <=30000; count 1-8; portrait supported; required startFrame; optional endFrame | Costed alternative, not an automatic fallback |

PixVerse's wrapper has **no aspectRatio, fps, seed, width, height or
negativePrompt field**. Do not copy raw vendor parameter names into the OpenArt
request. Portrait comes from the approved portrait source. Native 720p is not
native 1080p just because an export is scaled.

The official ordinary PixVerse image endpoint documents a **2048-character**
prompt, while the first/last-frame endpoint and OpenArt form document 5000.
Until the wrapper's routing is observed, keep every pilot motion prompt
**<=2000 characters**. Do not silently use the more permissive ceiling.

## Media and frame checks before any video

1. Generate every required literal keyframe first; no text2video shortcut.
2. The opening keyframe may double as the original identity/composition anchor
   if it actually contains the readable cast. Do not pay for a redundant sheet.
3. Generate later frames with genuine accepted references. Review all frames
   side by side: age/face, clothes, scale, screen side, hands, coat ownership,
   bench geometry, dry/wet evidence, light and intended action phase.
4. Bind each accepted file/hash to its packet `keyframeId`. The CLI infers this
   from `a-start.png` etc., or accepts an explicit final keyframe-ID argument.
   One good frame is not sufficient to approve a four-frame packet.
5. Verify actual dimensions, MIME, decode, file size and equal portrait canvases.
   PixVerse's direct upload documentation supports JPEG/PNG/WebP, **<20 MB**,
   neither dimension >10000 pixels. These are vendor upload constraints, not a
   verified guarantee of OpenArt's internal importer. Prefer ordinary small
   PNG/JPEG outputs; exact model-specific minimum dimensions are not established.
6. Confirm actual provider references are accessible immediately before quoting
   and submission. A filename, thumbnail, expired URL or invented label/ID is not
   a valid reference. Refresh metadata, not generation, if a URL expires.
7. Record the real per-frame reference objects privately as
   `manifest.keyframeReferences[frameId]` before recording keyframe review.
   The review binds the reference map as well as file/ID hashes; replacing even
   the stored map requires renewed binding verification, not a blind rerender.
   Run `validateMotionReferences` against
   the exact shot parameters before paid motion. It checks all required frame
   assets, current keyframe review, exact start/end bindings and no extra
   unapproved parameters. It cannot prove
   that a human inspected the right content; never invent that evidence.

## Configuration prices and staged waste cap

These are configuration quotes, not authorized or fully resolved media requests.
Refresh each exact request after the real references exist. Eligible MCP discount
is rounded per unit: floor(list * 0.9 + 0.5), then quantity.

| Item | Settings | Current discounted attempt |
|---|---|---|
| Original/guided still | Nano Banana 2, one 1K / 9:16 | 18 credits |
| Silent clip | PixVerse V6, one 5s / 720p, audio false | 63 credits |
| Native-audio clip | Same, audio true | 81 credits |
| Native alternative | Seedance Mini, one 5s / 720p / 9:16, audio true | 180 credits |

For `a-seat-for-dad`, four total keyframes include the opening identity anchor:
**72 + 126 = 198** for the silent visual pilot, or **72 + 162 = 234**
with PixVerse native audio. One repaired frame plus one repaired native clip
adds 99, giving a **333** worst-case planned attempt total. A proposed 350-credit
ceiling is **not approved** until the user expressly accepts it; no requirement
to spend the reserve. Do not add a fifth identity image by habit.

Start with only the opening image (18). If cast/composition is wrong, diagnose
before spending on remaining frames. Stop if the correction is not understood.
All endpoints must pass before motion. Repair only a diagnosed failure within
the specifically approved scope; no blind or repeated reroll.

## Other limits and failure handling

- **Concurrency/queues:** vendor quota depends on account/configuration; OpenArt's
  applicable quota is unknown. Use one active job at a time, count 1. Do not claim
  Plus equals a particular concurrency or requests-per-minute limit.
- **Duration/quality combinations:** use only the selected model/mode's live
  schema and quote. A field being valid in another model is irrelevant.
- **Acceptance != completion:** preserve the actual historyId immediately. Wait
  on that same job; a timeout or nonterminal status is not a failed generation.
  Never charge again merely because waiting ended.
- **Uncertain submission:** if no historyId is returned, stop and inspect provider
  history before retrying. Do not invent a job ID or assume nothing was charged.
- **Failed jobs/refunds:** preserve error/status and distinguish quoted, observed
  and confirmed charges. PixVerse's direct API refund behavior is not a promise
  that an OpenArt attempt is free. Reconcile OpenArt's actual records.
- **Moderation:** ordinary, clothed, fictional father/son; no real-person likeness,
  unsafe/graphic transformation, sexual content, logos or copyrighted soundtrack.
  A benign prompt is not a guarantee of acceptance. Never evade moderation.
- **Audio:** generated voices, music/sync and subjective mix remain untested.
  An audio stream's existence is not listening. Bad audio need not cause a good
  picture to be rerendered: keep a silent review version and address sound later.
- **Exact timing/contact:** prose endpoints and timestamps are targets, not
  guarantees. Locked camera, one main action, no animated sitting/hug/morph, and
  a deliberate cut to an already-seated father reduce risk.
- **Actual review:** rough cuts may be prepared privately for inspection, but do
  not mark final/motion/audio approval from schema checks, contact sheets alone
  or a successful FFmpeg exit. Record perceptual limitations explicitly.

## Reference-Reel test

The supplied Instagram page exposed public caption/cover metadata. The real CLI
returned `NEEDS_LOCAL_EXPORT` and did not allocate a completed reference job.
No playable source was ingested, so screenplay, dialogue, sound and full temporal
analysis remain unavailable. Request an authorized local export for that separate
test. The original father/son pilot does not pretend to adapt unseen source shots.

## Pilot execution checkpoint

The father-son packet is a proposal, not an accepted storyboard or generated film.
Explicit story/bounded-credit approval was requested but has not been received.
No generation, upload, paid retry or publication has run. The opening quote is a
first gate, not permission to spend. Full playback/listening and actual audience
response remain untested; software checks do not substitute for either.

Validation passed: syntax checks, 46 tests with zero skips (including real FFmpeg
smoke), 41-scenario/four-packet project validation and whitespace checks. The two
proposed motion prompts are 923 and 805 characters, within the conservative
2000-character ceiling. These are software/request checks, not media-quality proof.

## Primary sources actually inspected

- [PixVerse first/last-frame request](https://docs.platform.pixverse.ai/first-and-last-frame-video-43051213e0.md)
- [Ordinary image-to-video](https://docs.platform.pixverse.ai/image-to-video-and-video-templates-13016633e0.md)
- [Image upload limits/MIME](https://docs.platform.pixverse.ai/upload-image-13016631e0.md)
- [Concurrency and long-running tasks](https://docs.platform.pixverse.ai/concurrency-rules-2394990m0.md)
- [Errors and parameter/moderation details](https://docs.platform.pixverse.ai/error-details-2490131m0.md)
- [Billing/reconciliation](https://docs.platform.pixverse.ai/billing-and-usage-2394984m0.md)

The raw-vendor information is a compatibility cross-check. All actual submissions
use OpenArt's live field names, actual references, prices and authorization.
