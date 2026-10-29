# Emotional Microfilms

An evidence-led, multi-genre studio for original 8-15 second films, initially **10
seconds / 9:16**. It combines reusable agent skills, a 40-story development bank,
scored shortlisting, user decisions, complete prompt packets, model-cost evidence,
and hash-bound production reviews.

**Current state:** research and preproduction tooling, not a finished film.
No scenario selected, creative assets generated, credits spent, uploads or posts made.
The existing InterviewReel repository is untouched.

## Start

Node 20+; no packages to install.

```powershell
Set-Location .\emotional-microfilms
npm run validate
npm run film -- rank 6
npm run film -- shortlist 6
npm run film -- budgets
npm run film -- roadmap
npm run film -- workflow previsualize
npm run check
npm test
```

The canonical agent skill is
[`.github\skills\emotional-microfilm\SKILL.md`](.github/skills/emotional-microfilm/SKILL.md).
All skills and reviewer definitions are project-local. Reload project skills in a fresh session or with
`/skills reload`; verify with `/skills info emotional-microfilm`.
Skill discovery is not proof it is loaded into the present conversation.

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

## Project-local operating system

| Component | Purpose |
|---|---|
| Six [skills](.github/skills/emotional-microfilm/SKILL.md) | Studio, cinematography, lighting, music/pacing, song adaptation, reviews |
| Six [reviewer roles](.github/agents/microfilm-story-reviewer.agent.md) | Story, pacing, visuals, sound, evidence, delivery; read-only |
| [Roadmap](data/roadmap.json) | Dependency-based milestones with actual exit evidence |
| [Five workflows](data/workflows.json) | Develop, previsualize, produce, sound/finish, learn |
| [Evidence-to-practice map](docs/evidence-to-practice.md) | Each finding becomes a rule, artifact, reviewer check and failure condition |

Reviewer definitions do not run automatically or establish that a film was
reviewed. All project instructions stay in this repository; no global/personal
discovery skill remains.

## Development, then explicit choice

`data\scenarios.json` contains 40 original pitches across emotion, comedy,
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
zero. The three example packets are unapproved creative drafts, not selections.

## What runs and what remains human/tool-driven

| Executable locally | Deliberately not automated |
|---|---|
| Validate/rank 40 stories, diversify a slate and show feedback | Decide whether the selected genre/payoff lands |
| Plan song phrase/tempo duration and clearance blockers | Sing, license or perceptually judge an actual recording |
| Compare dated credit budgets | Refresh OpenArt forms/quotes and consent to spend |
| Create a resumable selected-story workspace | Upload references; submit and resume provider jobs |
| Hash assets, record evidence, gate stages | Review identities, physical contact and soundtrack rights |
| Assemble approved local clips with FFmpeg | Approve a final export and publish to Instagram |

An assembly script is available as `node scripts\assemble.mjs <edit.json>
--ffmpeg <ffmpeg.exe>`. It needs an existing encoder and actual local media.
See the workflow for its tested scope. Nothing installs tools or fetches binaries.

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
