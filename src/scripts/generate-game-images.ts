import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the output directory
const outputDir = path.join(process.cwd(), 'public', 'game-images');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Game image prompts with varying difficulty levels
const gameImagePrompts = [
  {
    prompt: "A futuristic cityscape with floating buildings and flying vehicles, bathed in neon lights against a sunset sky.",
    difficulty: 2,
  },
  {
    prompt: "An ancient temple hidden in a lush jungle, with vines and moss covering stone statues and mysterious symbols carved into the walls.",
    difficulty: 3,
  },
  {
    prompt: "A serene underwater scene with colorful coral reefs, schools of tropical fish, and rays of sunlight filtering through the water's surface.",
    difficulty: 2,
  },
  {
    prompt: "A cozy cabin in a snowy forest at night, with warm light glowing from the windows and smoke rising from the chimney.",
    difficulty: 1,
  },
  {
    prompt: "A surreal dreamscape with floating islands, upside-down waterfalls, and impossible architecture defying gravity.",
    difficulty: 4,
  },
  {
    prompt: "A bustling medieval marketplace with merchants, performers, and people from various fantasy races trading exotic goods.",
    difficulty: 3,
  },
  {
    prompt: "A cosmic scene showing the birth of a new star, with swirling nebulae of vibrant colors against the backdrop of deep space.",
    difficulty: 4,
  },
  {
    prompt: "A tranquil Japanese garden with a koi pond, cherry blossoms, and a traditional wooden bridge over still water.",
    difficulty: 2,
  },
  {
    prompt: "An abstract representation of human emotions, with flowing shapes and colors blending together in a harmonious composition.",
    difficulty: 5,
  },
  {
    prompt: "A steampunk laboratory filled with brass contraptions, gears, and glowing tubes, where an inventor works on a mysterious device.",
    difficulty: 3,
  },
];

// Function to generate and save an image
async function generateAndSaveImage(prompt: string, index: number): Promise<{ imagePath: string, prompt: string, difficulty: number }> {
  try {
    console.log(`Generating image ${index + 1}/10: "${prompt.substring(0, 30)}..."`);
    
    // Generate image using DALL-E 2
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    // Get the base64 image data
    const imageData = response.data[0]?.b64_json;
    if (!imageData) {
      throw new Error("No image data received from OpenAI");
    }

    // Create a buffer from the base64 data
    const buffer = Buffer.from(imageData, 'base64');

    // Create a filename based on the prompt
    const promptSlug = prompt.substring(0, 20)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const filename = `dalle2_${promptSlug}_${Date.now()}.png`;
    const outputPath = path.join(outputDir, filename);

    // Save the image to the file system
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved image to ${outputPath}`);

    // Return the image information
    return {
      imagePath: `/game-images/${filename}`,
      prompt: prompt,
      difficulty: gameImagePrompts[index]?.difficulty ?? 3,
    };
  } catch (error) {
    console.error(`Error generating image: ${error}`);
    throw error;
  }
}

// Main function to generate all images
async function generateGameImages() {
  console.log("Starting to generate game images...");
  
  const results = [];
  
  for (let i = 0; i < gameImagePrompts.length; i++) {
    try {
      const result = await generateAndSaveImage(gameImagePrompts[i]?.prompt ?? "", i);
      results.push(result);
      
      // Add a small delay between requests to avoid rate limiting
      if (i < gameImagePrompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}: ${error}`);
    }
  }
  
  // Save the results to a JSON file for later use in seeding the database
  const resultsPath = path.join(process.cwd(), 'src', 'server', 'db', 'generated-images.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`Generated ${results.length} images. Results saved to ${resultsPath}`);
  return results;
}

// Run the script
generateGameImages().catch(console.error); 