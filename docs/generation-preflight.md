# Generation preflight: spend on a tested plan, not an unchecked request

Verified 30 October 2026 against live OpenArt catalog/forms/quotes and the official
PixVerse references below. This is a conservative pilot policy, not proof that a
valid request will render well or never fail. The initial Google cast request and
one recovery retry failed upstream quota; a researched Wan provider alternative
then produced the first actual cast image. A later user-directed Korean toddler/
30s father revision completed cast, four scene frames and two motion clips under
explicit delegated review authority; personal human approval is not implied.
Account identity and balance must not be copied into this public document.

## Live wrapper constraints

| Route | Exposed limits / fields | Pilot choice |
|---|---|---|
| Nano Banana 2 text2image | imageCount 1-8; 1K/2K/4K; 9:16 supported; no exposed prompt maximum | One 1K portrait image per request, autoEnhancePrompt false |
| Nano Banana 2 image2image | Same output options; 1-14 genuine visualReferences required | Reference the accepted original cast/composition, not independent text-only redraws |
| Wan 2.7 Image text2image / image2image | prompt <=5000; imageCount 1-8; 9:16; 1K/2K/4K; params.mode standard/pro; thinkingMode; image2image needs 1-9 genuine references | Actual cast used pro, 4K, count 1, thinkingMode false; guided scenes need their own approved source and quote |
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

1. Generate the separate actual cast reference first and stop for user approval.
   Use `characterPlan`, real completed-job output hashes and provenance.
2. Generate every required literal scene endpoint from approved cast references.
   The earlier opening-as-identity shortcut is superseded by this iterative
   character gate. No sketch or text2video shortcut; see visual-development.
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
   The actual Wan 4K-mode cast PNG was 3056x5432 and 22,631,072 bytes: above
   PixVerse's documented endpoint size limit. A free full-size JPEG conversion
   was 1,853,801 bytes; a smaller viewing preview was also made. Preserve original
   bytes/job hash and record each derivative's source hash and transform. Do not
   label converted bytes as the provider's original output or regenerate good
   identities just to change file size. The cast is not a literal video endpoint;
   check the destination model's constraints and applicable upload approval.
   Actual follow-up on 31 October: Wan 2.7 **image2image also rejects reference
   images over 20 MB**, including its own 4K PNG output. Check reference bytes
   before guided scene requests, not only before video. The Indian test cast's
   22,613,793-byte original was retained and converted without recasting to a
   full-canvas 902,681-byte JPEG. Official signed upload plus metadata acceptance
   verified 3056x5432 and the smaller byte count. Preserve failed job, derivative
   lineage and renewed reference-bound acceptance; do not assume a refund.
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
The user set a **1000-credit ceiling per generation request**, not a spending
target, overall production budget or blanket approval. The spend check applies it
to the entire discounted job, including output quantity; existing staged approval
and remaining-budget checks still apply. The provider does not expose a server-side
maximum-charge field, so obtain fresh exact quotes and reconcile actual charges.
Refresh each exact request after the real references exist. Eligible MCP discount
is rounded per unit: floor(list * 0.9 + 0.5), then quantity.

| Item | Settings | Current discounted attempt |
|---|---|---|
| Original/guided still | Nano Banana 2, one 1K / 9:16 | 18 credits |
| Original cast alternative | Wan 2.7 Image Pro, text2image, one 4K / 9:16, thinkingMode false | 14 credits |
| Silent clip | PixVerse V6, one 5s / 720p, audio false | 63 credits |
| Native-audio clip | Same, audio true | 81 credits |
| Native alternative | Seedance Mini, one 5s / 720p / 9:16, audio true | 180 credits |

For `a-seat-for-dad`, the original all-Nano-Banana-2 planning baseline means
**five images = 90 credits**. The unchanged 10s draft is **90 + 126 = 216**
silent or **90 + 162 = 252** with PixVerse native audio. One repaired frame plus
one repaired native clip adds 99, giving **351**; the old proposed 350 cap would
not cover that full reserve. No overall production budget is approved. The earlier
198/234 totals assumed four total images and are superseded, not actual charges.
The actual cast used Wan instead. These baseline totals are not the current
remaining budget; re-quote guided scenes after user acceptance of the cast.

Start with only the character image at its current quote. If cast/scale/style is
wrong, diagnose before spending on remaining frames. Stop if the correction is not understood.
All endpoints must pass before motion. Repair only a diagnosed failure within
the specifically approved scope; no blind or repeated reroll.

### Choose pacing before purchasing duration

The live PixVerse V6 form permits integer durations from 1 to 15 seconds; five
seconds is a default, not a minimum or a mandatory editing block. Same-day
configuration quotes for one 720p silent clip were 42 list / 38 discounted
credits at 3s, 56 / 50 at 4s and 70 / 63 at 5s. For the original five-image Nano
Banana 2 baseline, 5s+3s costs an estimated 191, 5s+4s 203 and 5s+5s 216 before repairs.
Earlier 173/185/198 alternatives used only four images and are superseded.

A shorter reaction is a proposed pacing alternative, not a proven improvement.
The canonical father-son draft remains 10s until user feedback accepts a revision.
Update its beats, shot ranges, duration parameters and prompts together before
approval; do not silently substitute a shorter request. Requote the actual
reference-bound request, and inspect achieved reveal/response/hold timing rather
than assuming the model obeys timestamps. Audio-enabled costs differ.

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
- **Observed upstream quota failure:** an affordable quote and accepted request
  did not establish Google backend capacity. The first Nano Banana 2 cast request
  ended with HTTP 429 `RESOURCE_EXHAUSTED`, reported as `1006: rate_limit`.
  This is not a prompt/schema rejection or proof that the user's credits ran out.
  Record the terminal job and net balance observation; do not claim a refund
  without refund evidence. Do not confuse an operator's one-attempt plan with a
  user-imposed retry prohibition. An authorized bounded recovery may include one
  unchanged-request retry after backoff, terminal-state confirmation, debit
  reconciliation and a fresh quote within the remaining step budget. If the
  same provider fails again, research an appropriate different provider rather
  than blindly looping: check its live form, price, future reference support and
  scope before one deliberate fallback. The per-request ceiling is not an
  unlimited retry budget. Preserve every actual attempt.
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

The initial cast request and one controlled retry reached terminal Google quota
failures. A researched Wan alternative succeeded; that older cast is retained
but retired. The user then explicitly required autonomous completion and changed
casting to a Korean toddler and father in his 30s. The revised real cast and four
guided endpoints were inspected before two exact-reference motion requests.
The jacket stayed on the toddler lap in actual frames, so the final action was
simplified to a small invitation rather than forcing a cloth reveal or hand contact.
Exact quotes, reservations, returned historyIds, hashes, genuine references,
derivative lineage and debit reconciliation are private. Each 2K Pro scene image
cost 14 discounted credits; each silent five-second 720p/count-one PixVerse clip
cost 63. These dated configurations are not promises for other requests.

All 242 source frames were inspected in sequential numbered sheets, with native
face/hand detail crops. Both clips and the actual ten-second/300-frame H.264
export passed full decode and black/freeze checks. The edit cuts at 5s, trims each
121-frame source to five seconds and delivers 1080x1920/30fps by upscale/frame-rate
conversion from 720p/24fps. It is not native 1080p generation. Silence is intentional.
The agent's bounded review is not human real-time playback, a physical phone test,
cold-viewer testing, listening or final publication approval. Those remain pending.

Validation passed: syntax checks, 51 tests with zero skips (including real FFmpeg
smoke), 41-scenario/four-packet project validation and whitespace checks. Both
actual motion prompts fit the conservative 2000-character ceiling. Software
checks and actual bounded frame review are separate evidence, not audience proof.

### User-rejected first edit and organic-action repair

The user rejected the first silent edit: missing music/sound and the skipped
sitting action made its scene change feel abrupt. The first export is retained,
not treated as accepted because its decode and frame checks passed.

The revised 13s review preview reuses the actual cast, four scene frames and
useful invitation/response clips. One additional exact-reference five-second
720p/silent/count-one PixVerse request connects standing `a-end` to seated
`b-start`; its actual discounted charge was 63 credits. The motion shows a step,
bend, lowering and seated settle. All 121 new frames, native contact details and
both final boundary poses were inspected. A continuous original locally
synthesized keyboard/rain bed adds no OpenArt charge and uses no external song
or recording. The actual 390-frame H.264/AAC preview passed full decode,
black/freeze/dropout checks and peak measurement (about -6 dBFS).

This is a review preview, not a fully approved soundtrack or entertainment pass.
Actual listening, real-time joined playback, physical phone checks and human
final acceptance remain pending. A frame audit or healthy audio meter must not
be relabelled as those missing perceptual reviews. No further paid reroll is
implied, and publication remains unauthorized.

Use a dedicated OpenArt project per production rather than accumulating new
jobs in the default project. Persist the actual project-create/list ID and pass
it explicitly on future uploads/generations. A project is an organization
container inside the current workspace, not a new account/team. Verify uploaded
review media with acceptance metadata and the destination project's library.
Creating a project does not move earlier generation history; never claim it did
or delete old assets to simulate organization.

Repair software validation: syntax checks, 62 tests with zero failures/skips
(including real FFmpeg), 41-scenario/four-packet validation and whitespace checks
passed. This is separate from the missing perceptual reviews above.

## Primary sources actually inspected

- [PixVerse first/last-frame request](https://docs.platform.pixverse.ai/first-and-last-frame-video-43051213e0.md)
- [Ordinary image-to-video](https://docs.platform.pixverse.ai/image-to-video-and-video-templates-13016633e0.md)
- [Image upload limits/MIME](https://docs.platform.pixverse.ai/upload-image-13016631e0.md)
- [Concurrency and long-running tasks](https://docs.platform.pixverse.ai/concurrency-rules-2394990m0.md)
- [Errors and parameter/moderation details](https://docs.platform.pixverse.ai/error-details-2490131m0.md)
- [Billing/reconciliation](https://docs.platform.pixverse.ai/billing-and-usage-2394984m0.md)

The raw-vendor information is a compatibility cross-check. All actual submissions
use OpenArt's live field names, actual references, prices and authorization.
