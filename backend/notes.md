- Embeddings is just a numerical snaphot of data.
- The word, sentence or even entire document can be reduced into vector.

Get Text to series of number
Using openai has incredibly smart embedding model that creates text embedding.
data -> text_embedding_model -> vector embedding.

Creating Embedding
send text to api embedding endpoint along with which model to use.

const response = await openai.embeddings.create({
model: "text-embedding-3-small",
input: "Hello, world!",
});

const embedding = response.data[0].embedding;

console.log("Embedding:", embedding);
console.log("Dimensions:", embedding.length);

By default, the length of the embedding vector is 1536 for text-embedding-3-small or 3072 for text-embedding-3-large.

e.g The vector representation of word 'Hello World'
Embedding: [
-0.0191497802734375, -0.0251922607421875, -0.0017795562744140625,
Dimensions: 1536

- These vectors

2. Pair Text with Embeddings

- The pair text with embeddings means storing embedding for each item in an array.

```
const content = [
  "Beyond Mars: speculating life on distant planets.",          -> Embedding 1
  "Jazz under stars: a night in New Orleans' music scene.",     -> Embedding 2
  "Mysteries of the deep: exploring uncharted ocean caves.",    -> Embedding 3
]
```

For each text chunk or string in array we will make an API call to OpenAI sending current text chunk to get its vector embedding. Once the API call completes we will construct a new object for each text chunks and its embeddings.

```

const content = [
  "Beyond Mars: speculating life on distant planets.",
  "Jazz under stars: a night in New Orleans' music scene.",
  "Mysteries of the deep: exploring uncharted ocean caves.",
];

async function main(input) {
  input.map( async(textChunk) => {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: textChunk,
    });
    const data = { content: textChunk, embedding: embeddingResponse.data[0].embedding }
    console.log(data);
  })
}
main(content);
```

output: we will get separate embedding for each item in an array.

```
{
  content: 'Beyond Mars: speculating life on distant planets.',
  embedding: [
       -0.0191497802734375,    -0.0251922607421875, -0.0017795562744140625,
         0.018829345703125,     -0.033843994140625,    -0.0197296142578125,
```

Since I am dealing asynchronous task like fetching Embeddings for all different strings, I will take advantage of `Promise.all()` to collectively await for all the async tasks to resolve then fulfilled before any code execution continues. So I will move all code inside Promise.all() method

```

async function main(input) {
  await Promise.all(
    input.map( async(textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: textChunk,
        });
        const data = { content: textChunk, embedding: embeddingResponse.data[0].embedding }
        console.log(data);
    })
  );
  console.log('Embedding complete!');
}
main(content);
```

Now Considering their massive size how can we efficiently store and retrieve these Large vectors? Use Vector Database like Supabase, Quadrant, Pinecone etc.

## 3. Vector Databases

Vector databases have the capacity to store and retrieve embeddings quickly and at scale.

- Well, Embeddings essentially allow us to match content to a question unlike traditional databases that search for exact values matches in a rows.
- Vector DB are powered by complex algorithms that store, search and quickly idenfies the vectors. So instead of looking exact matches they use a similarity metrics that uses all of the information vectors provide about the meaning of the words and phrases to find the vectors most similar to given query.

Benefits of storing embeddings:

1. Users can interact with and recieve responses exclusively from your own content.
2. Get complete control over your data it remains relevant and up-to-date.
3. It helps to reduce API calls and token usage.
4. It allows to get summarization and store chat histories which help to maintain long term memory.
5. It helps to reduce hallucination with AI models.
   E.g Chroma, pinecone, supabase, quadrant etc

Supabase:

- Full fledged open source databased backend platform that offers a PostGreSQL database which is free and open source recognized for its stability and advanced capabilities while postgres is not a dedicated vector database.
- Supabase support a powerful Postgres extension called `pgVector` for storing embedding and performing vector similarity searches.

- Enable `pgvector` extension in supabase to store index and query vector embeddings.
- Project settings -> API Section -> copy project url and api_keys

SUPABASE_URL=https://ewmgswatgkmgceplliah.supabase.co
SUPABASE_API_KEY=eyJxxxxxxxx

- create new table to store

```
create table documents (
  id bigserial primary key, --here bigserial means auto incrementing integer.
  content text, -- corresponds to the "text chunk"
  embedding vector(1536) -- 1536 works for OpenAI embeddings
);
```

- Go to Table Editor menu -> you should new table called `documents`

- install supabase
  npm i @supabase/supabase-js

Storing in supabase

```
// Insert content and embedding into Supabase
await supabase.from('documents').insert(data);
```

Note: Here we are passing table name called `documents` and we need to pass exact column e.g it is chunk and embedding

```
create table documents (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding vector(1536) -- 1536 works for OpenAI embeddings
);
```

Next we will see how to put these embeddings to work using `semantic` and `simalarity` search.

## Semantic Search

- We can teach that phrases one and three are the same, while phrase 2 is entirely different.
- You know these embeddings are stored in a vector DB which measures the similarity between a question or `query` vector and potential `responses`.
- So if we ask the database to match the vector representing a question like, how would you describe the relationship between humans and the pups?
  -> It would likely identify the embedding for dogs are loyal companions or canines are faithful friends. At its core, that is how many AI powered chatbots and apps actually think and are able to form responses.
  This brings us to concept of semantic search, where AI use power of embeddings and vector database to search for information in a way that mimics human understand of natural language focusing on meaning.
- Semantic search goes beyond goes matching keywords. By harnessing embeddings, this approach analyzes the intent, context, and semantics of your query providing the results that are aligned to your expectations.

## Query Embeddings using Similarity Search

- We will explore how specific search algorithms compute similarity scores between embeddings to identify the most relevant results.
- Earlier we create each embeddings using string in podcast array and store all in corresponding text chunks in a supabase database table called `documents`

- To perform simarlity search we first need `users query` and we will share to openai to convert into embeddings using `openai.embeddings.create`

```
  // Create a vector embedding representing the input text
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });

  // The vector generated by OpenAI
  const embedding = embeddingResponse.data[0].embedding;
```

- To find a similar match and retreive corresponding text, we need to create a special function and one of popular data algorithm in data science and ML for measuring the similarity between two vectors is called `cosine similarity`

The function `match_documents` find and retrieve content from `documents` table based on embeddings similar to provided query vector.

```
-- Create a function to search for documents
create or replace function match_documents (
query_embedding vector(1536),
match_threshold float,
match_count int
)
returns table (
id bigint,
content text,
similarity float
)
language sql stable
as $$
select
  documents.id, -- here documents is a table name
  documents.content,
  1 - (documents.embedding <=> query_embedding) as similarity
from documents
where 1 - (documents.embedding <=> query_embedding) > match_threshold
order by similarity desc
limit match_count;
$$;
```

Supabase provide a special method called `rpc()` or remote procedure call that lets you call functions in your postgres database like match_documents in your code.

```
import { openai, supabase } from './config.js';

// User query about podcasts
const query = "Training puppies";
main(query);

async function main(input) {
  // Create a vector embedding representing the input text
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });

  // The vector generated by OpenAI
  const embedding = embeddingResponse.data[0].embedding;

  // Query Supabase for nearest vector match
  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.50,
    match_count: 1
  });
  console.log(data[0].content, data[0].similarity);
}
```

## Create a conversation response using OpenAI

- So far we are only returning the exact matching text chunk from the database.
  For eg `A query like something peaceful and relaxing` returns the sound scape of silence.

The above is fine if you are just searching podcast titles and descriptions. We can elevate this experience and make more enganing.

- We can achieve more dynamic and conversation response by sending the matched text to OpenAI chat completions endpoints and instructing the model to formulate a specific answer

- 1. we have a dedicated function `createEmbedding` which sends text input to openai and fetching back an embedding vector.

2. fetching relevant content from supabase database based on provided embeddings.
3. bring all functions together

```
import { openai, supabase } from './config.js';

// User query about podcasts
const query = "episode that elon musk can enjoy";
main(query);

// Bring all function calls together
async function main(input) {
  const embedding = await createEmbeding(input);
  const match = await findNearestMatch(embedding);
  await getChatCompletion(match, input);
}

// Create an embedding vector representing the input text
async function createEmbeding(input) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input
  });
  return embeddingResponse.data[0].embedding;
}

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.50,
    match_count: 1
  });
  return data[0].content;
}

// Use OpenAI to make the response conversational
const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`
}];

async function getChatCompletion(text, query) {
  chatMessages.push({
    role: 'user',
    content: `Context: ${text} Question: ${query}`
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: chatMessages,
    temperature: 0.5,
    frequency_penalty: 0.5
  });

  console.log(response.choices[0].message.content);
}
```

## Chunking Text from Documents.

- When creating embedding from Large Text documents, it is beneficial to first break into the smaller chunks (chunk 1, chunk 2...final chunk)
  This ensures AI model can effectively capture and understand context and give more accurate results.
- Smaller text chunks ensures we stay within these boundaries
  e.g The openai model `text-embedding-ada-002` accepts a maximum of 8191 tokens equivalent to roughly 5000 english words

Sample `podcast.txt` contains various aspects from the episode's title, date, duration and we will generate smaller chunks from this file.

- This will not only exceed token limit but also when you extract embeddings from long passage of text to effective smaller chunks

#### Before Effective Smaller chunks

- ensure content is free from unnecessary or irrelevant information.
- remove HTML tags, characters, or symbols that can affect your embeddings.
- remove typos
- remove any repeated text and standarized your text formatting.
- we can use `langchain` library for chunking text

## Langchain

- `Langchain` is most popular frameworks for developing AI powered apps and it includes incredibly useful tools for splitting text called `CharacterTextSplitter` which splits based on `characters` and measures `chunk length` by number of characters.
  Install using
  `npm install langchain @langchain/core`
  `npm install @langchain/openai`
  `npm install @langchain/textsplitters`

🔹 1. Character Text Splitter
Breaks long text into smaller chunks based on a fixed number of characters.
Example: If you set chunk size = 100, the text is cut into 100-character pieces.
Simple, but sometimes it cuts in the middle of words or sentences.

🔹2. Recursive Character Text Splitter
Works smarter: tries to split text at natural boundaries (paragraphs→sentences → words → characters).
If it can’t split at a higher level (like paragraph), it moves to the next lower level (like sentence).
Produces chunks that are cleaner and easier for LLMs to understand.

Summary==> CharacterTextSplitter = fast but rough, while RecursiveCharacterTextSplitter = smart and structured.

E.g CharacterTextSplitter
https://docs.langchain.com/oss/javascript/integrations/splitters/character_text_splitter

ChunkSize: 150

- Each chunk of text will roughly contain 150 characters

chunkOverlap: 3

- With chunkOverlap you can set whether there should be any overlapping characters between adjacent chunks. This is optional.
- creating some overlap between chunks helps make sure that semantic context does not get loose between chunks.
- Keep overlap of around `10 percent` of Chunksize, so set here chunkOverlap size to 15 characters, it means when one chunks ends the next chunk will start fifteen characters before the previous chunks ends.
- In this we can preserve the continuonity of positiviy in chunks.

### RecursiveCharacterTextSplitter

- It splits text into chunks based on default of separators ` ["\n\n", "\n", " ", ""]`, trying to keep sentences, paragraphs and words together as much as possible based on provided chunk size and overlap.
- The recursive character text splitter the text into optimal chunk sizes.
- if the initial split does not produce the desired size or structure it repeatedly or recursively calls itself using a different separator that might produce better results and it does until it reaches the desired size.
- This is why recursive character text splitter is recommended for generic text.
- Optimize for the smallest size without losing the context by tweaking chunkSize and chunkOverlap.

```
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFileSync } from "fs";

const podcasts = readFileSync("podcasts.txt", "utf8");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 150,
  chunkOverlap: 15,
});

const documents = await splitter.createDocuments([podcasts]);

console.log("Total documents:", documents.length);
console.log(documents);
```

#### Challenge

> Challenge: Text Splitters, Embeddings, and Vector Databases!

    1. Use LangChain to split the content in movies.txt into smaller chunks.
    2. Use OpenAI's Embedding model to create an embedding for each chunk.
    3. Insert all text chunks and their corresponding embedding
       into a Supabase database table.

Solution:

2.1 create movie database

-- Create a table to store movie text and embeddings.
```
create table movies(
    id bigserial primary key,
    content text,
    embedding vector(1536)
)
```

-- create a function to search for movies
create or replace function match_movies(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
returns table (
    id bigint,
    content text,
    similarity float
)
language sql stable
as $$ 
  select
    movies.id,
    movies.content,
    1 - (movie.embedding <=> query_embedding) as similarity
  from movies
  where 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$

```
import { openai, supabase } from "./config.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFileSync } from "fs";

const movies = readFileSync("movies.txt", "utf8");

// 1. Split movies.txt into text chunks.
async function splitDocument(document) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 20,
  });
  const chunks = await splitter.createDocuments([document]);
  return chunks;
}

// 2. create an embedding from each text chunk and store in supabase
async function createAndStoreEmbedding() {
  const chunks = await splitDocument(movies);

  const data = await Promise.all(
    chunks.map(async (chunk) => {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.pageContent,
      });
      return {
        content: chunk.pageContent,
        embedding: embeddingResponse.data[0].embedding,
      };
    }),
  );

  // console.log(data);
  //3. store in supabase
  await supabase.from("movies").insert(data);
  console.log("Embedding complete and saved in supabase!");
}

createAndStoreEmbedding();
```

#### Challenge: Display Multiple movies and combine in one string

```
import { openai, supabase } from './config.js';

// Query about our movie data
const query = "The movie with that actor from Castaway";
main(query);

async function main(input) {
  try {
    const embedding = await createEmbedding(input);
    const match = await findNearestMatch(embedding);
    await getChatCompletion(match, input);      
  } catch (error) {
     console.error('Error in main function.', error);
  }
}

// Create an embedding vector representing the query
async function createEmbedding(input) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input
  });
  return embeddingResponse.data[0].embedding;
}

/*
  Challenge: Return and manage multiple matches
    - Return at least 3 matches from the database table
    - Combine all of the matching text into 1 string
*/

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc('match_movies', {
    query_embedding: embedding,
    match_threshold: 0.50,
    match_count: 4
  });
  
  // Manage multiple returned matches
  const match = data.map(obj => obj.content).join('\n');
  return match;
}

// Use OpenAI to make the response conversational
const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.` 
}];

async function getChatCompletion(text, query) {
  chatMessages.push({
    role: 'user',
    content: `Context: ${text} Question: ${query}`
  });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: chatMessages,
    temperature: 0.5,
    frequency_penalty: 0.5
  });
  console.log(response.choices[0].message.content);
} 
```