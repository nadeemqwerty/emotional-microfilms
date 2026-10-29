---
name: microfilm-song-adaptation
description: Project-only nostalgic and modern song selection, short-phrase adaptation, faster-feeling arrangements, pitch-preserving tempo work, singing/vocal briefs, rights and picture synchronization for short films and Reels.
---

# Nostalgic and Modern Song Direction

Read `AGENTS.md`, `docs\song-adaptation.md`, `docs\music-brain-hooks.md`,
`docs\pacing.md` and the selected film. This skill covers choosing/syncing music
and planning actual vocals; it does not pretend the current OpenArt MCP can sing
or generate standalone music.

## Required decisions

1. Establish story lane, intended payoff, audience/language, familiarity context
   and whether vocals help. Older music is not inherently slow; modern is not
   inherently fast or appropriate.
2. Compare a nostalgic candidate, a modern candidate and an original/cleared
   alternative. Explain story fit, phrase fit, recognition, vocal clarity, pacing
   and rights/replaceability. A famous title is not a licence.
3. Pick a complete short musical/lyrical thought, not a random truncated word.
   Do not copy song lyrics/recordings into the public repo; keep only metadata
   and cleared local assets.
4. Choose the least invasive timing strategy: better excerpt, phrase edit,
   unchanged melody plus quicker arrangement, pitch-preserving tempo change, or
   an authorized newly performed arrangement. Do not blindly speed up everything.
5. For actual singing choose original/hired/explicitly authorized synthetic voice,
   singable range, diction, phrase/breath plan, timing and delivery. Do not clone
   or impersonate a real singer without permission. A cover does not clear
   composition, lyrics, arrangement or platform use automatically.
6. Map phrase onset, recognition cue, reveal/response and final decay to actual
   picture events. Do not cut on every beat or make the music spoil the joke.
7. Inspect pitch/formants, consonants, breath, transients, warble, stereo/phase,
   artifacts and phone audibility. Pitch-preserving processing is not artifact-free.
8. Test the same picture with old/updated/modern cues and a foley-led control.
   Use fresh viewers; ask recognition and felt nostalgia separately.

Output `data\song-cue-template.json` filled in the ignored selected workspace,
candidate rationale, exact phrase/timing and vocal brief, rights state,
replaceable alternative and sound-review checks. `film song-plan <cue.json>`
checks timing math without modifying audio or authorizing generation.

Actual audio editing, singing services, uploads, spending and publication remain
separately approved operations. Old age, short duration, "sped up", "cover",
"AI-generated" and "trending" are not rights exemptions or dopamine evidence.
