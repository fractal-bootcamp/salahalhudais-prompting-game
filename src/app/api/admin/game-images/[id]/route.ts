import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { gameImages } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real app, you'd check if the user has admin role
    // For now, we'll just check if they're authenticated

    // Parse request body
    const body = await req.json();
    const { targetWords } = body;

    // Validate input
    if (!Array.isArray(targetWords)) {
      return NextResponse.json(
        { error: "targetWords must be an array" },
        { status: 400 }
      );
    }

    // Update the game image
    const imageId = parseInt(params.id);
    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      );
    }

    await db.update(gameImages)
      .set({ targetWords })
      .where(eq(gameImages.id, imageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating game image:", error);
    return NextResponse.json(
      { error: "Failed to update game image" },
      { status: 500 }
    );
  }
} 