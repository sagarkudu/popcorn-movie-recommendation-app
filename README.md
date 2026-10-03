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
