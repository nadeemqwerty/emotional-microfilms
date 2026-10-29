# OpenArt model and audio decisions

Snapshot: 30 October 2026, IST. Live catalog/forms/quotes were read; **no output
quality benchmark and no generation were performed**. Use the wrapper's current
schema rather than assuming a vendor website's features are exposed here.

## Start with the task, not the brand

| Task | Initial candidate | Why it is eligible / what remains unproven |
|---|---|---|
| Original identity/composition anchor | Nano Banana 2 text2image | Inspected portrait/1K form; identity quality untested |
| Reference-guided literal shot frames | Nano Banana 2 image2image | 1-14 refs in inspected form; continuity still needs manual review |
| Cheap, independently repairable motion | PixVerse V6 image2video | Literal start and optional end, 1-15s; portrait inherited from source |
| Alternative motion attempt | H3 Max Turbo image2video | Start/end anchors, 5-15s; no exposed audio toggle |
| Native-audio whole-film alternative | Seedance 2 Mini image2video | 4-15s, 480p/720p, 9:16, audio on/off |
| Subject references in newly directed scene | Kling 3 Omni / Seedance 2 element2video | Real subject refs, portrait and native audio; more expensive or different configuration |
| Longer/native-audio candidate | Wan 3 image2video | 2-30s or auto; 480p/720p/1080p, audio field; no evidence it is superior |

These are candidates, not a quality ranking. Mini versus full, image versus
element mode, and std versus numeric resolution are not controlled comparisons.

## Exact schema distinctions that prevent bad submissions

| Model / mode | Important fields in inspected form |
|---|---|
| Nano Banana 2 text2image | `prompt`; `imageCount` 1-8; `aspectRatio` including 9:16; `resolution` 1K/2K/4K; `autoEnhancePrompt` defaults false |
| Nano Banana 2 image2image | Add genuine `visualReferences` (1-14); use accepted image refs for identity |
| PixVerse V6 image2video | Required `prompt`,`startFrame`; optional `endFrame`; `generateAudio`; lowercase `720p`; **no aspectRatio parameter** |
| Seedance Mini image2video | Required `startFrame`; optional `endFrame`; `generateAudio`; portrait field available |
| Seedance 2 element2video | `visualReferences` required; `generateAudio`; mode selector is inside generation `params` and is not the top-level media mode |
| Wan 3 image2video | `audio`, not generateAudio; `promptExtend` defaults true; `mode` standard/prime inside params; no portrait field in this form |
| Kling 3 Omni element2video | `generateSound`, quality `std/pro/4k`; 1-7 refs; single-shot and `multiPrompt` branches differ |
| H3 Max Turbo image2video | Uppercase `480P/768P/1080P`; no exposed audio switch; promptExpansionMode balanced |

The generic reference shape may include `type`, `id`, `url`, `label`. Use only real
accepted objects returned by current reference tooling; never invent IDs or
sign/import/upload without approval. Reference *identity* is not a literal *first
frame*. An optional endpoint does not guarantee identity, exact action or timing.

Keep prompt enhancement off where exposed if exact continuity matters; this is a
testable control preference, not proof it will improve output. For Wan explicitly
consider `promptExtend:false`; retrieve the current form before use.

## Exact inspected costs

Current eligible campaign: list unit cost -> multiply by 0.9 -> round half up to
whole credits **per unit**, then multiply quantity. Refresh before every paid job;
campaign and final charge can change. Quotes without real refs/prompts here are
planning evidence, not complete requests.

| Configuration, one output | List | Discounted attempt |
|---|---:|---:|
| Nano Banana 2, original or guided 1K / 9:16 still | 20 | 18 |
| PixVerse, 5s / 720p / audio off | 70 | 63 |
| PixVerse, 10s / 720p / audio off | 140 | 126 |
| H3 Turbo, 10s / 768P | 200 | 180 |
| Kling Omni element, 10s / std / sound on / single shot / 9:16 | 350 | 315 |
| Seedance Mini, 10s / 720p / 9:16 / audio on | 400 | 360 |
| Same Mini with audio off | 400 | 360 |
| Wan standard image2video, 10s / 720p | 400 | 360 |
| Seedance full element, 10s / 720p / normal / audio on / 9:16 | 800 | 720 |

Wan's quote response omitted the submitted audio field; this is not an audio
on/off surcharge comparison. Mini audio off showed no saving for that exact quote.
Data/arithmetic are executable in `data\model-quotes.json` / `film budgets`.

### Budget examples, not authorization

- Split pilot: initial identity 18 + four guided stills 72 + four 5s motion
  attempts 252 = **342 credits**; two attempts per shot, not four accepted shots.
- Mini native pilot: identity 18 + four guided stills 72 + two 10s attempts 720 =
  **810 credits**.
- Full Seedance single attempt: identity 18 + four guided stills 72 + one 10s
  attempt 720 = **810 credits**, with no video retry reserve.

These exclude rejected/retried identity frames, extra references, licensing and
labour. Approval is currently zero; no monthly allowance or spend ceiling is
verified. A complete plan must reserve repairs and reprice the
actual inputs, not merely fit nominal first attempts into a balance.

## Separate versus native sound

**Initial production hypothesis: separately editable sound.** This is about
control, not a claim that studies proved it more emotional.

| Separate picture + cleared soundtrack | Native audiovisual |
|---|---|
| Music/foley can be revised without losing a successful performance | May supply useful contact sync in one generation |
| Supports same-picture audio experiments | Has to be heard/inspected; unwanted music/voices may be embedded |
| Requires editing and an actual licensed/original sound source | Stems and clean remixability cannot be assumed |
| Silent visual attempt can be cheaper in the inspected options | Mini's exact audio-off quote did not save credits |
| Physical foley still needs synchronization | Rights and acceptance/retry costs still require review |

No standalone music generator was exposed in the inspected OpenArt MCP catalog.
Separate soundtrack means approved licensed stock, original composition/recording,
or a separately authorized service. Do not pretend a prose music brief is an API.

An Instagram music-library selection may have account, commercial, territory and
off-platform restrictions. AI generation alone does not clear references,
composition, performance/master or provider terms. Keep actual licence evidence.
Short duration creates no blanket exemption.

## The benchmark that would justify a different decision

After story proof and explicit budget approval, compare the same story/refs with
bounded attempts per route. Record all charged attempts, accepted shots, usable
sync, unwanted speech/music, revisions and edit minutes. Main cost:

`total charged credits / number of accepted films`

Also report still/ref/audio costs and labour separately. A failed route with zero
accepted films has no finite cost-per-accepted-film estimate; do not hide failures.
Small tests are diagnostic, not stable model rankings. If pictures differ, audience
preference compares whole production systems, not music alone.
