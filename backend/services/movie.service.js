import { supabase } from "../config/supabase.js";

export async function findSimilarMovies(embedding) {
  const { data, error } = await supabase.rpc("match_movies", {
    query_embedding: embedding,
    match_threshold: 0.0,
    match_count: 5,
  });

  if (error) {
    console.error("Movie search error:", error);
    throw error;
  }

  return data;
}