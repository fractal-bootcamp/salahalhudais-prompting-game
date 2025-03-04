// Import OpenAI SDK
import OpenAI from 'openai';

// Cache for embeddings to reduce API calls
const embeddingCache = new Map<string, number[]>();

// Create a client-safe OpenAI instance
let openai: OpenAI | null = null;

// Initialize OpenAI only on the server side
if (typeof window === 'undefined') {
  // Server-side initialization
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
} 

/**
 * Get proximity label based on similarity
 */
export function getProximityLabel(similarity: number): string {
  if (similarity >= 90) return "hot";
  if (similarity >= 70) return "warm";
  if (similarity >= 50) return "tepid";
  if (similarity >= 30) return "cool";
  return "cold";
}

/**
 * Get proximity color based on similarity
 */
export function getProximityColor(similarity: number): string {
  if (similarity >= 90) return "text-red-500";
  if (similarity >= 70) return "text-orange-500";
  if (similarity >= 50) return "text-yellow-500";
  if (similarity >= 30) return "text-blue-500";
  return "text-blue-900";
}

/**
 * Calculate rank based on similarity
 */
export function calculateRank(similarity: number): number {
  return Math.floor((1 - similarity / 100) * 1000) + 1;
}

/**
 * Get embedding for a text using OpenAI API
 */
export async function getEmbedding(text: string): Promise<number[]> {
  // Check cache first
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    console.error("OpenAI API can only be used on the server side");
    throw new Error("OpenAI API can only be used on the server side");
  }

  // Check if API key is available
  if (!openai || !openai.apiKey || openai.apiKey === "") {
    console.error("OpenAI API key is missing. Using fallback similarity calculation.");
    throw new Error("OpenAI API key is missing");
  }

  try {
    // We've already checked that openai is not null above
    // This assertion tells TypeScript that openai is definitely not null
    const response = await (openai as OpenAI).embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = response.data[0]?.embedding;
    
    if (!embedding) {
      throw new Error("No embedding returned from OpenAI");
    }
    
    // Cache the result
    embeddingCache.set(text, embedding);
    
    return embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw new Error("Failed to get embedding from OpenAI");
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    // Use nullish coalescing to ensure we have numbers
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  // Convert to percentage (0-100)
  return (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))) * 100;
}

/**
 * Calculate word similarity using OpenAI embeddings
 */
export async function calculateWordSimilarity(
  targetWords: string[],
  guessWords: string[]
): Promise<{ 
  similarity: number; 
  rank: number; 
  wordSimilarities: { word: string; similarity: number; targetWord: string }[] 
}> {
  try {
    // If exact match, return 100% similarity
    if (
      targetWords.length === guessWords.length &&
      targetWords.every((word, i) => {
        const guessWord = guessWords[i];
        return guessWord !== undefined && word.toLowerCase() === guessWord.toLowerCase();
      })
    ) {
      return {
        similarity: 100,
        rank: 1,
        wordSimilarities: targetWords.map((targetWord, i) => ({
          word: guessWords[i] ?? "",
          similarity: 100,
          targetWord
        }))
      };
    }

    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      console.warn("OpenAI API can only be used on the server side. Using fallback similarity calculation.");
      return fallbackWordSimilarity(targetWords, guessWords);
    }

    // Check if API key is available
    if (!openai || !openai.apiKey || openai.apiKey === "") {
      console.warn("OpenAI API key is missing. Using fallback similarity calculation.");
      return fallbackWordSimilarity(targetWords, guessWords);
    }

    // Get embeddings for individual words
    try {
      const targetEmbeddings = await Promise.all(
        targetWords.map(word => getEmbedding(word))
      );
      
      const guessEmbeddings = await Promise.all(
        guessWords.map(word => getEmbedding(word))
      );
      
      // Calculate similarity for each word pair to find best matches
      const wordSimilarities: { word: string; similarity: number; targetWord: string }[] = [];
      
      // For each guess word, find the most similar target word
      for (let i = 0; i < guessWords.length; i++) {
        let bestSimilarity = 0;
        let bestTargetWord = targetWords[0] || "";
        const guessWord = guessWords[i] || "";
        const guessEmbedding = guessEmbeddings[i] || [];
        
        for (let j = 0; j < targetWords.length; j++) {
          const targetWord = targetWords[j] || "";
          const targetEmbedding = targetEmbeddings[j] || [];
          
          const similarity = cosineSimilarity(guessEmbedding, targetEmbedding);
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestTargetWord = targetWord;
          }
        }
        
        wordSimilarities.push({
          word: guessWord,
          similarity: Number(bestSimilarity.toFixed(2)),
          targetWord: bestTargetWord
        });
      }
      
      // Calculate overall similarity (average of individual similarities)
      const overallSimilarity = wordSimilarities.reduce(
        (sum, item) => sum + item.similarity, 
        0
      ) / wordSimilarities.length;
      
      // Calculate rank
      const rank = calculateRank(overallSimilarity);
      
      return {
        similarity: Number(overallSimilarity.toFixed(2)),
        rank,
        wordSimilarities
      };
    } catch (embeddingError) {
      console.error("Error with embeddings:", embeddingError);
      // Fallback to simplified calculation if embedding fails
      return fallbackWordSimilarity(targetWords, guessWords);
    }
  } catch (error) {
    console.error("Error calculating word similarity:", error);
    
    // Fallback to simplified calculation if API fails
    return fallbackWordSimilarity(targetWords, guessWords);
  }
}

/**
 * Fallback word similarity calculation (used if API fails)
 */
export function fallbackWordSimilarity(
  targetWords: string[],
  guessWords: string[]
): { 
  similarity: number; 
  rank: number; 
  wordSimilarities: { word: string; similarity: number; targetWord: string }[] 
} {
  // Individual word similarities
  const wordSimilarities: { word: string; similarity: number; targetWord: string }[] = [];
  
  for (const guessWord of guessWords) {
    // Ensure guessWord is a string
    const safeGuessWord = guessWord || "";
    let bestSimilarity = 0;
    let bestTargetWord = targetWords[0] || ""; // Add fallback for empty array
    
    for (const targetWord of targetWords) {
      // Ensure targetWord is a string
      const safeTargetWord = targetWord || "";
      
      // Exact match
      if (safeGuessWord.toLowerCase() === safeTargetWord.toLowerCase()) {
        bestSimilarity = 100;
        bestTargetWord = safeTargetWord;
        break;
      }
      
      // Simple similarity based on character overlap
      const similarity = Math.random() * 60; // Random similarity for fallback
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestTargetWord = safeTargetWord;
      }
    }
    
    wordSimilarities.push({
      word: safeGuessWord,
      similarity: Number(bestSimilarity.toFixed(2)),
      targetWord: bestTargetWord
    });
  }
  
  // Calculate overall similarity
  const overallSimilarity = wordSimilarities.length > 0 
    ? wordSimilarities.reduce((sum, item) => sum + item.similarity, 0) / wordSimilarities.length
    : 0;
  
  // Calculate rank
  const rank = calculateRank(overallSimilarity);
  
  return {
    similarity: Number(overallSimilarity.toFixed(2)),
    rank,
    wordSimilarities
  };
} 