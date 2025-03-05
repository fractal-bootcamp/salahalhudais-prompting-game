import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { gameImages } from "~/server/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get difficulty filter from query params
    const { searchParams } = new URL(req.url);
    const difficultyFilter = searchParams.get('difficulty');
    
    // Set up filter conditions based on difficulty
    let conditions = eq(gameImages.active, true);
    
    if (difficultyFilter) {
      switch (difficultyFilter) {
        case 'easy':
          // Easy: difficulty 1-3
          conditions = and(
            conditions,
            lt(gameImages.difficulty, 4)
          );
          break;
        case 'medium':
          // Medium: difficulty 4-7
          conditions = and(
            conditions,
            gte(gameImages.difficulty, 4),
            lt(gameImages.difficulty, 8)
          );
          break;
        case 'hard':
          // Hard: difficulty 8-10
          conditions = and(
            conditions,
            gte(gameImages.difficulty, 8)
          );
          break;
      }
    }

    const images = await db.select()
      .from(gameImages)
      .where(conditions);

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No game images found" },
        { status: 404 }
      );
    }

    // Select a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    const randomImage = images[randomIndex];
    if (!randomImage) {
      return NextResponse.json(
        { error: "Failed to select a random image" },
        { status: 500 }
      );
    }

    // Ensure targetWords is an array
    const targetWords = Array.isArray(randomImage.targetWords) 
      ? randomImage.targetWords 
      : [];

    // Return the image data
    return NextResponse.json({
      id: randomImage.id,
      imagePath: randomImage.imagePath,
      difficulty: randomImage.difficulty,
      targetWords: targetWords,
    });
  } catch (error) {
    console.error("Error fetching random game image:", error);
    return NextResponse.json(
      { error: "Failed to fetch random game image" },
      { status: 500 }
    );
  }
} 