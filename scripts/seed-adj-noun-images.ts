import { db } from '../src/server/db';
import { gameImages } from '../src/server/db/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of adjective-noun images with their target words
const adjNounImages = [
  {
    "title": "Polka-Dotted Giraffe",
    "filename": "polka_dotted_giraffe.png",
    "prompt": "An image of a charming giraffe covered in colorful polka dots instead of its usual spots",
    "targetWords": [
      "Polka-Dotted",
      "Giraffe"
    ],
    "difficulty": 1
  },
  {
    "title": "Glowing Pineapple",
    "filename": "glowing_pineapple.png",
    "prompt": "A pineapple that radiates a soft, warm light",
    "targetWords": [
      "Glowing",
      "Pineapple"
    ],
    "difficulty": 2
  },
  {
    "title": "Rainbow Elephant",
    "filename": "rainbow_elephant.png",
    "prompt": "A majestic elephant with iridescent, rainbow-colored skin",
    "targetWords": [
      "Rainbow",
      "Elephant"
    ],
    "difficulty": 3
  },
  {
    "title": "Steampunk Octopus",
    "filename": "steampunk_octopus.png",
    "prompt": "An octopus fashioned from brass and gears, a true representation of steampunk aesthetic",
    "targetWords": [
      "Steampunk",
      "Octopus"
    ],
    "difficulty": 4
  },
  {
    "title": "Neon Jungle",
    "filename": "neon_jungle.png",
    "prompt": "A high-contrast image of a dense jungle where every plant glows with bright neon colors",
    "targetWords": [
      "Neon",
      "Jungle"
    ],
    "difficulty": 5
  },
  {
    "title": "Melting Skyline",
    "filename": "melting_skyline.png",
    "prompt": "A surreal image of a city skyline seemingly melting into the horizon",
    "targetWords": [
      "Melting",
      "Skyline"
    ],
    "difficulty": 6
  },
  {
    "title": "Astral Waterfall",
    "filename": "astral_waterfall.png",
    "prompt": "A waterfall cascading from a starry night sky, each droplet a shimmering star itself",
    "targetWords": [
      "Astral",
      "Waterfall"
    ],
    "difficulty": 7
  },
  {
    "title": "Tesseract Pyramid",
    "filename": "tesseract_pyramid.png",
    "prompt": "An image of a pyramid within a pyramid, both interacting across four dimensions",
    "targetWords": [
      "Tesseract",
      "Pyramid"
    ],
    "difficulty": 8
  },
  {
    "title": "Quantum Forest",
    "filename": "quantum_forest.png",
    "prompt": "A view into a forest where each tree simultaneously exists in multiple states and locations",
    "targetWords": [
      "Quantum",
      "Forest"
    ],
    "difficulty": 9
  },
  {
    "title": "Infinite Kaleidoscope",
    "filename": "infinite_kaleidoscope.png",
    "prompt": "The perspective from within a kaleidoscope that extends into infinity, showing a dizzying array of colors and patterns",
    "targetWords": [
      "Infinite",
      "Kaleidoscope"
    ],
    "difficulty": 10
  }
];

/**
 * Create the puns directory if it doesn't exist
 */
function ensurePunsDirectory() {
  const punsDir = path.join(__dirname, '../public/game-images/puns');
  
  if (!fs.existsSync(punsDir)) {
    console.log(`Creating directory: ${punsDir}`);
    fs.mkdirSync(punsDir, { recursive: true });
  }
}

/**
 * Generate a simple placeholder image with text
 */
function generatePlaceholderImage(title: string, filename: string, targetWords: string[]) {
  const punsDir = path.join(__dirname, '../public/game-images/puns');
  const filePath = path.join(punsDir, filename);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Image already exists: ${filename}`);
    return;
  }
  
  console.log(`Creating placeholder for: ${title}`);
  
  // Create a simple text file as a placeholder
  const placeholderText = `
Placeholder for: ${title}
Target words: ${targetWords.join(', ')}

To replace this placeholder:
1. Generate an image for this concept
2. Save it to: public/game-images/puns/${filename}
`;

  fs.writeFileSync(filePath, placeholderText);
  console.log(`Created placeholder: ${filename}`);
}

/**
 * Add adjective-noun images to the database
 */
async function seedAdjNounImages() {
  console.log('🎮 Adding adjective-noun images to the database...');
  
  try {
    // First, ensure the puns directory exists
    ensurePunsDirectory();
    
    // Insert each adjective-noun image and create placeholder
    for (const image of adjNounImages) {
      // Create placeholder image
      generatePlaceholderImage(image.title, image.filename, image.targetWords);
      
      // Add to database
      await db.insert(gameImages).values({
        imagePath: `/game-images/puns/${image.filename}`,
        originalPrompt: image.prompt,
        targetWords: image.targetWords,
        difficulty: image.difficulty,
        active: true
      });
      
      console.log(`✅ Added "${image.title}" to database`);
    }
    
    console.log('\n🎉 All adjective-noun images added successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the generate-pun-images.ts script to generate actual images');
    console.log('2. Use the admin interface to manage the game images');
    
  } catch (error) {
    console.error('❌ Error adding adjective-noun images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
seedAdjNounImages();
