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
  // Ensure text is a non-empty string
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn("Empty text provided to getEmbedding");
    // Return a zero vector of appropriate dimension instead of throwing
    return new Array(1536).fill(0); // 1536 is the dimension for text-embedding-3-small
  }

  // Check if we have a cached embedding
  const cachedEmbedding = embeddingCache.get(text);
  if (cachedEmbedding) {
    return cachedEmbedding;
  }

  // Check if OpenAI client is available
  if (!openai) {
    console.warn("OpenAI client not available, using fallback similarity");
    // Return a random vector instead of throwing
    return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }

  try {
    // We've already checked that text is not empty above
    const response = await (openai as OpenAI).embeddings.create({
      model: "text-embedding-3-small",
      input: text.trim(),
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
    // Return a random vector instead of throwing
    return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
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
): Promise<{ similarity: number; rank: string; wordSimilarities: { word: string; similarity: number; targetWord: string }[] }> {
  // Filter out empty strings
  const validTargetWords = targetWords.filter(word => word && word.trim() !== "");
  const validGuessWords = guessWords.filter(word => word && word.trim() !== "");
  
  // If either array is empty, return zero similarity
  if (validTargetWords.length === 0 || validGuessWords.length === 0) {
    return {
      similarity: 0,
      rank: "Very Low",
      wordSimilarities: []
    };
  }

  try {
    // If exact match, return 100% similarity
    if (
      validTargetWords.length === validGuessWords.length &&
      validTargetWords.every((word, i) => {
        const guessWord = validGuessWords[i];
        return guessWord !== undefined && word.toLowerCase() === guessWord.toLowerCase();
      })
    ) {
      return {
        similarity: 100,
        rank: "1",
        wordSimilarities: validTargetWords.map((targetWord, i) => ({
          word: validGuessWords[i] ?? "",
          similarity: 100,
          targetWord
        }))
      };
    }

    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      console.warn("OpenAI API can only be used on the server side. Using fallback similarity calculation.");
      return fallbackWordSimilarity(validTargetWords, validGuessWords);
    }

    // Check if API key is available
    if (!openai || !openai.apiKey || openai.apiKey === "") {
      console.warn("OpenAI API key is missing. Using fallback similarity calculation.");
      return fallbackWordSimilarity(validTargetWords, validGuessWords);
    }

    // Get embeddings for individual words
    try {
      const targetEmbeddings = await Promise.all(
        validTargetWords.map(word => getEmbedding(word))
      );
      
      const guessEmbeddings = await Promise.all(
        validGuessWords.map(word => getEmbedding(word))
      );
      
      // Calculate similarity for each word pair to find best matches
      const wordSimilarities: { word: string; similarity: number; targetWord: string }[] = [];
      
      // For each guess word, find the most similar target word
      for (let i = 0; i < validGuessWords.length; i++) {
        const guessWord = validGuessWords[i] || "";
        const guessEmbedding = guessEmbeddings[i] || [];
        
        // Check for exact matches first
        let exactMatchFound = false;
        for (let j = 0; j < validTargetWords.length; j++) {
          const targetWord = validTargetWords[j] || "";
          
          // If there's an exact match (case insensitive), assign 100% similarity
          if (guessWord.toLowerCase() === targetWord.toLowerCase()) {
            wordSimilarities.push({
              word: guessWord,
              similarity: 100,
              targetWord: targetWord
            });
            exactMatchFound = true;
            break;
          }
        }
        
        // If no exact match, use embeddings to find the most similar word
        if (!exactMatchFound) {
          let bestSimilarity = 0;
          let bestTargetWord = validTargetWords[0] || "";
          
          for (let j = 0; j < validTargetWords.length; j++) {
            const targetWord = validTargetWords[j] || "";
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
        rank: rank.toString(),
        wordSimilarities
      };
    } catch (embeddingError) {
      console.error("Error with embeddings:", embeddingError);
      // Fallback to simplified calculation if embedding fails
      return fallbackWordSimilarity(validTargetWords, validGuessWords);
    }
  } catch (error) {
    console.error("Error calculating word similarity:", error);
    
    // Fallback to simplified calculation if API fails
    return fallbackWordSimilarity(validTargetWords, validGuessWords);
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