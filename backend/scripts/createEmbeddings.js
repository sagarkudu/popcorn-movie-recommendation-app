import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --------------------------------------------------
// 1. Load environment variables
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing");
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is missing");
}

// --------------------------------------------------
// 2. Initialize OpenAI
// --------------------------------------------------

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --------------------------------------------------
// 3. Initialize Supabase
// --------------------------------------------------

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

// --------------------------------------------------
// 4. Read movies.txt
// --------------------------------------------------

const moviesPath = path.resolve(__dirname, "../movies.txt");

console.log("Reading movies from:");
console.log(moviesPath);

const movies = readFileSync(moviesPath, "utf8");

console.log(`Movie file size: ${movies.length} characters`);

// --------------------------------------------------
// 5. Split movies into individual movie documents
// --------------------------------------------------

function splitMovies(document) {
  return document
    .split(/\n\s*\n/)
    .map((movie) => movie.trim())
    .filter(Boolean);
}

// --------------------------------------------------
// 6. Create embeddings and store in Supabase
// --------------------------------------------------

async function createAndStoreEmbeddings() {
  const movieDocuments = splitMovies(movies);

  console.log(`Found ${movieDocuments.length} movies`);

  const data = [];

  for (let i = 0; i < movieDocuments.length; i++) {
    const movie = movieDocuments[i];

    // First line contains:
    // Oppenheimer: 2023 | R | 3h | 8.6 rating
    const firstLine = movie.split("\n")[0];

    // Extract title before the first ":"
    const title = firstLine.split(":")[0].trim();

    console.log(
      `Creating embedding ${i + 1}/${movieDocuments.length}: ${title}`,
    );

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: movie,
    });

    const embedding = embeddingResponse.data[0].embedding;

    data.push({
      title,
      content: movie,
      embedding,
    });
  }

  console.log(`\nCreated ${data.length} embeddings`);

  // ------------------------------------------------
  // 7. Insert into Supabase
  // ------------------------------------------------

  const { data: insertedData, error } = await supabase
    .from("movies")
    .insert(data)
    .select();

  if (error) {
    console.error("\nSupabase insert error:");
    console.error(error);
    throw error;
  }

  console.log(`\nInserted ${insertedData.length} rows into Supabase!`);
  console.log("Embedding complete and saved in Supabase!");
}

// --------------------------------------------------
// 8. Run
// --------------------------------------------------

createAndStoreEmbeddings().catch((error) => {
  console.error("\nEmbedding process failed:");
  console.error(error);
});