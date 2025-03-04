import { db } from '../src/db';
import { gameImages } from '../src/db/schema';
import { sql } from 'drizzle-orm';

// List of pun prompts with their filenames and target words
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
 * Add pun images to the database
 */
async function addPunImages() {
  console.log('🎮 Adding pun images to the database...');
  
  try {
    // First, clear existing game images
    await db.delete(gameImages);
    console.log('✅ Cleared existing game images');
    
    // Insert each pun image
    for (const image of punImages) {
      await db.insert(gameImages).values({
        imagePath: `/game-images/puns/${image.filename}`,
        originalPrompt: image.prompt,
        targetWords: image.targetWords,
        difficulty: image.difficulty,
        active: true
      });
      console.log(`✅ Added "${image.title}" to database`);
    }
    
    console.log('🎉 All pun images added successfully!');
    console.log('\nReminder: Make sure to generate and save the actual image files to:');
    console.log('public/game-images/puns/');
    
  } catch (error) {
    console.error('❌ Error adding pun images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addPunImages(); 