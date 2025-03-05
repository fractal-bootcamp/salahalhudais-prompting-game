import fetch from 'node-fetch';

export interface ClipSimilarityResponse {
  original_prompt_score: number;
  user_prompt_score: number;
  text_similarity: number;
  metrics: {
    image_to_original: number;
    image_to_user: number;
    prompt_similarity: number;
  };
}

export async function compareImageAndText(
  imageUrl: string,
  originalPrompt: string,
  userPrompt: string
): Promise<ClipSimilarityResponse> {
  try {
    console.log('Using image URL:', imageUrl);
    
    // Make sure the URL is absolute
    if (!imageUrl.startsWith('http')) {
      throw new Error('Image URL must be absolute (start with http:// or https://)');
    }
    
    // Call the Modal API with the image URL
    const modalUrl = 'https://onepercentbetter--clip-similarity--compare-prompts.modal.run';
    console.log('Calling Modal API');
    
    const response = await fetch(modalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,  // Pass the URL instead of the bytes
        original_prompt: originalPrompt,
        user_prompt: userPrompt
      })
    });
    
    console.log('Modal API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Modal API error response:', errorText);
      throw new Error(`Modal API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Modal API success response');
    return result;
  } catch (error) {
    console.error('CLIP comparison detailed error:', error);
    throw new Error('Failed to compare image and text using CLIP');
  }
}

// Helper function to resize an image buffer
async function resizeImage(buffer: Buffer, maxSizeBytes: number): Promise<Buffer> {
  // If the buffer is already small enough, return it as is
  if (buffer.length <= maxSizeBytes) {
    return buffer;
  }
  
  try {
    // Try to use sharp if available
    const sharp = require('sharp');
    
    // Calculate a reasonable quality reduction
    const currentSize = buffer.length;
    const ratio = maxSizeBytes / currentSize;
    const quality = Math.max(10, Math.floor(ratio * 100));
    
    console.log(`Resizing image with quality: ${quality}%`);
    
    // Resize the image
    const resized = await sharp(buffer)
      .jpeg({ quality })
      .toBuffer();
    
    return resized;
  } catch (err) {
    console.error('Error resizing image:', err);
    
    // If sharp is not available, just truncate the buffer as a last resort
    return buffer.slice(0, maxSizeBytes);
  }
}

// Helper function to convert Blob to base64 (client-side only)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      reject(new Error('FileReader is only available in browser environment'));
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1];
      if (base64 === undefined) {
        reject(new Error('Failed to extract base64 data from FileReader result'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Optional: Cache embeddings for frequently used images
/*
const imageEmbeddingCache = new Map<string, number[]>();

export async function getImageEmbedding(imageUrl: string): Promise<number[]> {
  // Check cache first
  if (imageEmbeddingCache.has(imageUrl)) {
    return imageEmbeddingCache.get(imageUrl)!;
  }

  const result = await compareImageAndText(imageUrl, "", true);
  const embedding = result.details?.imageEmbedding;
  
  if (!embedding) {
    throw new Error('Failed to get image embedding');
  }

  // Cache the embedding
  imageEmbeddingCache.set(imageUrl, embedding);
  return embedding;
}  */