import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { gameImages } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get all active game images
    const images = await db.select()
      .from(gameImages)
      .where(eq(gameImages.active, true));

    // If no images found, return error
    if (images.length === 0) {
      return NextResponse.json(
        { error: "No game images found" },
        { status: 404 }
      );
    }

    // Select a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    const randomImage = images[randomIndex];

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