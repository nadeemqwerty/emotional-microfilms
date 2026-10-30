import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  assetSetFingerprint, discountedCredits, diverseShortlist, editorialScore, ensureNoDuplicateJob,
  estimatePlan, fingerprint, inside, packetDraft, productionRevision, rankScenarios, readJson,
  recordReview, refreshWorkspace, migrateDelegatedAcceptances,
  AUDIO_FIT_DIMENSIONS, ENTERTAINMENT_DIMENSIONS, REVIEW_AREAS, requireAcceptance, requireReview, stageReady, validateDirection, validateFeedback, validateJob, validatePacket,
  validateLightingPlan, validatePacing, validateRubric, validateScenario, validateSpend, validateTimeline,
  validateWorkspace, validateMotionReferences, validateSceneReferences, requireCharacterApproval,
  deliveryFrame, resolveFramePlan, validateFramePlan,
} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => readJson(resolve(root, path));
const rubric = load('data/rubric.json');
const brief = load('data/brief.json');
const {scenarios} = load('data/scenarios.json');
const modelData = load('data/model-quotes.json');
const scenario = scenarios.find(item => item.id === 'the-dry-seat');
const packet = load('examples/the-dry-seat.json');
const selected = {schemaVersion: 1, reviews: [{
  scenarioId: scenario.id, rating: 5, decision: 'select', note: 'Synthetic unit-test feedback.',
  at: '2026-10-30T00:00:00+05:30',
}]};
const context = {scenarios, brief, feedback: selected};
function workspace(patch = {}) {
  const manifest = {...packetDraft(scenario, brief, selected), stage: 'preproduction',
    productionDraft: structuredClone(packet), approvalRevision: 1,
    entertainmentBrief: {audience: 'Synthetic test audience', lane: 'connection',
      acceptanceCriteria: 'Synthetic test: readable, rewarding invitation, no unresolved boredom finding.'},
    storyboardApproved: true, storyboardApprovalEvidence: 'Synthetic unit-test approval.', ...patch};
  manifest.productionFingerprint = productionRevision(manifest);
  return manifest;
}
const entertainmentReport = () => ({picture: 'full-playback', audio: 'no-audio-streams',
  dimensions: ENTERTAINMENT_DIMENSIONS.map(id => ({id, score: 3,
    evidence: [{from: 0, to: 1, observation: 'Synthetic evidence, not a media review.'}]})),
  criteriaAssessment: 'Synthetic criteria met for fixture only.', unresolvedFailures: []});
const audioFitReport = (seconds = 10) => ({picture: 'full-playback', audio: 'no-audio-streams',
  listeningConditions: 'Synthetic test attestation only; no actual listening claimed.',
  comparison: {samePicture: true, listened: true, baseline: 'silent', observation: 'Synthetic baseline.'},
  dimensions: AUDIO_FIT_DIMENSIONS.map(id => ({id, verdict: 'pass',
    evidence: [{from: 0, to: seconds, observation: 'Synthetic fit evidence only.'}]})),
  segments: [{from: 0, to: seconds, intendedFeeling: 'Synthetic quiet connection',
    heardFeeling: 'Synthetic quiet connection', weight: 'appropriate', relationship: 'supports',
    observation: 'Synthetic complete-timeline fixture.'}], unresolvedFailures: []});
const reviewFor = (manifest, area, result = 'pass') => recordReview(manifest, {
  area, result, evidence: 'Synthetic review',
  ...(area.endsWith('-user') ? {authority: {type: 'personal-user', personallyViewedByUser: true}} : {}),
  ...(area === 'entertainment-wow-enjoyment' ? {report: entertainmentReport()} : {}),
  ...(area === 'audio-scene-fit' ? {report: audioFitReport(manifest.seconds)} : {}),
}).reviews.at(-1);

test('coordinated direction covers all shots and blocks legacy packets at new design lock', () => {
  validateDirection(packet);
  for (const change of [
    draft => { delete draft.direction; },
    draft => { draft.direction.beats[0].to -= 1; },
    draft => { draft.direction.beats[0].shotId = 'unknown'; },
    draft => { draft.direction.soundPalette.density = ''; },
    draft => { draft.direction.beats[0].audioRole = ''; },
  ]) {
    const changed = structuredClone(packet);
    change(changed);
    assert.throws(() => validateDirection(changed), /direction|Direction|palette|soundPalette/);
  }
  const legacy = workspace({stage: 'keyframes-approved'});
  delete legacy.productionDraft.direction;
  delete legacy.productionDraft.framePlan;
  legacy.productionFingerprint = productionRevision(legacy);
  assert.equal(validateWorkspace(legacy, context), true, 'Historical workspaces remain readable.');
  assert.throws(() => stageReady(legacy, 'design-locked', context), /Coordinated direction/);
});

test('complete frame requirements resolve every interval, overlapping sound, fractional boundaries and quiet holds', () => {
  for (const file of ['the-dry-seat', 'a-seat-for-dad', 'same-old-handshake', 'the-last-light']) {
    const draft = load(`examples/${file}.json`);
    validateFramePlan(draft);
    const resolved = resolveFramePlan(draft);
    assert.equal(resolved.intervals[0].fromFrame, 0);
    assert.equal(resolved.intervals.at(-1).toFrame, deliveryFrame(draft.seconds, resolved.fps));
    assert.ok(resolved.intervals.every(interval => interval.lighting.shadowMap.length > 0 &&
      interval.audio.role && interval.motion.intermediateState));
  }
  const draft = structuredClone(packet);
  draft.soundPlan.cues = [
    {from: 0.15, to: 0.45, sound: 'Synthetic early cue.'},
    {from: 0.2, to: 0.5, sound: 'Synthetic overlapping cue.'},
  ];
  const first = resolveFramePlan(draft).intervals[0];
  assert.deepEqual(first.audio.cues.map(({fromFrame, toFrame}) => [fromFrame, toFrame]),
    [[5, 14], [6, 15]]);
  assert.equal(first.audio.cues.length, 2, 'Never drop one overlapping sound.');
  assert.match(resolveFramePlan(load('examples/the-last-light.json')).intervals[1].motion.action, /hold/i);
});

test('frame requirements reject omissions, gaps, stale references and invalid character/VFX controls', () => {
  for (const mutate of [
    draft => { delete draft.framePlan; },
    draft => { draft.framePlan.intervals[0].fromFrame = 1; },
    draft => { draft.framePlan.intervals[1].fromFrame -= 1; },
    draft => { draft.framePlan.intervals.at(-1).toFrame -= 1; },
    draft => { draft.framePlan.intervals[0].toFrame = 1.5; },
    draft => { draft.framePlan.intervals[0].characters.pop(); },
    draft => { draft.framePlan.intervals[0].characters[0].identityId = 'unknown'; },
    draft => { draft.framePlan.intervals[0].camera.focus = ''; },
    draft => { draft.framePlan.intervals[0].lightingChange = ''; },
    draft => { draft.framePlan.intervals[0].motion.intermediateState = ''; },
    draft => { draft.framePlan.intervals[0].transitionOut.type = 'continuous'; },
    draft => { draft.framePlan.characterDesigns[0].agePresentation = ''; },
    draft => { draft.framePlan.characterDesigns[0].acceptance = []; },
    draft => { draft.atmospherePlan.effects[0].appearance = ''; },
    draft => { draft.atmospherePlan.effects[0].route = 'invented-renderer'; },
    draft => { draft.atmospherePlan.effects[0].shotIds = ['unknown']; },
    draft => { draft.soundPlan.cues[0].sound = ''; },
    draft => { draft.framePlan.intervals[0].effectIds = []; },
    draft => { draft.direction.beats[1].id = draft.direction.beats[0].id; },
    draft => { draft.soundPlan.cues = [{from: 0.001, to: 0.002, sound: 'Collapsed cue'}]; },
  ]) {
    const draft = structuredClone(packet);
    mutate(draft);
    assert.throws(() => validateFramePlan(draft), /[Ff]rame|[Cc]anonical|final|[Ee]ffect|character/);
  }
});

test('known beat/effect IDs cannot attach to the wrong time', () => {
  const draft = structuredClone(packet);
  const beat = draft.direction.beats[0];
  draft.direction.beats.splice(0, 1, {...beat, id: 'early', to: 2.5},
    {...beat, id: 'late', from: 2.5});
  draft.framePlan.intervals[0].beatId = 'late';
  assert.throws(() => validateFramePlan(draft), /outside its actual timing/);
  const effectDraft = structuredClone(packet);
  const gold = {...effectDraft.atmospherePlan.effects[0], id: 'gold-dust', from: 5, to: 10, shotIds: ['b'],
    referenceFrameIds: ['b-start', 'b-end'],
    appearance: 'Fine golden butterfly dust.', lightMode: 'Emissive motes; negligible distant spill.'};
  effectDraft.atmospherePlan.effects.push(gold);
  effectDraft.framePlan.intervals[1].effectIds.push(gold.id);
  assert.equal(resolveFramePlan(effectDraft).intervals[1].effectCues[1].appearance, gold.appearance);
  effectDraft.framePlan.intervals[0].effectIds.push(gold.id);
  assert.throws(() => validateFramePlan(effectDraft), /inactive or omitted/);
});

test('legacy packets stay readable but cannot enter new preproduction or paid creation without frame requirements', () => {
  const legacy = workspace({stage: 'selected', generationApproved: true, nextGenerationKind: 'character'});
  delete legacy.productionDraft.framePlan;
  legacy.productionFingerprint = productionRevision(legacy);
  assert.equal(validateWorkspace(legacy, context), true);
  assert.throws(() => stageReady(legacy, 'preproduction', context), /framePlan required/);
  for (const [kind, stage] of [['character', 'preproduction'], ['scene', 'characters-approved'],
    ['motion', 'design-locked']]) {
    assert.throws(() => validateSpend({...legacy, stage, nextGenerationKind: kind},
      18, null, Date.now(), context), /framePlan required/);
  }
  assert.throws(() => validateSceneReferences({...legacy, stage: 'characters-approved'},
    packet.keyframes[0].id, {}), /framePlan required/);
  assert.throws(() => validateMotionReferences({...legacy, stage: 'design-locked'},
    packet.shots[0].id, {}), /framePlan required/);
  const planned = workspace({stage: 'selected', generationApproved: false});
  assert.equal(stageReady(planned, 'preproduction', context), true);
  assert.equal(planned.generationApproved, false, 'A complete plan never grants spending.');
});

test('beautiful-character redesign invalidates earlier cast acceptance', () => {
  const manifest = withCast(workspace());
  requireCharacterApproval(manifest);
  manifest.productionDraft.framePlan.characterDesigns[0].appeal = 'Changed original facial appeal.';
  assert.throws(() => requireCharacterApproval(manifest), /stale/);
});

test('audio fit rejects meter-only passes, heavy/mismatched segments and stale sound routes', () => {
  let manifest = workspace({stage: 'motion-approved', soundDecision: 'silent'});
  const pass = report => recordReview(manifest, {area: 'audio-scene-fit', result: 'pass',
    evidence: 'Synthetic test evidence, not actual listening.', report});
  for (const change of [
    report => { report.audio = 'metered'; },
    report => { report.picture = 'sampled-frames'; },
    report => { report.comparison.listened = false; },
    report => { report.dimensions.pop(); },
    report => { report.dimensions[1].verdict = 'fail'; },
    report => { report.segments[0].weight = 'too-heavy'; },
    report => { report.segments[0].relationship = 'mismatch'; },
    report => { report.segments[0].to = 9; },
    report => { report.unresolvedFailures.push('Cue overpowers scene.'); },
  ]) {
    const report = audioFitReport();
    change(report);
    assert.throws(() => pass(report), /Audio-scene-fit|Compare|Resolve/);
  }
  manifest = recordReview(manifest, {area: 'sound', result: 'pass', evidence: 'Synthetic sound.'});
  assert.throws(() => stageReady(manifest, 'sound-approved', context), /audio-scene-fit/);
  manifest = pass(audioFitReport());
  assert.equal(stageReady(manifest, 'sound-approved', context), true);
  assert.throws(() => requireReview({...manifest, soundDecision: 'native'}, 'audio-scene-fit'), /stale/);
  const failed = recordReview({...manifest, stage: 'final-approved', finalUserApproval: true},
    {area: 'audio-scene-fit', result: 'fail', evidence: 'Synthetic user says music is heavy.'});
  assert.equal(failed.stage, 'motion-approved');
  assert.equal(failed.finalUserApproval, false);
  assert.throws(() => stageReady(failed, 'sound-approved', context), /failed review/);
});
const sceneAssets = () => packet.keyframes.map(frame => ({path: `media/${frame.id}.png`,
  kind: 'keyframe', keyframeId: frame.id, sha256: 'a'.repeat(64), origin: 'generated',
  sourceHistoryId: `synthetic-${frame.id}`}));
function withCast(manifest) {
  const cast = {path: 'media/cast.png', kind: 'character', characterId: 'cast',
    sha256: 'b'.repeat(64), origin: 'generated', sourceHistoryId: 'synthetic-cast'};
  manifest.assets = [cast, ...manifest.assets];
  manifest.jobs = manifest.assets.filter(asset => asset.origin === 'generated').map(asset => ({
    historyId: asset.sourceHistoryId, status: 'completed', chargedCredits: 18,
    requestFingerprint: fingerprint({syntheticFixture: asset.path}),
    outputAssetHashes: [asset.sha256],
  }));
  manifest.characterReferences = {cast: {type: 'image', id: 'synthetic-cast',
    url: 'https://example.test/cast.png', label: 'Synthetic test cast'}};
  for (const area of ['characters', 'characters-user']) manifest.reviews.push(reviewFor(manifest, area));
  return manifest;
}

test('bank fits brief; malformed criteria and scores cannot silently rank', () => {
  validateRubric(rubric);
  scenarios.forEach(item => validateScenario(item, rubric, brief));
  assert.throws(() => validateRubric({...rubric, criteria: rubric.criteria.slice(1)}), /total 100/);
  assert.throws(() => validateScenario({...scenario, scores: {...scenario.scores, clarity: 6}},
    rubric, brief), /1 to 5/);
});

test('discussion shortlist samples storytelling lanes and respects explicit rejects', () => {
  const slate = diverseShortlist(scenarios, rubric, {schemaVersion: 1, reviews: []}, 6);
  assert.equal(new Set(slate.map(item => item.lane)).size, 6);
  const rejected = {...selected, reviews: [{...selected.reviews[0], decision: 'reject'}]};
  assert.ok(!diverseShortlist(scenarios, rubric, rejected, 40).some(item => item.id === scenario.id));
  assert.throws(() => diverseShortlist(scenarios, rubric, rejected, 0), /positive/);
});

test('lighting plan must define motivated source, readability and shadow relationships', () => {
  validateLightingPlan(packet.lightingPlan);
  assert.throws(() => validateLightingPlan({...packet.lightingPlan, key: ''}), /key/);
  assert.throws(() => validateLightingPlan({...packet.lightingPlan, shadowMap: []}), /shadow map/);
  assert.throws(() => validateLightingPlan({...packet.lightingPlan,
    shadowMap: [{caster: 'hand', receiver: 'bench'}]}), /shadow relationship/);
});

test('user decision stays separate from editorial score, missing feedback is unreviewed', () => {
  const before = rankScenarios(scenarios, rubric);
  const after = rankScenarios(scenarios, rubric, selected);
  assert.equal(before.find(item => item.id === scenario.id).userDecision, 'unreviewed');
  assert.equal(after.find(item => item.id === scenario.id).userDecision, 'select');
  assert.equal(editorialScore(scenario, rubric), after.find(item => item.id === scenario.id).editorialScore);
  assert.deepEqual(before.map(item => item.id), after.map(item => item.id));
});

test('hard-gate failures remain ineligible regardless of weighted score', () => {
  const blocked = {...scenario, id: 'blocked-test', failedGates: ['feasible-repair-plan'],
    scores: Object.fromEntries(rubric.criteria.map(item => [item.id, 5]))};
  const ranked = rankScenarios([blocked, scenario], rubric);
  assert.equal(ranked[0].id, scenario.id);
  assert.equal(ranked[1].eligible, false);
});

test('feedback rejects unknown IDs, duplicates, out-of-range ratings and invented decisions', () => {
  for (const patch of [{scenarioId: 'missing'}, {rating: 0}, {decision: 'approved-to-spend'}]) {
    assert.throws(() => validateFeedback({schemaVersion: 1,
      reviews: [{...selected.reviews[0], ...patch}]}, scenarios));
  }
  assert.throws(() => validateFeedback({...selected,
    reviews: [selected.reviews[0], selected.reviews[0]]}, scenarios), /Duplicate/);
});

test('selection without a supplied numerical rating stays explicitly unrated', () => {
  const feedback = {...selected, reviews: [{...selected.reviews[0], rating: null}]};
  validateFeedback(feedback, scenarios);
  const ranked = rankScenarios(scenarios, rubric, feedback).find(item => item.id === scenario.id);
  assert.equal(ranked.userDecision, 'select');
  assert.equal(ranked.userRating, null);
});

test('selection is required but never gives a production budget or spend approval', () => {
  assert.throws(() => packetDraft(scenario, brief, {reviews: []}), /must select/);
  const draft = packetDraft(scenario, brief, selected);
  assert.equal(draft.generationApproved, false);
  assert.equal(draft.approvedBudgetCredits, 0);
  assert.equal(draft.stage, 'selected');
  assert.throws(() => packetDraft({...scenario, failedGates: ['feasible-repair-plan']},
    brief, selected), /hard gates/);
});

test('quote rounding is per unit half-up, then quantity, including rounding cancelling discount', () => {
  assert.equal(discountedCredits(5, 3, 10), 15);
  assert.equal(discountedCredits(70, 2, 10), 126);
  assert.throws(() => discountedCredits(70, 0, 10), /quantity/);
  for (const quote of modelData.quotes) {
    assert.equal(discountedCredits(quote.unitCredits, quote.quantity, quote.discountPercent),
      quote.chargedCreditsAtQuote);
  }
  for (const plan of modelData.planningExamples) {
    assert.equal(estimatePlan(plan.lines, modelData.quotes), plan.estimatedCredits);
  }
  assert.throws(() => estimatePlan([{quoteId: 'missing', jobs: 1}], modelData.quotes), /Unknown quote/);
});

test('packet requires existing endpoints, exact shot coverage and explicit pacing', () => {
  validatePacket(packet, scenarios);
  const bad = structuredClone(packet);
  bad.shots[0].endFrameId = 'nonexistent';
  assert.throws(() => validatePacket(bad, scenarios), /does not exist/);
  assert.throws(() => validatePacket({...packet, pacing: null}, scenarios), /Pacing/);
  assert.throws(() => validateTimeline([{...packet.shots[0], start: 1}], 5), /gap or overlap/);
  assert.throws(() => validateTimeline(packet.shots, 9), /exact film duration/);
});

test('pacing cannot omit response/hold or hide timeline gaps', () => {
  const bad = structuredClone(packet.pacing);
  bad.beats.at(-1).phase = 'anticipation';
  assert.throws(() => validatePacing(bad, 10), /hold in order/);
  bad.beats = structuredClone(packet.pacing.beats);
  bad.beats[1].start += 0.1;
  assert.throws(() => validatePacing(bad, 10), /gap/);
});

test('poetry and punchline endings can opt into justified lane-specific progression', () => {
  for (const lane of ['visual-poetry', 'visual-comedy']) {
    const pacing = {structure: 'lane-specific', hypothesis: 'Synthetic genre pacing.',
      hook: 'A visible pattern.', payoffEvidence: 'The final pattern completes.',
      endingRationale: 'End directly on the pattern/punchline; no redundant reaction.',
      beats: [{start: 0, end: 8, phase: 'progression', job: 'Establish a pattern.'},
        {start: 8, end: 10, phase: 'payoff', job: 'Complete it.'}], cutReasons: []};
    validatePacing(pacing, 10, lane);
    assert.throws(() => validatePacing({...pacing, endingRationale: ''}, 10, lane), /rationale/);
    assert.throws(() => validatePacing(pacing, 10), /appropriate lane/);
  }
});

test('text-led memes are eligible with explicit original text and muted readability plan', () => {
  const textPlan = {copy: 'My calendar: free. My laundry: not quite.',
    placement: 'Central high-contrast type clear of faces and UI.',
    readabilityTest: 'Fresh viewers read both lines at phone size with audio muted.',
    renderStage: 'Dedicated text composition after accepted picture; assembler does not render text.'};
  const meme = {...scenario, comprehensionMode: 'text-led', textPlan};
  validateScenario(meme, rubric, brief);
  assert.equal(rankScenarios([meme], rubric)[0].eligible, true);
  validatePacket({...packet, comprehensionMode: 'text-led', textPlan}, [meme]);
  assert.throws(() => validatePacket({...packet, comprehensionMode: 'text-led'}, [meme]), /Text-led/);
});

test('custom packets cannot advance with absent plans, broken endpoints or incomplete timing', () => {
  const manifest = workspace({stage: 'selected'});
  assert.equal(stageReady(manifest, 'preproduction', context), true);
  assert.throws(() => stageReady({...manifest, productionDraft: undefined}, 'preproduction', context), /missing production packet/);
  for (const key of ['identityBible', 'continuity', 'soundPlan']) {
    assert.throws(() => validatePacket({...packet, [key]: {}}, scenarios));
  }
  assert.throws(() => stageReady({...manifest,
    productionDraft: {...packet, shots: [{...packet.shots[0], endFrameId: 'missing'}]}},
  'preproduction', context), /exact film duration|does not exist/);
  assert.throws(() => stageReady({...manifest,
    productionDraft: {...packet, pacing: null}}, 'preproduction', context), /Pacing/);
});

test('hash is canonical and manifest paths cannot escape the project', () => {
  assert.equal(fingerprint({b: 2, a: 1}), fingerprint({a: 1, b: 2}));
  assert.notEqual(fingerprint({a: 1}), fingerprint({a: 2}));
  assert.throws(() => inside(root, '..\\outside.txt'), /escapes/);
  assert.throws(() => inside(root, 'C:\\private\\outside.txt'), /Absolute/);
  assert.equal(inside(root, 'data\\brief.json'), resolve(root, 'data\\brief.json'));
});

test('spend check binds exact quote and request, expiry, reserved budget and actual consent', () => {
  const at = Date.parse('2026-10-30T01:00:00+05:30');
  const request = fingerprint({model: 'test', params: {duration: 5}});
  const quote = {at: new Date(at).toISOString(), unitCredits: 70, quantity: 1,
    discountPercent: 10, requestFingerprint: request};
  const manifest = workspace({generationApproved: true, nextGenerationKind: 'character',
    spendApprovalEvidence: 'Synthetic test approval only', nextRequestFingerprint: request,
    approvedBudgetCredits: 200, spentCredits: 100, reservedCredits: 30});
  assert.equal(validateSpend(manifest, 63, quote, at, context), true);
  for (const nextGenerationKind of [null, 'scene', 'motion']) {
    assert.throws(() => validateSpend({...manifest, nextGenerationKind}, 63, quote, at, context), /Generation kind/);
  }
  assert.throws(() => validateSpend({...manifest, generationApproved: false}, 63, quote, at, context), /approval/);
  assert.throws(() => validateSpend({...manifest, reservedCredits: 40}, 63, quote, at, context), /budget/);
  assert.throws(() => validateSpend(manifest, 62, quote, at, context), /exact quoted/);
  assert.throws(() => validateSpend(manifest, 63, {...quote, requestFingerprint: fingerprint({different: 1})}, at, context), /bound/);
  assert.throws(() => validateSpend(manifest, 63, quote, at + 86400001, context), /fresh quote/);
  assert.throws(() => validateSpend(manifest, 63, quote, at - 1, context), /fresh quote/);
  assert.throws(() => validateSpend({...manifest,
    scenario: {...scenario, title: 'Changed story'}}, 63, quote, at, context), /Scenario revision/);
  assert.throws(() => validateSpend({...manifest,
    productionDraft: {...packet, singlePassPrompt: 'Changed plan'}}, 63, quote, at, context), /approval is stale/);
});

test('per-generation cap applies to discounted whole-job cost independently of total budget', () => {
  const at = Date.parse('2026-10-30T01:00:00+05:30');
  for (const [unitCredits, quantity, discountPercent, expected, allowed] of [
    [1111, 1, 10, 1000, true], [1112, 1, 10, 1001, false],
    [500, 2, 0, 1000, true], [501, 2, 0, 1002, false],
  ]) {
    const request = fingerprint({unitCredits, quantity, discountPercent});
    const quote = {at: new Date(at).toISOString(), unitCredits, quantity,
      discountPercent, requestFingerprint: request};
    const manifest = workspace({generationApproved: true, nextGenerationKind: 'character',
      spendApprovalEvidence: 'Synthetic bounded test approval.', nextRequestFingerprint: request,
      approvedBudgetCredits: 3000});
    if (allowed) assert.equal(validateSpend(manifest, expected, quote, at, context), true);
    else assert.throws(() => validateSpend(manifest, expected, quote, at, context), /per-generation credit cap/);
  }
});

test('resume checks current scenario, brief and selection; refresh retains ledgers but renews approvals', () => {
  const manifest = workspace({stage: 'final-approved', jobs: [{historyId: 'synthetic-only'}]});
  assert.throws(() => validateWorkspace(manifest, {...context,
    brief: {...brief, addedTestConstraint: true}}), /Brief revision/);
  for (const decision of ['reject', 'rewrite', 'shortlist']) {
    assert.throws(() => validateWorkspace(manifest, {...context, feedback: {
      ...selected, reviews: [{...selected.reviews[0], decision}]}}), /withdrawn/);
  }
  const changed = {...context, scenarios: scenarios.map(item => item.id === scenario.id ?
    {...item, logline: 'A newly revised synthetic story.'} : item)};
  assert.throws(() => validateWorkspace(manifest, changed), /Scenario revision/);
  const refreshed = refreshWorkspace(manifest, changed);
  assert.equal(refreshed.stage, 'selected');
  assert.equal(refreshed.generationApproved, false);
  assert.equal(refreshed.storyboardApproved, false);
  assert.equal(refreshed.finalUserApproval, false);
  assert.deepEqual(refreshed.jobs, manifest.jobs);
});

test('active job must resume its historyId rather than submitting again', () => {
  const requestFingerprint = fingerprint({prompt: 'synthetic'});
  const job = {historyId: 'synthetic-test-id', requestFingerprint, status: 'running', chargedCredits: 63};
  validateJob(job);
  assert.throws(() => ensureNoDuplicateJob([job], requestFingerprint), /Resume/);
  ensureNoDuplicateJob([{...job, status: 'completed'}], requestFingerprint);
  assert.throws(() => validateJob({...job, historyId: ''}), /real historyId/);
});

test('changed asset hashes invalidate reviews and a later failure supersedes an old pass', () => {
  const manifest = withCast(workspace({assets: sceneAssets(), stage: 'characters-approved'}));
  const assets = manifest.assets;
  const castReviews = [...manifest.reviews];
  const review = reviewFor(manifest, 'keyframes');
  manifest.reviews.push(review, reviewFor(manifest, 'keyframes-user'));
  assert.equal(stageReady(manifest, 'keyframes-approved', context), true);
  assert.throws(() => stageReady({...manifest,
    reviews: [...castReviews, review, {...review, result: 'fail'}]}, 'keyframes-approved', context), /review/);
  assert.throws(() => stageReady({...manifest,
    assets: assets.map((asset, i) => i === 1 ? {...asset, sha256: 'c'.repeat(64)} : asset),
    jobs: manifest.jobs.map(job => job.historyId === assets[1].sourceHistoryId
      ? {...job, outputAssetHashes: [...job.outputAssetHashes, 'c'.repeat(64)]} : job)},
  'keyframes-approved', context), /stale review/);
});

test('all endpoints precede motion and exact approved provider frames must be used', () => {
  const manifest = withCast(workspace({assets: sceneAssets(), stage: 'characters-approved'}));
  const assets = manifest.assets;
  assert.throws(() => stageReady({...manifest, assets: assets.slice(0, 1)},
    'keyframes-approved', context), /Missing accepted keyframe/);
  assert.notEqual(assetSetFingerprint(assets), assetSetFingerprint(assets.map((asset, i) =>
    i === 0 ? {...asset, keyframeId: 'different-binding'} : asset)));
  manifest.stage = 'design-locked';
  manifest.keyframeReferences = Object.fromEntries(packet.keyframes.map(frame => [frame.id, {
    type: 'image', id: `synthetic-${frame.id}`, url: `https://example.test/${frame.id}.png`,
    label: `Synthetic test ${frame.id}`,
  }]));
  for (const area of ['keyframes', 'keyframes-user', 'design-user']) manifest.reviews.push(reviewFor(manifest, area));
  const shot = packet.shots[0];
  const params = {...shot.paramsToQuote, prompt: shot.prompt,
    startFrame: manifest.keyframeReferences[shot.startFrameId],
    endFrame: manifest.keyframeReferences[shot.endFrameId]};
  assert.equal(validateMotionReferences(manifest, shot.id, params), true);
  manifest.assets.push({path: 'media/a.mp4', kind: 'video', sha256: 'd'.repeat(64)});
  assert.equal(validateMotionReferences(manifest, shot.id, params), true);
  assert.throws(() => validateMotionReferences({...manifest, stage: 'preproduction'}, shot.id, params), /before paid motion/);
  assert.throws(() => validateMotionReferences(manifest, shot.id, {...params, endFrame: null}), /endFrame/);
  assert.throws(() => validateMotionReferences(manifest, shot.id, {...params, startFrame: params.endFrame}), /startFrame/);
  assert.throws(() => validateMotionReferences(manifest, shot.id, {...params, duration: 10}), /duration/);
  assert.throws(() => validateMotionReferences(manifest, shot.id, {...params, prompt: 'Unapproved change.'}), /prompt differs/);
  assert.throws(() => validateMotionReferences(manifest, shot.id, {...params, fps: 60}), /Unapproved motion/);
  const rebound = structuredClone(manifest);
  rebound.keyframeReferences[shot.startFrameId] = params.endFrame;
  assert.throws(() => validateMotionReferences(rebound, shot.id,
    {...params, startFrame: params.endFrame}), /stale review/);
});

test('real user-approved characters precede guided scenes; sketches and swapped cast cannot pass', () => {
  const manifest = withCast(workspace());
  assert.equal(stageReady(manifest, 'characters-approved', context), true);
  const sceneStage = {...manifest, stage: 'characters-approved'};
  const params = {prompt: packet.keyframes[0].prompt, visualReferences: [manifest.characterReferences.cast]};
  assert.equal(validateSceneReferences(sceneStage, 'a-start', params), true);
  assert.throws(() => validateSceneReferences(manifest, 'a-start', params), /before scene/);
  assert.throws(() => validateSceneReferences(sceneStage, 'a-start', {...params, visualReferences: []}), /Every approved/);
  assert.throws(() => requireCharacterApproval({...manifest,
    assets: [{...manifest.assets[0], origin: 'sketch'}]}), /not a sketch/);
  assert.throws(() => requireCharacterApproval({...manifest, jobs: []}), /provenance/);
  assert.throws(() => requireCharacterApproval({...manifest,
    jobs: manifest.jobs.map(job => ({...job, outputAssetHashes: []}))}), /provenance/);
  assert.throws(() => requireCharacterApproval({...manifest,
    reviews: manifest.reviews.filter(item => item.area !== 'characters-user')}), /characters-user/);
  manifest.assets.push(...sceneAssets());
  assert.equal(requireCharacterApproval(manifest), true);
  const swapped = structuredClone(manifest);
  swapped.characterReferences.cast.url = 'https://example.test/different.png';
  assert.throws(() => requireCharacterApproval(swapped), /stale review/);
});

test('hook, every scene change and timed effect light/shadow plans are required', () => {
  for (const key of ['characterPlan', 'hookPlan', 'sceneChanges', 'atmospherePlan']) {
    assert.throws(() => validatePacket({...packet, [key]: undefined}, scenarios));
  }
  assert.throws(() => validatePacket({...packet, characterPlan: {...packet.characterPlan,
    references: [{...packet.characterPlan.references[0], covers: ['Mira']}]}}, scenarios), /Every required identity/);
  const bad = structuredClone(packet);
  bad.sceneChanges[0].at = 4;
  assert.throws(() => validatePacket(bad, scenarios), /transition/);
  const effect = packet.atmospherePlan.effects[0];
  for (const patch of [{shadowInteraction: ''}, {occlusion: ''}, {to: 11},
    {shotIds: ['a']}, {referenceFrameIds: ['a-start']}]) {
    assert.throws(() => validatePacket({...packet,
      atmospherePlan: {...packet.atmospherePlan, effects: [{...effect, ...patch}]}}, scenarios));
  }
});

test('a failed cast blocks advancement but can receive a specifically authorized repair', () => {
  const at = Date.parse('2026-10-30T14:00:00+05:30');
  const request = fingerprint({syntheticFixture: 'diagnosed cast repair'});
  const quote = {at: new Date(at).toISOString(), unitCredits: 20, quantity: 1,
    discountPercent: 10, requestFingerprint: request};
  const failed = recordReview(withCast(workspace({stage: 'characters-approved'})),
    {area: 'characters', result: 'fail', evidence: 'Synthetic wrong wardrobe.'});
  assert.equal(failed.stage, 'preproduction');
  assert.throws(() => stageReady(failed, 'characters-approved', context), /failed review/);
  assert.throws(() => validateSpend(failed, 18, quote, at, context), /generation approval/);
  const repair = {...failed, generationApproved: true, nextGenerationKind: 'character',
    spendApprovalEvidence: 'Synthetic exact consent: one diagnosed wardrobe repair, maximum 18.',
    nextRequestFingerprint: request, approvedBudgetCredits: 36, spentCredits: 18};
  assert.equal(validateSpend(repair, 18, quote, at, context), true);
  assert.throws(() => stageReady(repair, 'characters-approved', context), /failed review/);
});

test('design lock needs user scene review and a tested cleared composite when selected', () => {
  const manifest = withCast(workspace({assets: sceneAssets(), stage: 'keyframes-approved'}));
  manifest.productionDraft.atmospherePlan.effects[0].route = 'composite';
  manifest.productionFingerprint = productionRevision(manifest);
  manifest.reviews.push(reviewFor(manifest, 'keyframes'));
  assert.throws(() => stageReady(manifest, 'design-locked', context), /keyframes-user/);
  manifest.reviews.push(reviewFor(manifest, 'keyframes-user'));
  assert.throws(() => stageReady(manifest, 'design-locked', context), /Composite effect/);
  manifest.assets.push({path: 'media/rain-overlay.mov', kind: 'effect', effectId: 'rain', sha256: 'f'.repeat(64)});
  manifest.effectRights = {rain: 'Synthetic fixture rights evidence.'};
  for (const area of ['keyframes', 'keyframes-user', 'effect-preflight', 'design-user']) {
    manifest.reviews.push(reviewFor(manifest, area));
  }
  assert.equal(stageReady(manifest, 'design-locked', context), true);
  const changedRights = structuredClone(manifest);
  changedRights.effectRights.rain = 'Synthetic changed, unreviewed licence scope.';
  assert.throws(() => stageReady(changedRights, 'design-locked', context), /stale review/);
  const changed = structuredClone(manifest);
  changed.productionDraft.atmospherePlan.effects[0].lightInteraction = 'A revised glow source.';
  assert.throws(() => stageReady(changed, 'design-locked', context), /approval is stale/);
});
test('stage gates cannot skip, infer native sound inspection or publish', () => {
  assert.throws(() => stageReady({stage: 'selected'}, 'motion-approved'), /next workflow/);
  assert.throws(() => stageReady({stage: 'final-approved'}, 'published'), /manual/);
  for (const soundDecision of ['native', 'unknown']) {
    const manifest = workspace({stage: 'motion-approved', soundDecision, nativeAudioInspected: false,
      assets: [{path: 'media/unrelated.wav', kind: 'audio', sha256: 'e'.repeat(64)}]});
    assert.throws(() => stageReady(manifest, 'sound-approved', context), /audio/);
  }
});

test('final approval requires every current review including pacing and actual user consent', () => {
  const assets = [{path: 'outputs/final.mp4', kind: 'final', sha256: 'c'.repeat(64)}];
  const manifest = workspace({stage: 'sound-approved', assets, finalUserApproval: true});
  manifest.soundDecision = 'silent';
  const reviews = [...REVIEW_AREAS, 'final-user'].map(area => reviewFor(manifest, area));
  manifest.reviews = reviews;
  assert.equal(stageReady(manifest, 'final-approved', context), true);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'pacing-hook-reveal-hold')}, 'final-approved', context), /pacing/);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'lighting-shadow-continuity')}, 'final-approved', context), /lighting/);
  assert.throws(() => stageReady({...manifest, finalUserApproval: false}, 'final-approved', context), /user approval/);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'final-user')}, 'final-approved', context), /final-user/);
  const failed = recordReview({...manifest, stage: 'final-approved', generationApproved: true},
    {area: 'phone-and-export', result: 'fail', evidence: 'Synthetic later failure.'});
  assert.equal(failed.stage, 'sound-approved');
  assert.equal(failed.finalUserApproval, false);
  assert.equal(failed.generationApproved, false);
  assert.throws(() => stageReady(failed, 'final-approved', context), /failed review/);
});

test('personal acceptance cannot be forged from legacy or delegated user labels', () => {
  const manifest = withCast(workspace());
  const personal = manifest.reviews.at(-1);
  assert.equal(requireAcceptance(manifest, 'characters').area, 'characters-user');
  for (const authority of [undefined, 'user-delegated autonomous agent review',
    {type: 'personal-user', personallyViewedByUser: false}]) {
    assert.throws(() => requireAcceptance({...manifest, reviews: [
      ...manifest.reviews.slice(0, -1), {...personal, authority}]}, 'characters'), /Personal-user/);
    assert.throws(() => recordReview(manifest, {...personal, authority}), /Personal-user/);
  }
});

test('delegated acceptance is scoped, revocable, expiring and source-bound, never final user approval', () => {
  const manifest = withCast(workspace());
  manifest.reviews = manifest.reviews.filter(item => item.area !== 'characters-user');
  const delegation = {id: 'synthetic', status: 'active', scope: ['characters'],
    instruction: 'Synthetic explicit bounded delegation; no real user instruction.',
    productionFingerprint: manifest.productionFingerprint, creditCeiling: 0,
    authorizedAt: new Date(Date.now() - 1000).toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString()};
  manifest.delegations = [delegation];
  const review = {area: 'characters-delegated', result: 'pass', evidence: 'Synthetic actual inspection.',
    authority: {type: 'delegated', delegationId: 'synthetic', personallyViewedByUser: false}};
  const accepted = recordReview(manifest, review);
  assert.equal(requireAcceptance(accepted, 'characters').area, 'characters-delegated');
  assert.equal(stageReady(accepted, 'characters-approved', context), true);
  assert.throws(() => requireAcceptance({...accepted, delegations: []}, 'characters'), /delegation/);
  assert.throws(() => requireAcceptance({...accepted, assets: accepted.assets.map(asset =>
    ({...asset, sha256: 'e'.repeat(64)}))}, 'characters'), /stale review/);
  for (const patch of [{status: 'withdrawn'}, {scope: ['design']}, {instruction: ''},
    {productionFingerprint: 'stale'}, {expiresAt: new Date(0).toISOString()}]) {
    assert.throws(() => requireAcceptance({...accepted, delegations: [{...delegation, ...patch}]},
      'characters'), /delegation/);
  }
  const failed = recordReview({...accepted, stage: 'characters-approved'}, {...review, result: 'fail'});
  assert.equal(failed.stage, 'preproduction');
  assert.throws(() => requireAcceptance(failed, 'characters'), /Missing or stale/);
  assert.throws(() => recordReview(accepted, {...review, area: 'final-delegated'}), /cannot be delegated/);
  assert.throws(() => recordReview(accepted, {...review, area: 'final-user'}), /Personal-user/);
});

test('entertainment requires actual scoped evidence and invalidates on brief/media changes or later failure', () => {
  const manifest = workspace({stage: 'sound-approved', soundDecision: 'silent', finalUserApproval: true,
    assets: [{path: 'outputs/final.mp4', kind: 'final', sha256: 'c'.repeat(64)}]});
  manifest.reviews = [...REVIEW_AREAS.filter(area => area !== 'entertainment-wow-enjoyment'),
    'final-user'].map(area => reviewFor(manifest, area));
  assert.throws(() => stageReady(manifest, 'final-approved', context), /entertainment/);
  const review = {area: 'entertainment-wow-enjoyment', result: 'pass',
    evidence: 'Synthetic review', report: entertainmentReport()};
  for (const report of [undefined, {...review.report, picture: 'sampled-frames'},
    {...review.report, dimensions: review.report.dimensions.slice(1)},
    {...review.report, unresolvedFailures: ['Boring payoff']},
    {...review.report, dimensions: review.report.dimensions.map(item => ({...item,
      evidence: [{from: 0, to: 11, observation: 'Outside film'}]}))}]) {
    assert.throws(() => recordReview(manifest, {...review, report}), /Entertainment|entertainment|Assess/);
  }
  const accepted = recordReview(manifest, review);
  assert.equal(stageReady(accepted, 'final-approved', context), true);
  assert.throws(() => requireReview({...accepted, entertainmentBrief: {
    ...manifest.entertainmentBrief, lane: 'visual-poetry'}}, review.area), /stale/);
  assert.throws(() => requireReview({...accepted, assets: [{...manifest.assets[0],
    sha256: 'd'.repeat(64)}]}, review.area), /stale/);
  const failed = recordReview({...accepted, stage: 'final-approved'}, {
    area: review.area, result: 'fail', evidence: 'Synthetic boredom finding at 5s.'});
  assert.equal(failed.stage, 'sound-approved');
  assert.equal(failed.finalUserApproval, false);
  assert.throws(() => stageReady(failed, 'final-approved', context), /failed review/);
});

test('explicit legacy migration preserves history but cannot rebind stale evidence or invent personal approval', () => {
  const manifest = withCast(workspace());
  const original = {...manifest.reviews.at(-1), authority: 'user-delegated autonomous agent review',
    personallyViewedByUser: false, delegationInstruction: 'Synthetic explicit autonomous completion.'};
  manifest.reviews[manifest.reviews.length - 1] = original;
  const delegation = {id: 'legacy-test', status: 'active', scope: ['characters'],
    instruction: original.delegationInstruction, creditCeiling: 0,
    productionFingerprint: manifest.productionFingerprint,
    authorizedAt: new Date(Date.now() - 1000).toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString()};
  const updated = migrateDelegatedAcceptances(manifest, delegation);
  assert.deepEqual(updated.reviews.slice(0, -1), manifest.reviews);
  assert.equal(requireAcceptance(updated, 'characters').area, 'characters-delegated');
  assert.equal(updated.finalUserApproval, false);
  assert.equal(updated.generationApproved, false);
  assert.throws(() => migrateDelegatedAcceptances(updated, delegation), /already exists/);
  assert.throws(() => migrateDelegatedAcceptances({...manifest, reviews: [{
    ...original, assetSetFingerprint: 'stale'}]}, delegation), /never rebind stale/);
  assert.throws(() => migrateDelegatedAcceptances({...manifest, reservedCredits: 1}, delegation), /terminal-job/);
});
