# Nostalgic songs, faster pacing, modern music and singing

Project-only, 30 October 2026. This is a reusable production skill/workflow, not a
list of copyrighted audio to download or an automatic music generator.

## Research and professional references

| Source actually read | Supports | Does not establish |
|---|---|---|
| [Janata 2009, music-evoked autobiographical memories](https://pmc.ncbi.nlm.nih.gov/articles/PMC2758676/) | fMRI study, 13 preselected UC Davis undergraduates aged 18-22; 30s excerpts from their extended childhood; autobiographical salience related to MPFC response | Not dopamine measurement; selected responders, narrow cohort and long excerpts do not establish which ten-second song cue works for our audience |
| [Ableton Live 12: Audio Clips, Tempo and Warping](https://www.ableton.com/en/live-manual/12/audio-clips-tempo-and-warping/) | Tempo mapping, transients, local warp markers, timing without pitch changes; Re-Pitch changes both; modes suit different material, Complex/Pro for full mixes | A production manual, not proof tempo manipulation preserves emotion or raises engagement |
| [Meta Music Guidelines](https://www.facebook.com/legal/music_guidelines?locale=en_US) | Responsibility for applicable commercial/non-personal-use music permissions | No automatic clearance because a track is old, covered or short |
| [Music/reward evidence map](music-brain-hooks.md) | Listener/context dependence; separate pleasure, tension, familiarity, arousal and reward endpoints | No universal nostalgic song, ideal BPM or dopamine-maximizing arrangement |

Audacity's candidate manual URL returned 403 and a candidate support route was
missing; no technical claims rely on those unsuccessful reads.

## Choose for the film, not for age or popularity alone

Nostalgia depends on the listener's experiences. A familiar song may be loved,
irrelevant or associated with something unintended. Older songs are not all slow,
and modern tracks can be sparse or slow. Ask audience/language/familiarity context
before choosing concrete tracks.

Evaluate **nostalgic / modern / original-cleared** candidates using:
story fit, a complete usable phrase, recognition cue, pace, vocal intelligibility,
emotional interpretation, licensing, replacement options and cost. Current charts
or in-app popularity should be checked when making the actual choice, dated and
treated as popularity signals, not proof of fit or distribution benefit.

For a dialogue-free film, a lyric can dominate attention or explain a plot that
the image fails to show. Test an instrumental/foley version too.

### Contemporary cue palettes to audition, not prescriptions

| Lane | Candidate musical direction | Useful comparison |
|---|---|---|
| Warmth/connection | Sparse acoustic, intimate keys or light modern rhythm | Foley-led without sentimental score |
| Nostalgia | Recognizable cleared phrase, restrained updated instrumentation | Faithful phrasing versus lighter subdivisions |
| Comedy/meme | Dry staccato, deliberately serious cue or a timed music gap | No-score punchline; avoid automatic cartoon effects |
| Mystery | Sparse electronic/plucked motif with space | Sound-led answer without a trailer crescendo |
| Visual poetry | Ambient, chamber texture or rhythmic soundscape | Tempo-free phrasing versus a pulse |

These are creative hypotheses. Current popular tracks require fresh, dated
discovery and rights checks when a film/audience is selected, not a frozen list
of supposedly trending songs.

## Five ways to fit a slow-feeling song to a short film

| Strategy | What changes | Main review risk |
|---|---|---|
| Better excerpt | Start near a useful complete phrase rather than using a long introduction | Misleading phrase boundary or omitted context |
| Phrase-level edit | Remove redundant instrumental space with a musical splice/decay | Clicks, broken harmony or rushed breath |
| Faster-feeling arrangement | Keep melody/vocal pace but add lighter subdivisions, bass/rhythm movement or a shorter intro | Groove overwhelms the story or implies a different genre |
| Pitch-preserving time change | Adjust selected phrase duration while attempting to preserve pitch | Warble, consonant smearing, formant/timbre artifacts |
| New authorized performance | Sing/arrange at an appropriate pace and range from the beginning | Required composition/lyric/arrangement/performance permissions remain |

Do not assume "speed up + reverb" preserves nostalgia. Do not add a dance beat to
every memory scene. A restrained faster texture, a shorter phrase or an unchanged
song against a brisker picture can be better hypotheses.

For a steady-tempo cue:

`speed factor = target BPM / source BPM`

`duration after change = selected source seconds / speed factor`

Example: a 12s original test phrase at 80 BPM becomes 10s at 96 BPM if stretched
by 1.2 while preserving pitch. This is timing arithmetic, not an optimal tempo.
Rubato/live recordings may need local markers; a single BPM ratio may distort
their phrasing. Do not quantize every breath by default.

`film song-plan` calculates this relation, fit and approval blockers. It does not
modify, sing, upload or clear a recording. The main assembler expects an already
prepared accepted mix; it does not perform warping or compose stems.

## Executable local preparation

`node scripts\audio.mjs workspace\<film>\audio-prep.json --ffmpeg "C:\path\to\ffmpeg.exe"`
prepares existing cleared audio; it does not sing, compose, separate stems or
license anything. It uses FFmpeg trim, pitch-preserving `atempo` restricted to
0.8-1.25, fades and a -1dB sample-peak limiter (not true-peak/loudness mastering).
It validates full decode, expected duration and sample peak, emits PCM 48kHz
stereo WAV plus a hash-bound receipt, and refuses overwrite. No downloads or
package installs. Actual phrase boundaries, timbre/diction and sync still need
listening; "pitch-preserving" does not promise artifact-free vocals.

Fill a PRIVATE cue with actual source/hash/rights:

```json
{
  "schemaVersion": 1,
  "source": "media/selected-film/cleared-original.wav",
  "sourceSha256": "<actual SHA-256>",
  "in": 1, "out": 13, "tempo": 1.2,
  "fadeIn": 0.02, "fadeOut": 0.1, "gain": 0.8,
  "phraseBoundariesVerified": true,
  "rights": {"status": "cleared", "evidence": "<actual evidence>",
    "scope": "<recording, composition, voice, platform/territory/commercial scope>"},
  "output": "outputs/selected-film/prepared.wav"
}
```

This placeholder is not executable or a licence. Select a whole phrase before
setting `phraseBoundariesVerified:true`; failed duration/tempo fits need another
excerpt or authorized performance, not truncated words. Register accepted output
as `audio`, set separate sound route, cue/mix with picture, listen and record
sound review through the existing assembly workflow. The receipt deliberately
remains perceptually PENDING.

Software proof uses an original synthetic tone: real CLI trim/tempo/fades,
duration/peak checks, pitch-frequency check, missing encoder and no-overwrite.
It is not a sung example. Operational full music/vocal proof still requires
cleared nostalgic/modern/original comparisons, authorized real voice/service,
actual listening and the same locked picture. This implementation buys no
service and invents no provider endpoint.

## Actual singing / vocal-production brief

Record:

- Instrumental or vocal; language, original/hired/authorized synthetic voice.
- Singable pitch range/key, diction, natural delivery, phrase and breath plan.
- Source phrase boundaries and exact target duration; pickup and final decay.
- Intended emotion without instructions to impersonate a named real singer.
- Lyrics provenance and permissions; do not reproduce protected lyrics here.
- Vocal/instrumental/stem availability; never assume native AI gives clean stems.
- Recording, composition/lyrics, arrangement, likeness/voice and platform rights.

An authorized human/singing service can create a new performance only after its
specific inputs, terms and costs are approved. No standalone music/singing route
was exposed in the inspected OpenArt MCP. An invented endpoint is not a solution.

## Picture synchronization and pacing

Choose **one meaningful alignment** first: an offered hand, comic reveal or
returned gesture. Preserve enough phrase/visual context before it and decay after.
Resolution may follow recognition rather than hit the cut. For comedy, a music
gap or unchanging serious cue can be a better test than an emotional swell.

Make three candidates on the same locked picture where practical:
faithful nostalgic phrasing, a restrained updated arrangement, and a modern or
original alternative. Keep a foley-led control. Loudness, changing visuals and
different audience familiarity are potential confounds.

Ask: what song/era was recognized, what was felt, whether the cue felt rushed or
inauthentic, whether the action remained clear, and why someone wanted to replay.
Faster is not automatically more contemporary, more emotional or more rewarding.

## Rights and persistence

"Old" does not mean public domain. Composition/lyrics, a particular recording and
a new performance/arrangement are distinct. Public-domain status varies by work,
country and facts; do not infer it from a release year. A platform library licence
may not cover a downloaded/re-edited version, paid ads or another platform.
Check actual terms for the intended use before adaptation, singing or publishing.

Store cue/rights evidence and actual audio hashes in ignored workspace; publish
only cleared metadata and original summaries. Sound reviewer checks the phrase,
timing, actual listening and permissions; evidence reviewer checks nostalgia and
neurochemical claims. User final/publication approvals remain separate.
