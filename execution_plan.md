## V1 Definition (strict scope)

**Goal:**
Given a GitHub repo URL → return:

- repo summary
- basic README
- 3–5 improvement suggestions

No auth.
No DB.
No queue.
No retries.
No evaluation loop.

---

## V1 Architecture

- **Node (API)** → receives request
- **Python (AI service)** → runs workflow (simple, linear)

Communication: HTTP

---

## V1 Workflow (no LangGraph yet)

1. Ingest repo (clone/fetch)
2. Extract file tree + key files
3. Summarize chunks
4. Aggregate to repo summary
5. Generate README
6. Generate improvements

Single pass. No branching.

---

## V1 Tech (minimal)

### Node

- **Express.js**
- TypeScript (basic only)

### Python

- **FastAPI**
- **OpenAI API**

No LangGraph yet.

---

## V1 Output (strict)

Return JSON:

```
{
  summary,
  readme,
  improvements
}
```

---

## V1 Success Criteria

- works end-to-end
- handles at least small repos
- consistent structured output

If this fails → do not move forward.

---

## V2 (only after V1 works)

Add:

- LangGraph (convert linear → graph)
- evaluation + retry loop
- async jobs
- DB persistence

---

## V3

Add:

- auth
- multiple workflows
- observability

---

## Core rule

- V1 = working pipeline
- V2 = intelligent system
- V3 = production system

---

## Mistake to avoid

Starting with:

- queues
- complex orchestration
- premature abstractions

That leads to unfinished projects.

---

## Final constraint

Ship V1 first.
No upgrades before that.
