import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { gameImages } from "../src/server/db/schema";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const supabaseUrl = 'https://mykdgmbqdxxrpujdxybw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a2RnbWJxZHh4cnB1amR4eWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDE2NjIsImV4cCI6MjA1Njc3NzY2Mn0.hVwrdXFUidHBpHWWlcoJdlRhUbrWXiOcGAydg_gHib4';

async function migrateToSupabase() {
  console.log('🚀 Starting migration to Supabase...');

  // 1. Connect to local database
  const localConnectionString = "postgres://sal:password@localhost:5432/generative-art";
  const localClient = postgres(localConnectionString, {
    ssl: false
  });
  const localDb = drizzle(localClient, { schema: { gameImages } });

  // 2. Connect to Supabase
  const supabaseConnectionString = "postgresql://postgres.mykdgmbqdxxrpujdxybw:promptgame!!@aws-0-us-east-1.pooler.supabase.com:6543/postgres";
  const supabaseClient = postgres(supabaseConnectionString, {
    ssl: {
      rejectUnauthorized: false
    }
  });
  const supabaseDb = drizzle(supabaseClient, { schema: { gameImages } });

  // 3. Initialize Supabase client for storage
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 4. Fetch all game images from local database
    console.log('📊 Fetching game images from local database...');
    const localGameImages = await localDb.select().from(gameImages);
    console.log(`✅ Found ${localGameImages.length} game images in local database`);

    // 5. Clear existing game images in Supabase
    console.log('🧹 Clearing existing game images in Supabase...');
    await supabaseDb.delete(gameImages);
    console.log('✅ Cleared existing game images in Supabase');

    // 6. Insert game images into Supabase database and upload files
    console.log('📤 Inserting game images into Supabase...');
    
    // First, ensure the storage bucket exists
    console.log('🪣 Checking if storage bucket exists...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketName = 'game-images';
    
    if (!buckets?.find(bucket => bucket.name === bucketName)) {
      console.log(`🪣 Creating bucket "${bucketName}"...`);
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
      console.log(`✅ Created bucket "${bucketName}"`);
    }
    
    // Process each image
    for (const image of localGameImages) {
      // Get the filename from the path
      const filename = path.basename(image.imagePath);
      const localImagePath = path.join(__dirname, '../public', image.imagePath);
      
      // Check if the file exists locally
      if (fs.existsSync(localImagePath)) {
        // Read the file
        const fileBuffer = fs.readFileSync(localImagePath);
        
        // Upload to Supabase Storage
        console.log(`📤 Uploading ${filename} to Supabase Storage...`);
        const folderPath = path.dirname(image.imagePath).replace(/^\//, '');
        const uploadPath = `${folderPath}/${filename}`;
        
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(uploadPath, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });
        
        if (error) {
          console.error(`❌ Error uploading ${filename}:`, error);
          continue;
        }
        
        console.log(`✅ Uploaded ${filename} to Supabase Storage`);
      } else {
        console.warn(`⚠️ Local image not found: ${localImagePath}`);
      }
      
      // Add the image entry to the database
      await supabaseDb.insert(gameImages).values({
        imagePath: image.imagePath,
        originalPrompt: image.originalPrompt,
        targetWords: image.targetWords,
        difficulty: image.difficulty,
        active: image.active
      });
      
      console.log(`✅ Added "${filename}" to Supabase database`);
    }

    console.log('\n🎉 Migration to Supabase completed successfully!');
    console.log('\nAll image data and files have been migrated to Supabase.');
    console.log('You can access the images via:');
    console.log(`${supabaseUrl}/storage/v1/object/public/${bucketName}/game-images/puns/[filename]`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    // 7. Close connections
    await localClient.end();
    await supabaseClient.end();
    process.exit(0);
  }
}

// Run the migration
migrateToSupabase(); 