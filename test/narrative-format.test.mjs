import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, mkdtempSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {assemblyArgs, parseMediaInfo} from '../lib/assembly.mjs';
import {fileHash, packetDraft, productionRevision, readJson, scenarioFormat,
  fingerprint, recordReview, validatePacket, validateScenario, validateSceneReferences} from '../lib/workflow.mjs';

const root=resolve(import.meta.dirname,'..');
const brief=readJson(resolve(root,'data','brief.json'));
const rubric=readJson(resolve(root,'data','rubric.json'));
const {scenarios}=readJson(resolve(root,'data','scenarios.json'));
const scenario=scenarios.find(item=>item.id==='afternoon-again');
const packet=readJson(resolve(root,'examples','afternoon-again.json'));

test('scene-specific cast references prevent identity leakage while legacy scenes still require all cast refs',()=>{
  const draft=structuredClone(packet);
  draft.characterPlan.references=draft.characterPlan.requiredIdentities.map(id=>({
    id,covers:[id],prompt:'Synthetic isolated identity reference.'}));
  const frame=draft.keyframes[0];
  frame.characterReferenceIds=['Meera19'];
  let manifest={productionDraft:draft,productionFingerprint:fingerprint(draft),
    assets:draft.characterPlan.references.map(ref=>({kind:'character',characterId:ref.id,
      path:`media\\synthetic-${ref.id}.png`,sha256:'a'.repeat(64),origin:'authorized-reference',
      permissionEvidence:'Synthetic test provenance only.'})),
    characterReferences:Object.fromEntries(draft.characterPlan.references.map(ref=>[ref.id,
      {type:'image',id:ref.id,url:`https://example.test/${ref.id}.png`,label:'Synthetic identity'}])),
    stage:'characters-approved',reviews:[]};
  manifest=recordReview(manifest,{area:'characters',result:'pass',evidence:'Synthetic cast fixture.'});
  manifest=recordReview(manifest,{area:'characters-user',result:'pass',evidence:'Synthetic authority fixture.',
    authority:{type:'personal-user',personallyViewedByUser:true}});
  const refs=manifest.characterReferences;
  const params={prompt:frame.prompt,visualReferences:[refs.Meera19]};
  assert.equal(validateSceneReferences(manifest,frame.id,params),true);
  assert.throws(()=>validateSceneReferences(manifest,frame.id,{...params,visualReferences:[]}),/Every approved/);
  assert.throws(()=>validateSceneReferences(manifest,frame.id,
    {...params,visualReferences:[refs.Meera19,refs.Mother32]}),/Unregistered scene/);
  for(const ids of [[],['unknown'],['Meera19','Meera19']]){
    const changed=structuredClone(draft);
    changed.keyframes[0].characterReferenceIds=ids;
    assert.throws(()=>validatePacket(changed,scenarios),/known unique cast/);
  }
  delete frame.characterReferenceIds;
  assert.throws(()=>validateSceneReferences(manifest,frame.id,params),/Every approved/);
  assert.equal(validateSceneReferences(manifest,frame.id,
    {...params,visualReferences:Object.values(refs)}),true);
  frame.characterReferenceIds=['Meera19'];
  const sceneId=draft.keyframes[1].id;
  frame.sceneReferenceIds=[sceneId];
  const scene={type:'image',id:'synthetic-scene',url:'https://example.test/prop.png',label:'Synthetic prop'};
  manifest.keyframeReferences={[sceneId]:scene};
  manifest.assets.push({kind:'keyframe',keyframeId:sceneId,path:'media\\synthetic-prop.png',
    sha256:'b'.repeat(64),origin:'authorized-reference',permissionEvidence:'Synthetic prop fixture only.'});
  assert.throws(()=>validateSceneReferences(manifest,frame.id,params),/Every planned scene/);
  assert.equal(validateSceneReferences(manifest,frame.id,
    {...params,visualReferences:[refs.Meera19,scene]}),true);
  for(const ids of [[],['unknown'],[frame.id],[sceneId,sceneId]]){
    const changed=structuredClone(draft);
    changed.keyframes[0].sceneReferenceIds=ids;
    assert.throws(()=>validatePacket(changed,scenarios),/known unique other frame/);
  }
});

test('longer causal narratives require a bounded scenario opt-in without widening defaults',()=>{
  assert.equal(validateScenario(scenario,rubric,brief),undefined);
  validatePacket(packet,scenarios);
  assert.deepEqual(scenarioFormat(scenario,brief),{minimumSeconds:8,maximumSeconds:30,maximumShots:5});
  const missing=structuredClone(scenario);
  delete missing.formatOverride;
  assert.throws(()=>validateScenario(missing,rubric,brief),/duration outside brief/);
  assert.throws(()=>validatePacket(packet,scenarios.map(s=>s.id===scenario.id?missing:s)),/format outside/);
  const ordinary=scenarios.find(s=>!s.formatOverride);
  assert.equal(scenarioFormat(ordinary,brief).maximumSeconds,brief.format.maximumSeconds);
  for(const change of [{maximumSeconds:31},{maximumShots:6},{reason:''},{maximumSeconds:NaN}]){
    const invalid={...scenario,formatOverride:{...scenario.formatOverride,...change}};
    assert.throws(()=>validateScenario(invalid,rubric,brief),/bounded limits/);
  }
  assert.throws(()=>validateScenario({...scenario,shots:6},rubric,brief),/shot count/);
});

test('an opted-in 24s review compiles and decodes without extending the ordinary edit limit',t=>{
  const seconds=24;
  const ffmpeg=process.env.FFMPEG_PATH;
  if(!ffmpeg||!existsSync(ffmpeg)){t.skip('Set FFMPEG_PATH for actual extended-edit encode/decode.');return;}
  mkdirSync(resolve(root,'workspace'),{recursive:true});
  const dir=mkdtempSync(resolve(root,'workspace','narrative-format-'));
  const selected=scenario,draft=packet;
  const selectedScenarios=scenarios.map(item=>item.id===selected.id?selected:item);
  const source=resolve(dir,'synthetic.mp4');
  const generated=spawnSync(ffmpeg,['-hide_banner','-nostdin','-v','error','-n','-f','lavfi',
    '-i','testsrc2=size=90x160:rate=10','-t',String(seconds),'-an','-c:v','libx264',source],{encoding:'utf8'});
  assert.equal(generated.status,0,generated.stderr);
  const feedback={schemaVersion:1,reviews:[{scenarioId:scenario.id,decision:'select',rating:null,
    note:'Synthetic narrative-format fixture only.',at:new Date().toISOString()}]};
  const manifest={...packetDraft(selected,brief,feedback),stage:'design-locked',
    productionDraft:draft,approvalRevision:1,soundDecision:'silent',
    assets:[{kind:'video',path:relative(dir,source),sha256:fileHash(source)}]};
  manifest.productionFingerprint=productionRevision(manifest);
  const version=`v${Date.now()}`;
  const output=resolve(dir,'outputs',scenario.id,version,'finalVid',`${scenario.id}-${version}-review.mp4`);
  mkdirSync(resolve(output,'..'),{recursive:true});
  const edit={schemaVersion:1,purpose:'review',seconds,width:90,height:160,fps:10,
    clips:draft.shots.map(s=>({path:relative(dir,source),in:0,seconds:s.end-s.start})),
    audio:{route:'silent'},output:relative(dir,output)};
  const context={scenarios:selectedScenarios,brief,feedback};
  assert.throws(()=>assemblyArgs(dir,{...edit,
    clips:Array.from({length:7},()=>edit.clips[0])},manifest,context),
  /accepted clips/);
  assert.throws(()=>assemblyArgs(dir,edit,{...manifest,scenario:{...selected,formatOverride:undefined}},context),
    /selected narrative format/);
  const encoded=spawnSync(ffmpeg,assemblyArgs(dir,edit,manifest,context).args,{encoding:'utf8'});
  assert.equal(encoded.status,0,encoded.stderr);
  const decoded=spawnSync(ffmpeg,['-hide_banner','-nostdin','-i',output,'-progress','pipe:1','-f','null','NUL'],
    {encoding:'utf8'});
  assert.equal(decoded.status,0,decoded.stderr);
  assert.equal(parseMediaInfo(decoded.stderr).seconds,seconds);
  assert.equal(Number([...decoded.stdout.matchAll(/frame=(\d+)/g)].at(-1)[1]),seconds*10);
});
