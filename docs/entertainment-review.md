# Wow & Enjoyment Analyst

Correct is necessary, not sufficient: give the intended audience a rewarding
first viewing. Use this independently of the seven scenario-ranking criteria;
do not retrofit scores onto the 41 pitches or change their weights.

Before evaluating a version, set `manifest.entertainmentBrief` with `audience`,
`lane` and `acceptanceCriteria`. Criteria describe observable experience, not a
post-hoc score threshold. A changed brief invalidates its entertainment review.
Identify the exact final hash, version, picture and sound actually inspected.

## Anchors

Scores 2 and 4 are intermediate judgments. Every dimension needs a reason and
timecoded observation; these are editorial opinions, not audience measurements.

| Dimension / JSON ID | 1 | 3 | 5 |
|---|---|---|---|
| Wow, beauty or freshness / `wow-freshness` | Generic or distracting spectacle | One pleasing, specific detail | Distinctive, memorable craft/detail serving this experience |
| Enjoyment, genre reward / `enjoyment` | Unpleasant or unrewarding against the declared aim | A modest but recognizable pleasure | Sustained, specific warmth/laughter/awe/poetic pleasure |
| Anticipation / `anticipation` | No reason to attend or a misleading promise | Clear small question or deliberate sensory progression | Inviting curiosity/progression without false bait |
| Earned payoff / `earned-payoff` | Confused, absent or unearned | Promise reasonably repaid | Reward feels both fitting and fresh, with room to register |
| Pacing, absence of boredom / `pacing-boredom` | Dead/confusing intervals dominate | Mostly purposeful, one weak interval | Every interval earns its time; stillness can be purposeful |
| Voluntary replay/share appeal / `replay-appeal` | Replay needed merely to decipher | One pleasant detail worth revisiting | Specific pleasure/new detail worth voluntary replay or sharing |

No automatic average/pass cutoff. Name whether the declared criteria are met,
what is memorable, where attention weakens, and any substantive failures.
Credible boredom or indispensable-payoff confusion needs diagnosis/revision,
not inflated scoring. Retest the smallest changed portion and then the whole cut.

Lane examples (illustrations, NOT observed media or scores):

| Lane | Reward to test | Wrong repair |
|---|---|---|
| Connection | Small voluntary invitation, readable response, earned warmth | Add tragic music to explain unclear action |
| Comedy | Clear expectation, fitting comic violation, clean punchline | Add a reaction hold that kills the joke |
| Poetry | Sensory progression, beauty and satisfying final image | Force a twist or fast cuts into contemplation |

## Recording real evidence

Use `film review-json <manifest> <private-review.json>` after actual inspection.
Set `area:"entertainment-wow-enjoyment"`, `result:"pass"` or `"fail"`,
and `evidence` describing what was inspected. A PASS also needs `report`:

```json
{
  "picture": "full-playback",
  "audio": "no-audio-streams",
  "dimensions": [
    {"id": "wow-freshness", "score": 3,
      "evidence": [{"from": 0, "to": 1, "observation": "<actual observation>"}]}
  ],
  "criteriaAssessment": "<why the predeclared criteria were met>",
  "unresolvedFailures": []
}
```

This abbreviated example is deliberately incomplete: provide all six IDs from
the anchor table. Audio is `listened` for actual sound or `no-audio-streams`
only for a verified silent export. Full playback means the whole actual cut,
not prompts, endpoints, a contact sheet or a numbered-frame audit. Missing
perception returns BLOCKED in the report; do not record a CLI pass.
Use FAIL with observed evidence when there is a real defect; a missing review
already blocks final approval. Technical decode cannot establish enjoyment.

"Dopamine" may describe an anticipation/reward hypothesis only; neither a score,
chills, retention nor replay establishes neural release. Record actual fresh
viewer answers separately through [review measurement](review-measurement.md).
An agent's editorial PASS is not audience validation or personal user approval.
