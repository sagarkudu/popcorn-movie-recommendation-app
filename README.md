### ✨ Project Features

- 🎬 **AI Movie Recommendations** — Personalized recommendations based on user preferences.
- 🔎 **Semantic Search** — Finds movies using meaning, not just keyword matching.
- 🧠 **RAG Pipeline** — Combines vector retrieval with an LLM for better recommendations.
- 📚 **Movie Knowledge Base** — Movie data stored as embeddings in Supabase pgvector.
- ⚡ **Fast Retrieval** — Retrieves the most relevant movie candidates using vector similarity.
- 🤖 **AI-Powered Selection** — LLM selects the best candidate and explains why it matches.
- 📱 **Responsive UI** — Works across mobile, tablet, and desktop.
- 🔐 **Secure Backend** — API keys and Supabase credentials remain server-side.

### Flow

- RAG-based movie recommendation system using OpenAI embeddings and Supabase pgvector.

- During ingestion, I parse each movie into an individual document containing its title and description, generate a 1536-dimensional embedding using text-embedding-3-small, and store the document and vector in Supabase.

- When a user submits their favorite movie, preferred movie type, and mood, I combine those inputs into a query and generate its embedding using the same embedding model.

- I then perform a vector similarity search in Supabase using pgvector and retrieve the top five relevant movies. Those retrieved candidates are passed to an LLM, which selects exactly one movie from the retrieved context and generates a structured recommendation with the title, release year, and explanation.

- The backend returns that JSON response to the React frontend.

> React → Express → Query Embedding → Supabase pgvector → Top-K Movies → LLM → JSON Recommendation → React

#### Architecture
                    Browser
                       │
                       │ answers
                       ▼
               React Frontend
                       │
                       │ POST /api/recommend
                       ▼
               Node.js Backend
                  /          \
                 /            \
                ▼              ▼
           OpenAI API      Supabase
           Embeddings      pgvector
                              │
                              ▼
                         Movie database

#### Step by Step Flow
3 user answers
↓
Node.js backend
↓
Create ONE combined text
↓
OpenAI Embedding
↓
Embedding vector
↓
Supabase pgvector
↓
Find semantically similar movies
↓
Top candidate movies
↓
OpenAI
↓
Select ONE movie + explanation
↓
React result screen

### Tech Stack

Frontend
────────
React
Vite
React Router
CSS

Backend
───────
Node.js
Express

AI
──
OpenAI
text-embedding-3-small
LLM / Chat Completions

Vector Database
───────────────
Supabase
PostgreSQL
pgvector

RAG
───
Embedding
Semantic Search
Top-K Retrieval
LLM Generation
