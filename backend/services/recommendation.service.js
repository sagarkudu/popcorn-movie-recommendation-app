import { createEmbedding } from "./embedding.service.js";
import { findSimilarMovies } from "./movie.service.js";
import { openai } from "../config/openai.js";

export async function recommendMovie({ favorite, era, mood }) {
  const query = `
Favorite movie:
${favorite}

Movie preference:
${era}

Mood:
${mood}
`;

  console.log("\nUser query:");
  console.log(query);

  // 1. Convert user preferences into embedding
  const embedding = await createEmbedding(query);

  // 2. Find semantically similar movies
  const movies = await findSimilarMovies(embedding);

  console.log("\nRetrieved movies:");
  console.table(
    movies.map((movie) => ({
      title: movie.title,
      similarity: movie.similarity,
    })),
  );

  if (!movies || movies.length === 0) {
    return {
      title: "No recommendation found",
      releaseYear: "",
      description:
        "I couldn't find a suitable movie based on your preferences.",
    };
  }

  // 3. Give the candidate movies to OpenAI
  const movieContext = movies
    .map(
      (movie, index) => `
Movie ${index + 1}:
Title: ${movie.title}
Similarity: ${movie.similarity}
Description:
${movie.content}
`,
    )
    .join("\n");

  // 4. Ask OpenAI to select ONE movie
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
You are a movie recommendation assistant.

You will receive:
1. A user's movie preferences.
2. A list of movies retrieved from a movie database.

Choose exactly ONE movie from the provided movies.

Do NOT invent a movie.
Do NOT recommend a movie that is not in the provided list.

Return JSON with exactly these fields:

{
  "title": "movie title",
  "releaseYear": "year",
  "description": "short explanation of why this movie matches the user's preferences"
}
`,
      },
      {
        role: "user",
        content: `
User preferences:

${query}

Retrieved movies:

${movieContext}
`,
      },
    ],
  });

  const recommendation = JSON.parse(response.choices[0].message.content);

  return recommendation;
}
