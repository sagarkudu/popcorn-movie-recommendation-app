import { recommendMovie as generateRecommendation } from "../services/recommendation.service.js";

export async function recommendMovie(req, res) {
  try {
    const { favorite, era, mood } = req.body;

    if (!favorite || !era || !mood) {
      return res.status(400).json({
        success: false,
        message: "All three questions are required",
      });
    }

    const movie = await generateRecommendation({
      favorite,
      era,
      mood,
    });

    return res.json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate recommendation",
    });
  }
}
