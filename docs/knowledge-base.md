# Retrieve first, research only the gap

The project now has a local retrieval knowledge base, not another external
research loop. `data\knowledge.json` stores concise original findings, rules,
sources/read scope, review date and `stable` versus `live-required` status.
Public playbooks/skills/reviewer documents are also indexed with line citations.

```powershell
npm run film -- knowledge "heavy music scene emotion"
npm run film -- knowledge "teenage love gaze subtext"
npm run film -- knowledge "parents conflict child repair"
npm run film -- knowledge "grandmother photograph nostalgia memory"
npm run film -- knowledge rebuild
```

The dependency-free Node BM25 engine persists a derived index in
`.cache\knowledge-index.json`. It reuses that cache while source fingerprints
match and rebuilds when a source changes. Results include citations, evidence
scope, freshness and known failed/blocked research URLs. New `film packet`
workspaces capture retrieval citations and the source fingerprint automatically.
Search does not call an LLM, embedding service, web API or paid generator.

## Research policy

1. Retrieve the relevant local knowledge and read the cited scope first.
2. Name a specific unanswered question. If existing evidence suffices, stop.
3. Fetch only that gap, not the entire topic again. Persist a concise finding
   with what was actually read and its limitations before continuing.
4. Record failed URLs/challenges rather than repeating guesses or bypassing
   access restrictions. Search snippets do not become full-paper evidence.
5. Reuse stable craft/experimental evidence across scripts. Exact vendor forms,
   reference limits, quotes, account balances and active-job status remain live
   checks before spending; a cached snapshot is not spend authorization.

The four new pilots already have reusable evidence on context-dependent gaze,
adult-led regulation/repair and photo-cued nostalgia. Use those entries; do not
repeat broad research merely because the next script has a different title.

## Why not a vector service yet?

This corpus is small and topic names/technical terms are explicit. Local BM25 is
transparent, deterministic, cheap and easy to validate; a vector database would
add model/version/storage dependencies and possible data transfer without an
established retrieval benefit. This is retrieval for grounded reasoning, **not
semantic embeddings**. If paraphrase recall later proves insufficient, evaluate
a local embedding/hybrid reranker against real missed queries first. Do not
install an external service or upload the corpus by default.

Only allowlisted public project Markdown and `data\knowledge.json` are indexed.
Workspace manifests, output media, private reviews, job/account records, signed
URLs, `.env`, source code and symlinks are excluded. The cache is derived and
Git-ignored; curated knowledge is versioned. A matching chunk is not an automatic
fact check, review pass or permission to generate/publish.
