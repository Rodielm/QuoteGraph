# QuoteGraph

> **Explore ideas, not just quotes.**

QuoteGraph is a knowledge graph platform that helps users discover quotes, explore relationships between ideas, organize personal collections, and build their own knowledge network.

Instead of displaying isolated quotes, QuoteGraph connects authors, books, topics, and personal reflections through an interactive graph powered by **Neo4j**.

---

# Vision

Most quote applications are static databases where users search, read, and leave.

QuoteGraph aims to transform quotes into an interconnected knowledge network.

A quote is not only text.

A quote can be connected to:

* its author
* the original book
* philosophical movements
* topics
* similar ideas
* opposing ideas
* personal reflections
* user collections

The objective is to encourage exploration and learning through relationships.

---

# Example

```text
Marcus Aurelius
        │
        │ WROTE
        ▼
"The happiness of your life depends
upon the quality of your thoughts."
        │
        ├─────────────► Stoicism
        │
        ├─────────────► Meditations
        │
        ├─────────────► Discipline
        │
        ├─────────────► Virtue
        │
        └─────────────► Related Quotes
```

---

# Features (MVP)

* User authentication
* Explore quotes
* Search by text
* Browse authors
* Browse books
* Browse topics
* Interactive knowledge graph
* Favorite quotes
* Personal collections
* Personal reflections
* Related quotes
* Admin panel for managing content

---

# Future Features

* Quote recommendations
* Similar authors
* Influence graph
* Contradicting ideas
* Community collections
* Import datasets
* Public API
* Graph analytics
* Multi-language support
* Social sharing

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Zustand
* React Router
* Tailwind CSS
* shadcn/ui
* Cytoscape.js

---

## Backend

* Python
* FastAPI
* Pydantic
* Neo4j Python Driver
* JWT Authentication

---

## Database

* Neo4j Community Edition

---

## DevOps

* Docker
* Docker Compose
* GitHub Actions

---

# Project Structure

```text
quotegraph/

├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layouts/
│       │   ├── providers/
│       │   ├── router/
│       │   └── App.tsx
│       │
│       ├── features/
│       │   ├── auth/
│       │   ├── authors/
│       │   ├── books/
│       │   ├── collections/
│       │   ├── graph/
│       │   ├── quotes/
│       │   ├── reflections/
│       │   └── topics/
│       │
│       ├── shared/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── services/
│       │   ├── types/
│       │   └── utils/
│       │
│       ├── assets/
│       ├── styles/
│       └── main.tsx
│
├── backend/
│   └── app/
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── logging.py
│       │   └── security.py
│       │
│       ├── shared/
│       │   ├── exceptions.py
│       │   ├── pagination.py
│       │   ├── responses.py
│       │   └── utils.py
│       │
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── authors/
│       │   ├── books/
│       │   ├── collections/
│       │   ├── graph/
│       │   ├── quotes/
│       │   ├── reflections/
│       │   └── topics/
│       │
│       ├── api/
│       │   └── router.py
│       │
│       ├── dependencies.py
│       └── main.py
│
├── database/
│   ├── cypher/
│   ├── imports/
│   └── seeds/
│
├── docker/
│
├── docs/
│
├── docker-compose.yml
│
└── README.md
```

---

# Knowledge Graph Model

## Nodes

```text
User
Author
Quote
Book
Topic
Collection
Reflection
```

## Relationships

```text
(:Author)-[:WROTE]->(:Quote)

(:Quote)-[:APPEARS_IN]->(:Book)

(:Quote)-[:HAS_TOPIC]->(:Topic)

(:Quote)-[:SIMILAR_TO]->(:Quote)

(:Quote)-[:CONTRADICTS]->(:Quote)

(:Quote)-[:EXPANDS_ON]->(:Quote)

(:User)-[:SAVED]->(:Quote)

(:User)-[:CREATED]->(:Collection)

(:Collection)-[:CONTAINS]->(:Quote)

(:User)-[:WROTE]->(:Reflection)

(:Reflection)-[:ABOUT]->(:Quote)
```

---

# Why Neo4j?

Traditional relational databases are excellent for CRUD operations.

QuoteGraph focuses on exploring relationships between ideas.

Examples:

* Find similar quotes.
* Discover authors connected through common topics.
* Explore philosophical influences.
* Navigate from one idea to another.
* Recommend quotes based on relationships.

These graph traversals are naturally modeled using Neo4j.

---

# Architecture

```text
React
      │
      ▼
FastAPI REST API
      │
      ▼
Neo4j
```

---

# Design Principles

* Feature-first architecture
* Clean Architecture
* SOLID principles
* Repository Pattern
* Service Layer
* Stateless REST API
* JWT Authentication
* Responsive UI
* Accessibility-first

---

# Roadmap

## Phase 1

* Repository setup
* Docker Compose
* Neo4j Community
* FastAPI
* React
* Authentication

---

## Phase 2

* Authors
* Books
* Topics
* Quotes
* CRUD
* Search

---

## Phase 3

* Interactive knowledge graph
* Related quotes
* Similar authors
* Graph navigation

---

## Phase 4

* Favorites
* Collections
* Reflections
* User profile

---

## Phase 5

* Performance improvements
* Testing
* Documentation
* CI/CD
* Deployment

---

# Local Development

## Requirements

* Docker & Docker Compose
* [uv](https://docs.astral.sh/uv/) (Python dependency manager)
* Node.js 20+

---

## Run everything with Docker Compose

```bash
docker compose up -d
```

* Frontend → http://localhost:5173
* Backend → http://localhost:8000/health
* Neo4j Browser → http://localhost:7474 (user: `neo4j`, password: `quotegraph123`)

Stop everything:

```bash
docker compose down
```

---

## Backend (without Docker)

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

* `uv sync` — install dependencies from `uv.lock`
* `uv add <package>` — add a new dependency
* `uv run <command>` — run a command inside the project's virtualenv

### VS Code setup

`uv sync` creates the virtualenv at `backend/.venv`. Open the **repository root** as the workspace, then:

1. `Cmd/Ctrl+Shift+P` → **Python: Select Interpreter**
2. Pick `backend/.venv/bin/python`

This is already preconfigured in `.vscode/settings.json`, so VS Code should pick it up automatically — new integrated terminals will auto-activate the venv.

To activate it manually in any terminal:

```bash
cd backend
source .venv/bin/activate
```

---

## Frontend (without Docker)

```bash
cd frontend
npm install
npm run dev
```

---

# Goals

The purpose of this project is to:

* Learn graph databases.
* Build a modern full-stack application.
* Explore knowledge graph concepts.
* Practice software architecture.
* Create a portfolio-quality project.

---

# License

MIT License
