import { db } from "~/server/db";
import { gameImages } from "~/server/db/schema";
import fs from 'fs';
import path from 'path';

const initialGameImages = [
  {
    imagePath: "/game-images/PersonOverseeingEarth.webp",
    originalPrompt: "A person smiling from the far away distance of the galaxies at a globe, watching children play in a park within the globe. The person has warm eyes and a touching smile, surrounded by golden, majestic colors amidst dark space. Their connection to Earth appears deep and paternal.",
    difficulty: 2,
    targetWords: ["watchful", "guardian"],
    active: true
  },
  {
    imagePath: "/game-images/kidSmilingAtGlobe.jpeg",
    originalPrompt: "A young child with an innocent expression gazing at a glowing globe, their face lit up with wonder and curiosity. The scene captures childhood amazement at discovering the world.",
    difficulty: 3,
    targetWords: ["innocent", "curious"],
    active: true
  },
  {
    imagePath: "/game-images/MaturePersonLookingAtGlobal.jpeg",
    originalPrompt: "A mature person contemplating a holographic global display, their experienced face reflecting wisdom and concern for the world. The lighting creates a dramatic atmosphere suggesting deep reflection on global matters.",
    difficulty: 5,
    targetWords: ["wise", "concerned"],
    active: true
  },
];

// Try to load generated images if the file exists
let generatedImages: Array<{
  imagePath: string;
  prompt: string;
  difficulty: number;
  targetWords?: string[];
}> = [];

const generatedImagesPath = path.join(process.cwd(), 'src', 'server', 'db', 'generated-images.json');
if (fs.existsSync(generatedImagesPath)) {
  try {
    const fileContent = fs.readFileSync(generatedImagesPath, 'utf8');
    generatedImages = JSON.parse(fileContent);
    console.log(`Loaded ${generatedImages.length} generated images from JSON file`);
  } catch (error) {
    console.error('Error loading generated images:', error);
  }
}

// Combine initial and generated images
const allGameImages = [
  ...initialGameImages,
  ...generatedImages.map(img => ({
    imagePath: img.imagePath,
    originalPrompt: img.prompt,
    difficulty: img.difficulty,
    targetWords: img.targetWords || ["placeholder", "words"],
    active: true
  })),
];

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing game images
    await db.delete(gameImages);
    console.log("🗑️  Cleared existing game images");

    // Insert game images
    for (const image of allGameImages) {
      await db.insert(gameImages).values({
        imagePath: image.imagePath,
        originalPrompt: image.originalPrompt,
        difficulty: image.difficulty,
        targetWords: image.targetWords,
        active: image.active,
      });
    }

    console.log(`✅ Seed completed successfully with ${allGameImages.length} images`);
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  }
}

// Run the seed function
void seed(); 