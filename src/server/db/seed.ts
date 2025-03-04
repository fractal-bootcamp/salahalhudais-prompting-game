import { db } from "~/server/db";
import { gameImages } from "~/server/db/schema";

const initialGameImages = [
  {
    imagePath: "/game-images/PersonOverseeingEarth.webp",
    originalPrompt: "A person smiling from the far away distance of the galaxies at a globe, watching children play in a park within the globe. The person has warm eyes and a touching smile, surrounded by golden, majestic colors amidst dark space. Their connection to Earth appears deep and paternal.",
    difficulty: 2,
  },
  {
    imagePath: "/game-images/kidSmilingAtGlobe.jpeg",
    originalPrompt: "A young child with an innocent expression gazing at a glowing globe, their face lit up with wonder and curiosity. The scene captures childhood amazement at discovering the world.",
    difficulty: 3,
  },
  {
    imagePath: "/game-images/MaturePersonLookingAtGlobal.jpeg",
    originalPrompt: "A mature person contemplating a holographic global display, their experienced face reflecting wisdom and concern for the world. The lighting creates a dramatic atmosphere suggesting deep reflection on global matters.",
    difficulty: 4,
  },
];

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing game images
    await db.delete(gameImages);
    console.log("🗑️  Cleared existing game images");

    // Insert game images
    for (const image of initialGameImages) {
      await db.insert(gameImages).values({
        imagePath: image.imagePath,
        originalPrompt: image.originalPrompt,
        difficulty: image.difficulty,
        active: true,
      });
    }

    console.log("✅ Seed completed successfully");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  }
}

// Run the seed function
void seed(); 