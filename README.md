# Emotional Microfilms

An evidence-led, multi-genre studio for original 8-15 second films, initially **10
seconds / 9:16**. It combines reusable agent skills, a 41-story development bank,
scored shortlisting, user decisions, complete prompt packets, model-cost evidence,
and hash-bound production reviews.

**Current state:** a 13-second father-son sound review preview exists.
The user rejected the first silent edit because Dad abruptly became seated.
The revision retains the Korean toddler/30s father, actual cast and four guided
endpoints, adds a continuous turn-and-sit clip, shortens the opening pause and
carries original locally synthesized keyboard music/rain across both joins.
All 121 new bridge frames and native contact details were inspected; boundary
poses were compared. The 390-frame H.264/AAC preview passed full video/audio
decode, black/freeze/dropout checks and audio-level measurement.
Delivery is 1080x1920/30fps, upscaled/rate-converted from 720p/24fps sources.
This is a **review preview**, not a sound/entertainment-approved master. Technical
checks do not establish that the music or emotional flow is enjoyable. Actual
user feedback now says the picture is good but its music is heavy/mismatched.
The soundtrack is therefore rejected, not a pending technical pass. This
feedback updates the reusable production workflow; no new media is commissioned
here. Wow/Enjoyment, phone review and personal final acceptance remain pending.
No publication or audience result is claimed.
Actual media, job IDs, delegated decisions and credit reconciliation stay private.
Synthetic tool-test fixtures are not creative reference analyses or films.
The existing InterviewReel repository is untouched.
Three independent AI critic lenses passed the earlier scoped preproduction baseline.
The iterative character/scene/design flow is a subsequent correction, not proof
that a film has passed review. The current checks include real FFmpeg smoke and
character provenance/user approval, scene references, hook/effect/light plans and
design-lock gates. The user-set **1,000-credit per-generation ceiling** is enforced
on the discounted whole-request estimate, independently of total approved budget.
The prior producer checkpoint reported 51 passing tests. Current implementation
validation is recorded in [the completion plan](docs/completion-plan.md).
See the critic record for actual scope and remaining media/perception gates.

## Start

Node 20+; no packages to install.
For Claude, ChatGPT, Copilot and other hosts, use
[the shared execution/handoff contract](docs/agent-integration.md), not a second
pipeline. Real unavailable host transports/perception stay explicitly blocked.

```powershell
Set-Location .\emotional-microfilms
npm run validate
npm run film -- rank 6
npm run film -- shortlist 6
npm run film -- budgets
npm run film -- effects
npm run film -- roadmap
npm run film -- workflow previsualize
npm run check
npm test
```

The canonical agent skill is
[`.github\skills\emotional-microfilm\SKILL.md`](.github/skills/emotional-microfilm/SKILL.md).
All skills and reviewer definitions are project-local. Copilot/Agency exposes
`/skills`; other hosts read the common entrypoint and linked canonical files.
Discovery is not proof a skill is loaded into the present conversation.

## Read in this order

1. [Research and evidence boundaries](docs/research.md).
2. [Film language and director's glossary](docs/film-language.md).
3. [Music, attention and neuroscience](docs/music-brain-hooks.md).
4. [End-to-end production workflow](docs/workflow.md).
5. [Prompt engineering](docs/prompt-playbook.md) and
   [OpenArt/audio decisions](docs/model-audio-decision.md).
6. [Review and audience experiments](docs/review-measurement.md).
7. [Lighting/shadows](docs/lighting-shadows.md),
   [creative range](docs/creative-range.md), and
   [nostalgic/modern songs and singing](docs/song-adaptation.md).
8. [Reference-Reel reverse engineering](docs/reverse-engineering.md),
   [request coverage](docs/request-coverage.md) and [critic review](docs/critic-review.md).
   [Earlier opportunity context](docs/opportunity-context.md) retains makeovers,
   buyer-first real estate and product creatives as separate directions.
9. [Generation limits and failure-prevention preflight](docs/generation-preflight.md).
10. [Iterative characters, scene images, hooks and nature/effects](docs/visual-development.md).

## Iterative production, not dummy frames

Before creation, complete a gap-free delivery `framePlan`: story, beautiful
original age-appropriate characters, acting/emotion, camera, lighting/shadows,
motion phases/physics/animation, effects, audio, transitions and acceptance.
New preproduction and every paid preflight enforce this; bundle scripts resolve
the shared requirements. Legacy media and approval history stay untouched.

**Real character image -> personal or scoped delegated acceptance ->
reference-guided scene images for all changes -> acceptance ->
lock script/hook/timing/transitions/lighting/shadows/
effects/sound route -> motion.** Sketches are planning aids, never production
references. Unchanged cast can be reused; replacements invalidate its approvals.
Nature/beauty options include golden butterflies, flowers, sakura, rain, wind/
trees, autumn and illuminated/highlight accents, with explicit depth, motion,
occlusion, light/spill/shadow and fallback design. No mandatory particle overlay
or promise of dopamine/retention. The assembler does not implement a compositor.
The inspectable palette also includes glitter/sparkle dust, neon glow/trails,
golden butterfly dust and sakura flower dust. See
[visual development](docs/visual-development.md) for controls and untested routes.

## Project-local operating system

| Component | Purpose |
|---|---|
| Nine [skills](.github/skills/emotional-microfilm/SKILL.md) | Studio, cinematography, lighting, music/pacing, sound direction, production direction, song adaptation, reviews, reference analysis |
| Eight [reviewer roles](.github/agents/microfilm-audio-scene-fit-reviewer.agent.md) | Story, pacing, visuals, sound, audio-scene fit, evidence, delivery, Wow & Enjoyment; read-only |
| [Roadmap](data/roadmap.json) | Dependency-based milestones with actual exit evidence |
| [Eight workflows](data/workflows.json) | Coordinated production, develop, previsualize, produce, sound/finish, learn, reverse engineer, critic loop |
| [Evidence-to-practice map](docs/evidence-to-practice.md) | Each finding becomes a rule, artifact, reviewer check and failure condition |

Reviewer definitions do not run automatically or establish that a film was
reviewed. All project instructions stay in this repository; no global/personal
discovery skill remains.

## Organized productions and coordinated scripts

Use `outputs\<topic>\vNNN\` with `scripts`, `frames`, `metadata`, `tmpVids`,
`audio`, `finalVid` and `reviews`. Ten department scripts derive from one packet
and timeline: story, character/emotion, scene, frames, motion, lighting,
camera/edit, audio/music, atmosphere/effects and delivery.
[Bundle command and migration rules](docs/production-bundles.md).

Before motion, specify character intent, emotional arc and the sound palette.
Before sound approval/assembly, require a listened, timecoded
[audio-scene-fit review](docs/audio-scene-fit.md). Quiet/original music can still
be too heavy or imply the wrong feeling; codec/peak checks cannot pass this gate.

## Development, then explicit choice

`data\scenarios.json` contains 41 original pitches across emotion, comedy,
meme-stories, nostalgia, visual poetry and mystery. The rubric has seven anchored dimensions
and separate feasibility gates. Editorial scores are **not viral probabilities**.
User ratings and decisions never silently change the editorial scores.

After the user supplies feedback and approves recording it:

```powershell
npm run film -- feedback the-dry-seat 5 shortlist "Like the quiet kindness; less sentimental."
npm run film -- feedback the-dry-seat 5 select "Choose this for preproduction only."
npm run film -- packet the-dry-seat
```

`packet` creates an ignored `workspace\<scenario-id>\manifest.json`, refuses to
overwrite an existing workspace, and leaves generation approval false and budget
zero. The four example packets are unapproved creative drafts, not selections.
`a-seat-for-dad` is the father-son technical-pilot template: all four literal
keyframes precede video and are bound to their actual provider references.
Use `unrated` for a selection given without a numerical rating.

## What runs and what remains human/tool-driven

| Executable locally | Deliberately not automated |
|---|---|
| Validate/rank 41 stories, diversify a slate and show feedback | Decide whether the selected genre/payoff lands |
| Plan phrase/tempo; prepare cleared audio with trim, bounded atempo, fades and sample-peak checks | Sing, license or perceptually judge an actual recording |
| Compare dated credit budgets | Refresh OpenArt forms/quotes and consent to spend |
| Create a resumable selected-story workspace | Upload references; submit and resume provider jobs |
| Hash assets, record evidence, gate stages | Review identities, physical contact and soundtrack rights |
| Assemble approved local clips with FFmpeg | Approve a final export and publish to Instagram |
| Prepare full-span reference frames/audio and validate timecoded analysis | Actually watch/listen, distinguish observations from inference, provide real feedback |
| Build an original adaptation handoff from validated analysis/feedback | Authorize reference reuse, select a new story and approve generation |
| Exclusive workspace writes, typed user/delegated reviews and private handoff | Authenticate another host or claim it watched/listened |

The required [entertainment gate](docs/entertainment-review.md) assesses wow/
freshness, enjoyment, anticipation, earned reward, boredom and voluntary replay
from actual playback. Scores are creative hypotheses, never dopamine measures.
Claim a workspace and set `FILM_OWNER` before existing-manifest CLI writes.
Personal `*-user` acceptance requires actual user viewing; explicitly delegated
decisions use `*-delegated`. Final personal acceptance/publication stay separate.

An assembly script is available as `node scripts\assemble.mjs <edit.json>
--ffmpeg <ffmpeg.exe>`. It needs an existing encoder and actual local media.
See the workflow for its tested scope. Nothing installs tools or fetches binaries.

## Reverse-engineer a reference Reel

Use the project-local
[`microfilm-reverse-engineering` skill](.github/skills/microfilm-reverse-engineering/SKILL.md)
and [its tool guide](docs/reverse-engineering.md). It covers source-bound timecoded
screenplay/action, script/text, camera/blocking, lighting/shadows, pacing, sound and
feedback-driven original alternatives. Private source media stays in ignored
workspace. Frame sampling is not a full-motion/listening pass, and inaccessible
Instagram links require an authorized local export. No paid generation runs.

```powershell
npm run reverse -- prepare --input 'C:\exports\reference.mp4' --workspace reference-001 --ffmpeg 'C:\path\to\ffmpeg.exe'
npm run reverse -- expand --workspace reference-001 --start 2 --end 4 --interval 0.25 --ffmpeg 'C:\path\to\ffmpeg.exe'
npm run reverse -- validate-review --workspace reference-001
npm run reverse -- remake-brief --workspace reference-001 --feedback 'workspace\reference-001\feedback.json'
```

Preparation intentionally starts pending. The skill guides analysis and proposes
original scripts; the CLI extracts evidence, checks recorded inspection, and
compiles the chosen original direction, not autonomous video comprehension.

**Pricing snapshot, not a spend proposal:** two 5-second silent PixVerse shots
cost 126 credits per pair at the inspected 720p configuration and current eligible
discount. Four guided stills plus two attempts per shot total 324 credits;
the first identity image adds 18 per 1K attempt. Two 10-second Seedance Mini
native-audio attempts plus four guided stills total 792, before that initial image.
Music licences, further repairs and labour are excluded. Refresh quotes.

Research supports careful context, meaningful action and audio testing. It does
not identify a universal hook duration, dopamine-maximizing edit, or guaranteed
Reels formula. See the dedicated neuroscience evidence map for the distinction
between measured neurochemistry and creative hypotheses.
