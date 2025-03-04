import { db } from '../src/server/db';
import { gameImages } from '../src/server/db/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of pun images with their target words
const punImages = [
  {
    title: "Time Flies",
    filename: "time_flies.png",
    prompt: "A surreal image of a clock with butterfly wings flying through a blue sky",
    targetWords: ["time", "flies"],
    difficulty: 2
  },
  {
    title: "Bread Winner",
    filename: "bread_winner.png",
    prompt: "A loaf of bread wearing a gold medal and standing on a winner's podium",
    targetWords: ["bread", "winner"],
    difficulty: 2
  },
  {
    title: "Brain Freeze",
    filename: "brain_freeze.png",
    prompt: "A cartoon brain character trapped in an ice cube, looking cold",
    targetWords: ["brain", "freeze"],
    difficulty: 2
  },
  {
    title: "Hot Dog",
    filename: "hot_dog.png",
    prompt: "A dachshund dog wearing sunglasses and lying on a beach towel under the sun",
    targetWords: ["hot", "dog"],
    difficulty: 1
  },
  {
    title: "Cat Nap",
    filename: "cat_nap.png",
    prompt: "A cute cat sleeping peacefully on a giant napkin",
    targetWords: ["cat", "nap"],
    difficulty: 1
  },
  {
    title: "Bookworm",
    filename: "bookworm.png",
    prompt: "A cartoon worm wearing glasses and reading a book in a library",
    targetWords: ["book", "worm"],
    difficulty: 2
  },
  {
    title: "Eye Candy",
    filename: "eye_candy.png",
    prompt: "A realistic eyeball made of colorful candy and lollipops",
    targetWords: ["eye", "candy"],
    difficulty: 3
  },
  {
    title: "Couch Potato",
    filename: "couch_potato.png",
    prompt: "A potato character with arms and legs lounging on a couch watching TV",
    targetWords: ["couch", "potato"],
    difficulty: 2
  },
  {
    title: "Fish Out of Water",
    filename: "fish_out_of_water.png",
    prompt: "A fish with a confused expression flopping in a desert with cacti",
    targetWords: ["fish", "water"],
    difficulty: 3
  },
  {
    title: "Spill the Beans",
    filename: "spill_the_beans.png",
    prompt: "Coffee beans spilling out of an overturned coffee cup on a table",
    targetWords: ["spill", "beans"],
    difficulty: 3
  },
  {
    title: "Monkey Business",
    filename: "monkey_business.png",
    prompt: "Monkeys in business suits having a meeting in an office",
    targetWords: ["monkey", "business"],
    difficulty: 3
  },
  {
    title: "Pig Out",
    filename: "pig_out.png",
    prompt: "A pig sitting at a table with an empty plate and many food wrappers",
    targetWords: ["pig", "out"],
    difficulty: 2
  },
  {
    title: "Chicken Scratch",
    filename: "chicken_scratch.png",
    prompt: "A chicken using its feet to draw or write on the ground",
    targetWords: ["chicken", "scratch"],
    difficulty: 4
  },
  {
    title: "Holy Cow",
    filename: "holy_cow.png",
    prompt: "A cow with a halo floating above its head in a heavenly setting",
    targetWords: ["holy", "cow"],
    difficulty: 2
  },
  {
    title: "Elephant in the Room",
    filename: "elephant_in_the_room.png",
    prompt: "A living room with people ignoring a large elephant standing among them",
    targetWords: ["elephant", "room"],
    difficulty: 2
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
  // In a real scenario, you would generate or download an actual image
  const placeholderText = `
Placeholder for: ${title}
Target words: ${targetWords.join(', ')}

To replace this placeholder:
1. Generate an image for this pun
2. Save it to: public/game-images/puns/${filename}
`;

  fs.writeFileSync(filePath, placeholderText);
  console.log(`Created placeholder: ${filename}`);
}

/**
 * Add pun images to the database
 */
async function seedPunImages() {
  console.log('🎮 Adding pun images to the database...');
  
  try {
    // First, ensure the puns directory exists
    ensurePunsDirectory();
    
    // Clear existing game images
    await db.delete(gameImages);
    console.log('✅ Cleared existing game images');
    
    // Insert each pun image and create placeholder
    for (const image of punImages) {
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
    
    console.log('\n🎉 All pun images added successfully!');
    console.log('\nNext steps:');
    console.log('1. Replace the placeholder files in public/game-images/puns/ with actual images');
    console.log('2. Use the admin interface to manage the game images');
    
  } catch (error) {
    console.error('❌ Error adding pun images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
seedPunImages(); 