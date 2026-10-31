# Scene, emotion and soundtrack fit

The pilot user liked the revised picture but found its music heavy and
mismatched. That is actual feedback, not a measured audience result. Its healthy
meters and uninterrupted track did not establish the right feeling. Improve
this workflow before commissioning another cue; do not reroll good picture.

## Sound director / music supervisor spotting pass

Read the story, actual character action, scene space and shared beat timeline
before choosing music. State intended feeling and unwanted readings separately
from energy. Tenderness can be low-intensity; an exciting comedy can need a
sharp sting. No compulsory piano, major chord, BPM, silence or genre recipe.

Before design lock, fill `packet.direction`:

- `beats`: shot ID, exact `from/to`, each character's intent, visible emotion,
  performance restraint, audio's story role and intended intensity.
- `soundPalette`: target feeling, unwanted readings, texture, density, register,
  pulse, foreground hierarchy, musical silence, ending and comparison plan.

Every department uses those same shot IDs and times. Compare character emotion,
motion speed, camera attention, light/shadow state and music's implication.
Do not announce a grand climax over an ordinary bench contact. Deliberate
counterpoint is allowed only with an explained story purpose and a listening test.
Required at design lock and motion-spend validation; legacy packets remain
readable, not permission to bypass this new-production gate.

## Emotional dialogue

`dialoguePlan` makes dialogue an explicitly directed performance, not merely an
audio stream. Select `mode:"none", route:"none"` with a rationale for intentional
dialogue-free films; do not force speech into every genre. For `mode:"spoken"`:

- Declare real `native` or `separate` voice route, original speaker identities,
  language, character voice, rights and prohibited imitation/cloning.
- Give each exact original line a stable ID, shot, timing, speaker, emotional
  intent/subtext and intensity, delivery, pace, pauses, breath, pronunciation,
  visible body/gaze performance and visible/offscreen lip-sync requirement.
- Resolve every overlapping line onto frame ranges. One speaker cannot say two
  lines simultaneously; overlapping different voices must be explicitly allowed.
- Put `dialogueInstruction(packet, shotId)` in native motion prompts; enable the
  exposed native-audio control. Do not invent a voice API. Separate voice must
  use an actually available authorized service/recording and synchronization route.

Spoken films also require `dialogue-performance` before sound/master/final
acceptance. Its report needs `picture:"full-playback"`, `audio:"listened"`,
actual listening conditions, every line ID with observed `from/to`,
`wordsVerified`, `speakerVerified`, `intelligible`, `emotionalMatch`, appropriate
`lipSync:"pass"|"offscreen"` and specific evidence, plus no unresolved failures.
These fields attest actual review; filling them without perception is forbidden.
Audio presence, ASR text and lip movement alone cannot establish who spoke or
whether remorse/reassurance sounded genuine. Preserve a rejected take and fix
the implicated performance rather than hiding wrong words behind music or a cut.

## Required listening pass

Use the read-only `microfilm-audio-scene-fit-reviewer` and sound-direction skill.
Definitions are roles, not proof agents were invoked or independent reviews ran.
Watch the complete joined picture and listen to its real exported audio.
Compare the same picture with ambience-only or silence. State device/playback
conditions; compare at comfortable levels, not a louder candidate masquerading
as better. Listen on a phone as part of delivery review.

| Dimension | Call out and isolate |
|---|---|
| Emotional congruence | Does heard emotion support the visible relationship, location and action? |
| Perceived weight | Is bass/low-mid mass, sustain, density or dramatic harmonic movement too heavy? Lower gain is not always the cure. |
| Timbre/register | Attack, brightness, texture and spectral placement: intimate, harsh, threatening or overly polished for this scene? |
| Rhythm/space | Does the pulse rush acting, fill all pauses, spoil anticipation or compete with the gesture? |
| Sync/perspective | Do supported contacts and ambience belong to this space and actual event time? |
| Mix hierarchy | Are human-scale details audible without a score dictating the response? |
| Ending/continuity | Do cue entries, cross-scene bridges and decay let the earned response breathe? |

First diagnose: composition/arrangement, instrument/register, density, timing,
perspective or gain. Change the smallest implicated layer. Preserve picture
when the reported problem is sound. A composed original cue is not automatically
good, professional, emotionally suitable or rights-cleared merely because it exists.

## Structured gate

Copy `data\audio-scene-fit-template.json` into the private workspace. Record
`area:"audio-scene-fit"`, real `evidence` and `result:"pass"|"fail"` via
`film review-json`. A pass requires:

- `picture:"full-playback"` and `audio:"listened"`; intentional silence instead
  permits `no-audio-streams` only with `soundDecision:"silent"`.
- Nonempty `listeningConditions`; a listened same-picture comparison against
  `ambience-only` or `silent` and its actual observation.
- All seven dimension IDs with `verdict:"pass"` and real timecoded evidence.
- Contiguous `segments` covering the whole export: intended/heard feeling,
  weight `appropriate`, relationship `supports` or `intentional-counterpoint`,
  and an explanation. No unresolved failures.

The template's pending values cannot pass. A failure can record actual user
feedback without invented timecodes or a fictitious full listening report.
A failure clears downstream acceptance and returns to `motion-approved`.
Both sound advancement and assembly require a current fit pass; final acceptance
requires it again on the final asset set. New files or changed plans invalidate
affected reviews. Do not copy old PASS labels to a new export.

To obtain that first joined listening evidence, use the assembler's explicit
`purpose:"review"` route with locked design and registered, rights-cleared
sources. It permits pending/failed sound inspection but only a `-review.mp4` or
`-comparison.mp4` filename, never changes approvals, and prints an unapproved
preview warning. The default/master route retains every acceptance gate.

**BLOCKED** if playback/listening is unavailable. Frame sheets, codecs, peaks,
LUFS, a prompt, or an imagined timbre cannot establish emotional fit. This
software validates evidence structure and binding, not the truth of hearing.
Original cues/cleared recordings, source rights and actual sound review remain
separate requirements. See [music evidence](music-brain-hooks.md) for the
valence/arousal/pleasure distinctions and limits; these are editorial criteria,
not universal neurological laws.
