import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import json
import os
from dotenv import load_dotenv
from github import Github, Auth
import base64
from openai import OpenAI

load_dotenv()

# github stuffs
auth = Auth.Token(os.getenv("GITHUB_TOKEN"))
g = Github(auth=auth)

# llm_stuffs
API = os.getenv("GROQ_API_KEY")
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
URL = "https://api.groq.com/openai/v1"

client = OpenAI(
    api_key=API,
    base_url=URL,
)


app = FastAPI()


class Workflow(BaseModel):
    repoUrl: str


def extract_repo(url: str):
    url = url.replace("http://", "").replace("https://", "")
    parts = url.split("/")
    owner = parts[1]
    repo_name = parts[2]
    repo = g.get_repo(f"{owner}/{repo_name}")
    return repo


def get_readme_content(url: str) -> str:
    repo = extract_repo(url)
    readme_content = base64.b64decode(repo.get_readme().content).decode("utf-8")
    return readme_content


def get_tree_content(url: str) -> list:
    repo = extract_repo(url)
    tree = repo.get_git_tree(repo.default_branch, recursive=True)

    all_contents = []

    MAX_FILES = 15
    MAX_CHARS_PER_FILE = 800
    total_chars = 0

    for item in tree.tree:
        if item.type != "blob":  # skiping non-file stuffs
            continue

        # skipping binary files
        if any(
            item.path.endswith(ext) for ext in [".png", ".jpg", ".ico", ".pdf", ".docx"]
        ):
            continue

        # skipping lock files
        if "lock" in item.path:
            continue

        f = repo.get_contents(item.path)
        text = base64.b64decode(f.content).decode("utf-8", errors="replace")

        all_contents.append(f"FILE: {item.path}\n{text[:MAX_CHARS_PER_FILE]}\n")

    return all_contents


def call_llm(full_input):
    prompt = f"""You are analyzing a GitHub repository.

    INPUT:
    {full_input}

    TASK:
    Generate a summary and README based ONLY on the code and README provided.

    OUTPUT FORMAT (strict JSON):
    {{
    "summary": "string (2-3 sentences describing what this project does and its main purpose)",
    "readme": "string (markdown with: # Project Name, ## Description, ## Setup/Installation, ## Usage)",
    "improvements": ["string", "string", "string"]
    }}

    RULES:
    - summary: plain text only, no markdown
    - readme: valid markdown, start with H1 title
    - base everything on actual code, don't invent features
    - if something is unclear, state "unclear from code" """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    return response.choices[0].message.content


@app.post("/workflow")
async def workflow(request: Workflow):
    url = request.repoUrl
    readme_contents = get_readme_content(url)
    tree_contents = get_tree_content(url)

    if not tree_contents:
        return {"error": "No readable files found"}

    # merging both
    readme_section = f"README.md:\n{readme_contents}\n\n"
    code_section = "CODE_FILE:\n" + "\n".join(tree_contents)
    full_input = readme_section + code_section

    response = call_llm(full_input)
    

    return json.loads(response)
