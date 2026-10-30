import {existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fingerprint, invariant} from './workflow.mjs';

const stopWords = new Set('a an and are as at be before by for from how i in is it of on or our should that the their this to was we what when which with'.split(' '));
const tokenize = text => (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
  .filter(word => !stopWords.has(word));

function publicSources(root) {
  const paths = [];
  const walk = dir => {
    if (!existsSync(dir) || lstatSync(dir).isSymbolicLink()) return;
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      if (entry.isSymbolicLink()) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.md')) paths.push(path);
    }
  };
  for (const folder of ['docs', join('.github', 'skills'), join('.github', 'agents')]) walk(resolve(root, folder));
  for (const file of ['AGENTS.md', 'README.md', join('data', 'knowledge.json')]) {
    const path = resolve(root, file);
    if (existsSync(path) && !lstatSync(path).isSymbolicLink()) paths.push(path);
  }
  return paths.sort().map(path => ({path: relative(root, path), text: readFileSync(path, 'utf8')}));
}

function documents(sources) {
  const docs = [];
  let blockedSources = [];
  for (const source of sources) {
    if (source.path.replaceAll('\\', '/') === 'data/knowledge.json') {
      const data = JSON.parse(source.text);
      invariant(data.schemaVersion === 1 && Array.isArray(data.entries), 'Unsupported knowledge register.');
      blockedSources = data.unavailableSources ?? [];
      const ids = new Set();
      for (const entry of data.entries) {
        invariant(typeof entry.id === 'string' && !ids.has(entry.id) && entry.title?.trim() &&
          entry.summary?.trim() && Array.isArray(entry.rules) && entry.rules.length > 0 &&
          Array.isArray(entry.sources) && entry.sources.length > 0 &&
          ['stable', 'live-required'].includes(entry.freshness) &&
          Number.isFinite(Date.parse(entry.reviewedAt)), 'Knowledge entries require unique IDs, evidence, dates and freshness.');
        ids.add(entry.id);
        docs.push({id: entry.id, title: entry.title, citation: `${source.path}#${entry.id}`,
          text: [entry.summary, ...entry.rules].join('\n'), keywords: (entry.tags ?? []).join(' '),
          evidenceType: entry.evidenceType, freshness: entry.freshness, reviewedAt: entry.reviewedAt,
          sources: entry.sources});
      }
    } else {
      const lines = source.text.split(/\r?\n/);
      let heading = source.path;
      for (let start = 0; start < lines.length; start += 28) {
        const end = Math.min(start + 36, lines.length);
        const chunk = lines.slice(start, end);
        for (const line of lines.slice(start, Math.min(start + 28, lines.length))) {
          if (/^#{1,3} /.test(line)) heading = line.replace(/^#+ /, '');
        }
        const text = chunk.join('\n').trim();
        if (!text) continue;
        docs.push({id: `${source.path}:${start + 1}`, title: heading,
          citation: `${source.path}:${start + 1}-${end}`, text, keywords: source.path,
          evidenceType: 'project-document; inspect its cited source/read scope',
          freshness: /generation-preflight|model-audio-decision/.test(source.path) ? 'live-required' : 'stable',
          sources: [{path: source.path, scope: 'Current project document, not a new external read.'}]});
      }
    }
  }
  return {docs, blockedSources};
}

export function knowledgeIndex(root, {force = false} = {}) {
  const sources = publicSources(root);
  const sourceFingerprint = fingerprint(sources);
  const cache = resolve(root, '.cache', 'knowledge-index.json');
  if (!force && existsSync(cache)) {
    try {
      const index = JSON.parse(readFileSync(cache, 'utf8'));
      if (index.schemaVersion === 1 && index.sourceFingerprint === sourceFingerprint) {
        return {...index, cacheHit: true};
      }
    } catch {
      // Rebuild an interrupted cache, never treat it as canonical research.
    }
  }
  const {docs, blockedSources} = documents(sources);
  const df = {};
  let totalLength = 0;
  for (const doc of docs) {
    const tokens = tokenize(`${doc.title} ${doc.title} ${doc.keywords} ${doc.keywords} ${doc.text}`);
    doc.terms = {};
    for (const token of tokens) doc.terms[token] = (doc.terms[token] ?? 0) + 1;
    doc.length = tokens.length;
    totalLength += tokens.length;
    for (const token of Object.keys(doc.terms)) df[token] = (df[token] ?? 0) + 1;
  }
  const index = {schemaVersion: 1, engine: 'local-bm25', sourceFingerprint,
    builtAt: new Date().toISOString(), sourceCount: sources.length,
    averageLength: totalLength / (docs.length || 1), df, docs, blockedSources};
  mkdirSync(dirname(cache), {recursive: true});
  const temporary = `${cache}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, JSON.stringify(index), {flag: 'wx'});
  renameSync(temporary, cache);
  return {...index, cacheHit: false};
}

export function searchKnowledge(root, query, limit = 5) {
  invariant(typeof query === 'string' && query.trim() &&
    Number.isInteger(limit) && limit >= 1 && limit <= 10, 'Use a focused knowledge query and limit 1-10.');
  const index = knowledgeIndex(root);
  const terms = [...new Set(tokenize(query))];
  invariant(terms.length > 0, 'Query needs meaningful search terms.');
  const hits = index.docs.map(doc => {
    let score = 0;
    for (const term of terms) {
      const tf = doc.terms[term] ?? 0;
      if (!tf) continue;
      const idf = Math.log(1 + (index.docs.length - index.df[term] + 0.5) / (index.df[term] + 0.5));
      score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * doc.length / (index.averageLength || 1)));
    }
    const {terms: ignoredTerms, length: ignoredLength, keywords: ignoredKeywords, ...hit} = doc;
    return {...hit, score: Number(score.toFixed(4))};
  }).filter(hit => hit.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return {query, engine: index.engine, cacheHit: index.cacheHit, sourceFingerprint: index.sourceFingerprint,
    hits, knownUnavailableSources: index.blockedSources.filter(source =>
      tokenize((source.tags ?? []).join(' ')).some(term => terms.includes(term))),
    policy: 'Retrieve existing evidence first. Fetch only a specific unresolved gap, persist the result, then stop. Live model forms/quotes/balance always need current tools; cached knowledge is never spending or release approval.',
    limitation: 'Lexical retrieval, not semantic embeddings or an automatic fact checker. A hit is evidence to read, not proof it answers the question.'};
}
