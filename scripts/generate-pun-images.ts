import { db } from '../src/server/db';
import { gameImages } from '../src/server/db/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import OpenAI from 'openai';
import { eq } from 'drizzle-orm';
import { env } from '../src/env';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Function to ensure the puns directory exists
function ensurePunsDirectory() {
  const punsDir = path.join(__dirname, '../public/game-images/puns');
  
  if (!fs.existsSync(punsDir)) {
    console.log(`Creating directory: ${punsDir}`);
    fs.mkdirSync(punsDir, { recursive: true });
  }
}

// Function to generate an image using DALL-E
async function generateImage(prompt: string, filename: string): Promise<boolean> {
  const outputPath = path.join(__dirname, '../public/game-images/puns', filename);
  
  // Check if file already exists and is not a placeholder
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    console.log(`Image already exists and is not a placeholder: ${filename}`);
    return true;
  }
  
  try {
    console.log(`Generating image for: ${prompt}`);
    
    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });
    
    // Get the base64 image data
    const imageData = response.data[0]?.b64_json;
    
    if (!imageData) {
      throw new Error("No image data received from OpenAI");
    }
    
    // Save the image
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Generated and saved image: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating image ${filename}:`, error);
    return false;
  }
}

// Main function to generate all pun images
async function generatePunImages() {
  console.log('🎨 Generating pun images using DALL-E...');
  
  try {
    // Ensure the puns directory exists
    ensurePunsDirectory();
    
    // Get all pun images from the database
    const punImages = await db.select().from(gameImages).where(
      eq(gameImages.active, true)
    );
    
    console.log(`Found ${punImages.length} images in the database`);
    
    // Generate each image
    let successCount = 0;
    let errorCount = 0;
    
    for (const image of punImages) {
      // Only process pun images
      if (!image.imagePath.includes('/game-images/puns/')) {
        continue;
      }
      
      const filename = path.basename(image.imagePath);
      const success = await generateImage(image.originalPrompt, filename);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 Image generation complete!');
    console.log(`✅ Successfully generated: ${successCount} images`);
    
    if (errorCount > 0) {
      console.log(`❌ Failed to generate: ${errorCount} images`);
    }
    
  } catch (error) {
    console.error('❌ Error generating images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
generatePunImages(); 