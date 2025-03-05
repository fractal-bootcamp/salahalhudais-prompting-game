import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { env } from '../src/env';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Number of pairs to generate per difficulty level
const PAIRS_PER_LEVEL = 5; // 5 pairs for each of the 3 difficulty levels

// Function to generate adjective-noun pairs using OpenAI
async function generateAdjNounPairs() {
  console.log('🧠 Generating adjective-noun pairs with progressive difficulty...');
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative assistant that generates interesting, funny, weird, strange, and mysterious adjective-noun pairs for a word guessing game. You excel at creating concepts that range from simple to mind-bendingly complex."
        },
        {
          role: "user",
          content: `Generate ${PAIRS_PER_LEVEL * 3} unique adjective-noun pairs with progressive difficulty:

1. EASY (difficulty 1-3): ${PAIRS_PER_LEVEL} pairs that are simple, concrete, and easy to visualize (like "Fluffy Cat" or "Rusty Bicycle")

2. MEDIUM (difficulty 4-7): ${PAIRS_PER_LEVEL} pairs that are more abstract, unusual or conceptually interesting (like "Melting Clock" or "Neon Forest")

3. HARD (difficulty 8-10): ${PAIRS_PER_LEVEL} pairs that are truly mind-bending, hyperdimensional, or extremely difficult to visualize (like "Hyperdimensional Cat", "Quantum Labyrinth", or "Temporal Ocean")

The pairs should be visually interesting and suitable for image generation.

Format the output as a JSON array of objects with the following structure:
[
  {
    "title": "Adjective Noun",
    "filename": "adjective_noun.png",
    "prompt": "A detailed prompt for generating an image of this concept",
    "targetWords": ["adjective", "noun"],
    "difficulty": 8 // number from 1-10
  }
]

For the HARD difficulty pairs, create truly mind-bending concepts that challenge perception and imagination.
Make the prompts detailed and specific for high-quality image generation.
Ensure the filename is lowercase with underscores.`
        }
      ],
      temperature: 1.0,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from the response");
    }
    
    const jsonContent = jsonMatch[0];
    const pairs = JSON.parse(jsonContent);
    
    // Save to file
    const outputPath = path.join(__dirname, 'adj-noun-pairs.json');
    fs.writeFileSync(outputPath, JSON.stringify(pairs, null, 2));
    
    console.log(`✅ Generated ${pairs.length} adjective-noun pairs`);
    console.log(`✅ Saved to: ${outputPath}`);
    
    return pairs;
  } catch (error) {
    console.error('❌ Error generating adjective-noun pairs:', error);
    return [];
  }
}

// Function to create a seed script from the generated pairs
function createSeedScript(pairs: { adjective: string; noun: string }[]) {
  if (!pairs.length) return;
  
  const seedScriptPath = path.join(__dirname, 'seed-adj-noun-images.ts');
  
  const scriptContent = `import { db } from '../src/server/db';
import { gameImages } from '../src/server/db/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of adjective-noun images with their target words
const adjNounImages = ${JSON.stringify(pairs, null, 2)};

/**
 * Create the puns directory if it doesn't exist
 */
function ensurePunsDirectory() {
  const punsDir = path.join(__dirname, '../public/game-images/puns');
  
  if (!fs.existsSync(punsDir)) {
    console.log(\`Creating directory: \${punsDir}\`);
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
    console.log(\`Image already exists: \${filename}\`);
    return;
  }
  
  console.log(\`Creating placeholder for: \${title}\`);
  
  // Create a simple text file as a placeholder
  const placeholderText = \`
Placeholder for: \${title}
Target words: \${targetWords.join(', ')}

To replace this placeholder:
1. Generate an image for this concept
2. Save it to: public/game-images/puns/\${filename}
\`;

  fs.writeFileSync(filePath, placeholderText);
  console.log(\`Created placeholder: \${filename}\`);
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
        imagePath: \`/game-images/puns/\${image.filename}\`,
        originalPrompt: image.prompt,
        targetWords: image.targetWords,
        difficulty: image.difficulty,
        active: true
      });
      
      console.log(\`✅ Added "\${image.title}" to database\`);
    }
    
    console.log('\\n🎉 All adjective-noun images added successfully!');
    console.log('\\nNext steps:');
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
`;

  fs.writeFileSync(seedScriptPath, scriptContent);
  console.log(`✅ Created seed script: ${seedScriptPath}`);
}

// Main function
async function main() {
  console.log('🎨 Generating adjective-noun pairs for Picktle game...');
  
  // Generate pairs
  const pairs = await generateAdjNounPairs();
  
  // Create seed script
  if (pairs.length > 0) {
    createSeedScript(pairs);
    
    console.log('\n🎉 Process complete!');
    console.log('\nNext steps:');
    console.log('1. Review the generated pairs in adj-noun-pairs.json');
    console.log('2. Run the seed script: npm run ts-node scripts/seed-adj-noun-images.ts');
    console.log('3. Run the image generation script: npm run ts-node scripts/generate-pun-images.ts');
  }
}

// Run the main function
main(); 