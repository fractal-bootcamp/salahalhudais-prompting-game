import { NextRequest, NextResponse } from "next/server";
import { calculateWordSimilarity, calculateRank } from "~/lib/wordEmbeddings";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { targetWords, guessWords } = body;

    // Validate input
    if (!Array.isArray(targetWords) || !Array.isArray(guessWords)) {
      return NextResponse.json(
        { error: "targetWords and guessWords must be arrays" },
        { status: 400 }
      );
    }

    // Calculate similarity (now async)
    // This will run on the server side, so OpenAI API can be used if available
    const { similarity, rank, wordSimilarities } = await calculateWordSimilarity(targetWords, guessWords);

    // Return result with per-word similarities
    return NextResponse.json({
      similarity: Number(similarity.toFixed(2)),
      rank,
      wordSimilarities
    });
  } catch (error) {
    console.error("Error calculating word similarity:", error);
    return NextResponse.json(
      { error: "Failed to calculate similarity" },
      { status: 500 }
    );
  }
} 