import { NextRequest, NextResponse } from "next/server";
import { calculateWordSimilarity, calculateRank } from "~/lib/wordEmbeddings";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json() as { guess: string, targetWords: string[] };
    const userGuess = body.guess?.trim() || "";
    const targetWords = body.targetWords || [];

    // Validate input
    if (!Array.isArray(targetWords)) {
      return NextResponse.json(
        { error: "targetWords must be an array" },
        { status: 400 }
      );
    }

    // Validate that userGuess is not empty
    if (!userGuess) {
      return NextResponse.json(
        { 
          similarity: 0, 
          rank: "Very Low", 
          wordSimilarities: [] 
        }
      );
    }

    // Filter out any empty target words
    const validTargetWords = targetWords.filter(word => word && word.trim() !== "");
    
    // If no valid target words, return zero similarity
    if (validTargetWords.length === 0) {
      return NextResponse.json(
        { 
          similarity: 0, 
          rank: "Very Low", 
          wordSimilarities: [] 
        }
      );
    }

    // Split the guess into words
    const guessWords = userGuess.toLowerCase().split(/\s+/);

    // Calculate similarity (now async)
    const { similarity, rank, wordSimilarities } = await calculateWordSimilarity(validTargetWords, guessWords);

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