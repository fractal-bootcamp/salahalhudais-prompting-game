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
    "title": "Velvet Pumpkin",
    "filename": "velvet_pumpkin.png",
    "prompt": "Visualize a pumpkin with a lush, velvet surface. Its deep orange hue should contrast beautifully against a clean white background.",
    "targetWords": [
      "velvet",
      "pumpkin"
    ],
    "difficulty": 1
  },
  {
    "title": "Glassy Penguin",
    "filename": "glassy_penguin.png",
    "prompt": "Imagine a penguin made completely out of glass, catching the cold sunlight as it slides on an iceberg.",
    "targetWords": [
      "glassy",
      "penguin"
    ],
    "difficulty": 2
  },
  {
    "title": "Giant Teacup",
    "filename": "giant_teacup.png",
    "prompt": "Picture a teacup, large enough for a person to sit in comfortably, filled with steaming hot tea and situated in a quiet, peaceful garden.",
    "targetWords": [
      "giant",
      "teacup"
    ],
    "difficulty": 3
  },
  {
    "title": "Holographic Castle",
    "filename": "holographic_castle.png",
    "prompt": "Envision a castle shimmering in a spectrum of colors, built entirely from holograms. The castle should still feature typical architecture, but with a spectral, ethereal quality.",
    "targetWords": [
      "holographic",
      "castle"
    ],
    "difficulty": 4
  },
  {
    "title": "Crystal Rainforest",
    "filename": "crystal_rainforest.png",
    "prompt": "Imagine a lush rainforest where the foliage, wildlife, and even the rain are all made of glistening, multi-colored crystals.",
    "targetWords": [
      "crystal",
      "rainforest"
    ],
    "difficulty": 5
  },
  {
    "title": "Invisible Symphony",
    "filename": "invisible_symphony.png",
    "prompt": "Translate music into visual art. Picture soundwaves transforming into vibrant, invisible threads filling a concert hall with a palpable, mesmerizing energy.",
    "targetWords": [
      "invisible",
      "symphony"
    ],
    "difficulty": 6
  },
  {
    "title": "Living Constellation",
    "filename": "living_constellation.png",
    "prompt": "Dream of a constellation in the night sky, but the stars are living, glowing creatures, creating an awe-inspiring, organic celestial structure.",
    "targetWords": [
      "living",
      "constellation"
    ],
    "difficulty": 7
  },
  {
    "title": "Recursive Jungle",
    "filename": "recursive_jungle.png",
    "prompt": "Visualize a jungle where each element, from leaves to trees to animals, is a smaller jungle in itself, creating a visually complex, infinite loop of regression.",
    "targetWords": [
      "recursive",
      "jungle"
    ],
    "difficulty": 8
  },
  {
    "title": "Quantum Symphony",
    "filename": "quantum_symphony.png",
    "prompt": "Imagine a symphony orchestra where each musician exists in a superposition, creating infinite musical possibilities all playing simultaneously and somehow, harmoniously.",
    "targetWords": [
      "quantum",
      "symphony"
    ],
    "difficulty": 9
  },
  {
    "title": "Four-Dimensional Labyrinth",
    "filename": "four_dimensional_labyrinth.png",
    "prompt": "Picture a labyrinth that not only extends spatially, but also temporally. One can traverse not just left, right, forward, or back, but also forward and backward in time.",
    "targetWords": [
      "four-dimensional",
      "labyrinth"
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
