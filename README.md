# AgentOps AI — GitHub Code Intelligence System

A production-grade backend system that ingests GitHub repositories, runs multi-step AI analysis via LangGraph (Python), and generates architecture summaries, READMEs, code quality reports, and improvement suggestions with self-evaluation and retry loops.

🔗 **Live Demo:** [https://agentops-ai.vercel.app/](https://agentops-ai.vercel.app/)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://agentops-ai.vercel.app/)

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

## Prerequisites

- **Node.js** ≥ 18 & **npm**
- **Python** ≥ 3.10
- **Git**
- A **GitHub Personal Access Token** ([create one here](https://github.com/settings/tokens))
- A **Groq API Key** ([get one here](https://console.groq.com/keys))

## Getting Started (Local Setup)

### 1 — Clone the repository

```bash
git clone https://github.com/MadhuSudan-Mku/agentops-ai.git
cd agentops-ai
```

### 2 — Start the Python AI Service

```bash
cd python-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `python-service/`:

```env
GITHUB_TOKEN="your_github_personal_access_token"
GROQ_API_KEY="your_groq_api_key"
```

Run the service:

```bash
uvicorn main:app --reload --port 8000
```

### 3 — Start the Node.js Backend

Open a **new terminal**:

```bash
cd node-backend
npm install
```

Create a `.env` file inside `node-backend/`:

```env
AI_SERVICE_URL="http://localhost:8000"
```

Run the backend:

```bash
npm run dev
```

### 4 — Open the Frontend

Update `frontend/env.js` to point to your local backend:

```js
const ENV = {
  BACKEND_URL: "http://localhost:3000",
};
```

Then simply open `frontend/index.html` in your browser — no build step required.

## Environment Variables

| Service | Variable | Description |
|---------|----------|-------------|
| **python-service** | `GITHUB_TOKEN` | GitHub PAT for repo ingestion |
| **python-service** | `GROQ_API_KEY` | Groq API key for LLM calls |
| **node-backend** | `AI_SERVICE_URL` | URL of the Python AI service |
| **frontend** | `BACKEND_URL` (in `env.js`) | URL of the Node.js backend |

## Limitations

- Works best for repos under 500 files
- Large repos (Go, Linux kernel, etc.) will timeout
- V2 will handle large repos
