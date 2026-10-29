# Pacing: when information and feeling arrive

**Pacing is mandatory, not a finishing effect.** It governs what viewers can
perceive, anticipate, reinterpret and feel. Film rhythm includes movement, sound
and editing [F3]. Follow-up full-text event-segmentation research [N10] and
related/unrelated-edit studies [N11,N12] distinguish action changes from camera
changes; that does not make maximum cut rate a useful objective. Source details
are in `music-brain-hooks.md`.

The following timings are starting hypotheses for this project's ten-second
brief, **not measured neurological thresholds or a platform formula**.

## Five clocks, not one

| Clock | Question |
|---|---|
| Information | When can viewers identify who, what, need and consequence? |
| Performance | When does a gaze move, hand approach, hesitation end, choice complete? |
| Shot/edit | Does each cut redirect attention, reveal something or merely interrupt? |
| Sound/music | When do pulse, silence, sound onset and harmonic tension change? |
| Emotional processing | Is there time to recognize the choice after noticing the reveal? |

A fast musical pulse can accompany a held shot. A slow cue can sit under short
cuts. A long shot can be busy; a brief shot can be simple. Do not equate BPM with
emotional intensity, cut rate with attention, or arousal with pleasure.

## Draft beat sheet: connection-led default

| Candidate interval | Information/performance goal | Common failure |
|---|---|---|
| 0.0-1.5s | Readable person/object relationship and a genuine visual question | Unrecognizable flash or decorative establishing landscape |
| 1.5-3.5s | Expectation and need become clear through action | Backstory, extra props or a second question |
| 3.5-5.5s | Consequential gesture or reveal becomes perceptible | The reveal flashes by or is telegraphed by music |
| 5.5-7.5s | Recognition/choice, not just an expression montage | Cutting before the recipient can respond |
| 7.5-10.0s | Consequence settles; optional restrained musical resolution | New twist, premature fade, or an empty unexplained hold |

The storyboard may use two five-second generated clips, but beats do not have to
occur at clip boundaries. Those durations are a convenient cost/repair structure,
not a creative law. Trim usable motion, choose different generation lengths and
requote when the beat sheet requires them.

For **The Dry Seat**, a valid hypothesis is pause/question -> coat lift ->
visible dry rectangle -> seat invitation -> cut to already-seated reaction.
For **Same Old Handshake**, the repeated gesture needs enough separation to be
recognized as a pattern before the human returns it.
For **The Last Light**, show both the recipient's benefit and the giver's shadow
in the final composition; do not spend the whole ending on a lamp close-up.

## Every cut needs a reason

Record a cut as: `time / outgoing action phase / incoming information / match
invariants / sound behavior / intended emotional effect`.

Default to a hard cut for a precise context change. A dissolve suggests a
different temporal/poetic relationship; an automated morph can destroy the
gesture. Cutting exactly on a musical beat is optional. Consider an off-beat
reveal or a sound bridge if it protects the performance. Test rather than
assuming synchronization is always stronger.

The decisive action needs an **exposure interval** where viewers can actually
see its evidence. Connection-led stories then need a **reaction interval** where
its meaning changes. A punchline ending or observational poem can omit a separate
reaction and hold when its lane-specific ending rationale explains the choice.
Do not count obscured or out-of-frame frames as useful exposure.

## Hooks that the ending can repay

- A legible unusual action: someone deliberately keeps an empty seat dry.
- A relationship question: why does a human recognize a small robot's greeting?
- A visible trade-off: a light is moved away from its owner.

The hook is a promise of relevant information, not a command to keep watching.
Do not hide the main event merely to force replay, add unrelated shock or use
rapid cuts as a supposed dopamine trigger.

## Pacing revision protocol

1. Watch once on a normal phone at intended size; mute first. Visual-first work
   excludes explanatory titles. Text-led work includes its intended text and
   checks actual reading time, contrast and unobstructed placement.
2. Before replay, ask what happened and which detail established the selected payoff.
3. Inspect the actual timeline: earliest readable setup, reveal onset/last
   readable frame, recognition onset, response completion, final hold.
4. If viewers miss the turn, simplify framing or action before adding speed,
   music or an explanatory caption.
5. If the setup feels slow, remove redundant motion, not essential causal cues.
6. If a connection-led ending feels flat, check its visible voluntary response
   before adding a larger score. For comedy/poetry, inspect punchline exposure
   or visual progression; do not invent sentiment or a redundant reaction.
7. Test a changed timing with a **fresh** viewer set; repeat exposure teaches the
   story and contaminates first-view comparison.

Compare matched variants using the same footage and sound. Initially move only
one boundary: setup length, reveal exposure or reaction hold. If multiple timing
elements change, label it a whole-edit comparison. Also test a 12-second version
when the story needs it; normalize duration in interpretation rather than
declaring longer watch time proof of a stronger hook.

Record comprehension, emotion and reasons for replay, not only retention.
Rewatching to decode a confusing film is different from enjoying it again.

## Packet additions and review gate

Every selected packet requires exact contiguous beats, a hook, hypothesis,
visible progression/payoff evidence and cut reasons. This connection-led example
uses the default `structure:connection`:

```json
{
  "pacing": {
    "structure": "connection",
    "hypothesis": "The choice reads before music resolves.",
    "hook": "Why is the empty seat covered?",
    "revealEvidence": "The dry patch and invitation are simultaneously visible.",
    "beats": [
      {"start": 0, "end": 2, "phase": "setup", "job": "read relationship / question"},
      {"start": 2, "end": 5, "phase": "reveal", "job": "notice and reveal"},
      {"start": 5, "end": 7.5, "phase": "response", "job": "recognize and choose"},
      {"start": 7.5, "end": 10, "phase": "hold", "job": "consequence / hold"}
    ],
    "cutReasons": ["At 5s omit sitting motion and show the accepted seat."],
    "minimumReadableEvidence": "Dry patch and invitation are simultaneously visible.",
    "review": "pending"
  }
}
```

These fields describe intentions; after generation log measured actual event
times. No prose timestamp is a promise of model compliance. Pacing changes alter
the asset hash and invalidate the affected motion/sound/final reviews.

Non-connection lanes can explicitly use `structure:lane-specific`,
`endingRationale` and `payoffEvidence`, with their own named beat phases. For
example, `a-room-of-seasons` can progress through seasonal light and end on the
completed visual pattern; a comic setup can expose the punchline and cut out.
Neither needs a fictional relationship choice. This is a declared, reviewable
alternative, not permission to hide a confused ending or an unreadable gag.
