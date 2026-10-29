import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  assetSetFingerprint, discountedCredits, diverseShortlist, editorialScore, ensureNoDuplicateJob,
  estimatePlan, fingerprint, inside, packetDraft, productionRevision, rankScenarios, readJson,
  recordReview, refreshWorkspace,
  REVIEW_AREAS, stageReady, validateFeedback, validateJob, validatePacket,
  validateLightingPlan, validatePacing, validateRubric, validateScenario, validateSpend, validateTimeline,
  validateWorkspace, validateMotionReferences,
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
    storyboardApproved: true, storyboardApprovalEvidence: 'Synthetic unit-test approval.', ...patch};
  manifest.productionFingerprint = productionRevision(manifest);
  return manifest;
}
const reviewFor = (manifest, area, result = 'pass') => ({area, result, evidence: 'Synthetic review',
  assetSetFingerprint: assetSetFingerprint(manifest.assets),
  productionFingerprint: manifest.productionFingerprint});

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
  const manifest = workspace({generationApproved: true,
    spendApprovalEvidence: 'Synthetic test approval only', nextRequestFingerprint: request,
    approvedBudgetCredits: 200, spentCredits: 100, reservedCredits: 30});
  assert.equal(validateSpend(manifest, 63, quote, at, context), true);
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
  const assets = packet.keyframes.map(frame => ({path: `media/${frame.id}.png`,
    kind: 'keyframe', keyframeId: frame.id, sha256: 'a'.repeat(64)}));
  const manifest = workspace({assets});
  const review = reviewFor(manifest, 'keyframes');
  manifest.reviews = [review];
  assert.equal(stageReady(manifest, 'keyframes-approved', context), true);
  assert.throws(() => stageReady({...manifest,
    reviews: [review, {...review, result: 'fail'}]}, 'keyframes-approved', context), /review/);
  assert.throws(() => stageReady({...manifest,
    assets: assets.map((asset, i) => i === 0 ? {...asset, sha256: 'b'.repeat(64)} : asset)},
  'keyframes-approved', context), /stale review/);
});

test('all endpoints precede motion and exact approved provider frames must be used', () => {
  const assets = packet.keyframes.map(frame => ({path: `media/${frame.id}.png`,
    kind: 'keyframe', keyframeId: frame.id, sha256: 'a'.repeat(64)}));
  const manifest = workspace({assets});
  manifest.reviews = [reviewFor(manifest, 'keyframes')];
  assert.throws(() => stageReady({...manifest, assets: assets.slice(0, 1)},
    'keyframes-approved', context), /Missing accepted keyframe/);
  assert.notEqual(assetSetFingerprint(assets), assetSetFingerprint(assets.map((asset, i) =>
    i === 0 ? {...asset, keyframeId: 'different-binding'} : asset)));
  manifest.stage = 'keyframes-approved';
  manifest.keyframeReferences = Object.fromEntries(packet.keyframes.map(frame => [frame.id, {
    type: 'image', id: `synthetic-${frame.id}`, url: `https://example.test/${frame.id}.png`,
    label: `Synthetic test ${frame.id}`,
  }]));
  manifest.reviews = recordReview(manifest, {area: 'keyframes', result: 'pass',
    evidence: 'Synthetic frame files and provider bindings reviewed together.'}).reviews;
  const shot = packet.shots[0];
  const params = {...shot.paramsToQuote, prompt: shot.prompt,
    startFrame: manifest.keyframeReferences[shot.startFrameId],
    endFrame: manifest.keyframeReferences[shot.endFrameId]};
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
  const reviews = REVIEW_AREAS.map(area => reviewFor(manifest, area));
  manifest.reviews = reviews;
  assert.equal(stageReady(manifest, 'final-approved', context), true);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'pacing-hook-reveal-hold')}, 'final-approved', context), /pacing/);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'lighting-shadow-continuity')}, 'final-approved', context), /lighting/);
  assert.throws(() => stageReady({...manifest, finalUserApproval: false}, 'final-approved', context), /user approval/);
  const failed = recordReview({...manifest, stage: 'final-approved', generationApproved: true},
    {area: 'phone-and-export', result: 'fail', evidence: 'Synthetic later failure.'});
  assert.equal(failed.stage, 'sound-approved');
  assert.equal(failed.finalUserApproval, false);
  assert.equal(failed.generationApproved, false);
  assert.throws(() => stageReady(failed, 'final-approved', context), /failed review/);
});
