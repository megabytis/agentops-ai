# AgentOps AI — GitHub Code Intelligence System

A production-grade backend system that ingests GitHub repositories, runs multi-step AI analysis via LangGraph (Python), and generates architecture summaries, READMEs, code quality reports, and improvement suggestions with self-evaluation and retry loops.

## Architecture

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Node.js    │────▶│   Python    │
│  (HTTP)     │     │  Backend    │     │  AI Service │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   BullMQ    │     │  LangGraph  │
                    │   + Redis   │     │  Workflow   │
                    └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  MongoDB    │     │  OpenAI API │
                    │ (Mongoose)  │     │             │
                    └─────────────┘     └─────────────┘
```
