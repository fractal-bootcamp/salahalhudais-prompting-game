"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { Loader2, RefreshCw, Maximize2, X } from "lucide-react"
import Image from "next/image"
import { getProximityLabel, getProximityColor, fallbackWordSimilarity } from "~/lib/wordEmbeddings"
import { useToast } from "~/components/ui/use-toast"

// Mock data for similarity ranges
const similarityRanges = {
  nearest: 86.04,
  tenthNearest: 58.59,
  thousandthNearest: 31.23,
}

type Guess = {
  id: number
  words: string[]
  similarity: number
  rank: number
  isHint?: boolean
  wordSimilarities?: { word: string; similarity: number; targetWord: string }[]
}

// Add proper types for your API responses
interface GameImageResponse {
  imagePath: string;
  targetWords: string[];
  difficulty: number;
}

interface SimilarityResponse {
  similarity: number;
  rank: number;
  wordSimilarities: any[]; // Replace with proper type if known
}

export default function PicktleGame() {
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [inputValue, setInputValue] = useState("")
  const [guessCount, setGuessCount] = useState(0)
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false)
  const [correctSimilarity, setCorrectSimilarity] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [latestGuess, setLatestGuess] = useState<Guess | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState("/game-images/fallback-image.png")
  const [gameData, setGameData] = useState<{
    image: string;
    targetWords: string[];
    difficulty: number;
  } | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<'easy' | 'medium' | 'hard' | 'all'>('all')

  // Current target words (from game data)
  const currentTargetWords = gameData?.targetWords || []

  // Fetch game data on component mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoadingGame(true)
        // Fetch a random game image with target words
        // Add difficulty filter to the API request
        const difficultyParam = difficultyFilter !== 'all' ? `?difficulty=${difficultyFilter}` : ''
        const response = await fetch(`/api/game/random-image${difficultyParam}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch game data')
        }
        
        const data = await response.json() as GameImageResponse
        setGameData({
          image: data.imagePath,
          targetWords: data.targetWords || [],
          difficulty: Number(data.difficulty) || 1,
        })
      } catch (error) {
        console.error('Error fetching game data:', error)
        toast({
          title: "Error",
          description: "Failed to load game data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingGame(false)
      }
    }
    
    fetchGameData()
  }, [toast, difficultyFilter])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Update image when gameData changes
  useEffect(() => {
    if (gameData?.image) {
      setCurrentImage(gameData.image);
    }
  }, [gameData]);

  const calculateSimilarityWithAPI = async (words: string[]): Promise<{ 
    similarity: number, 
    rank: number,
    wordSimilarities?: { word: string; similarity: number; targetWord: string }[]
  }> => {
    try {
      const response = await fetch('/api/word-similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess: words.join(' '),
          targetWords: currentTargetWords,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate similarity');
      }

      const data = await response.json() as SimilarityResponse;
      return {
        similarity: data.similarity,
        rank: data.rank,
        wordSimilarities: data.wordSimilarities
      };
    } catch (error) {
      console.error('Error calculating similarity:', error);
      // Fallback to a simpler calculation if the API fails
      return fallbackSimilarityCalculation(words);
    }
  };

  const fallbackSimilarityCalculation = (words: string[]): { 
    similarity: number, 
    rank: number,
    wordSimilarities?: { word: string; similarity: number; targetWord: string }[]
  } => {
    // Use the fallback function from wordEmbeddings.ts
    // console.log(similarity);
    return fallbackWordSimilarity(currentTargetWords, words);
  };

  const handleGuess = async () => {
    if (!inputValue.trim()) return;

    // Split input into words
    const words = inputValue.trim().toLowerCase().split(/\s+/);

    // Validate that there are exactly two words
    if (words.length !== 2) {
      toast({
        title: "Invalid guess",
        description: "Please enter exactly two words",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate similarity using the API
      const { similarity, rank, wordSimilarities } = await calculateSimilarityWithAPI(words);

      const newGuess: Guess = {
        id: guessCount + 1,
        words: words,
        similarity,
        rank,
        wordSimilarities
      };

      // Update latest guess for immediate feedback
      setLatestGuess(newGuess);

      // Add to guesses array and sort by similarity (highest first)
      const updatedGuesses = [...guesses, newGuess].sort((a, b) => b.similarity - a.similarity);
      setGuesses(updatedGuesses);

      setGuessCount(guessCount + 1);
      setInputValue("");

      // Check if correct (100% similarity)
      // Within handleGuess()
      if (similarity === 100) {
        setIsCorrect(true);
        setCorrectSimilarity(similarity);
        setShowCorrectAnimation(true);

        toast({
          title: "Perfect match!",
          description: "You found the exact words!",
          variant: "default",
        });

        // Hide animation and refresh game automatically after 3 seconds
        setTimeout(() => {
          setShowCorrectAnimation(false);
          handleRefresh(); // Automatically loads a new image/game round
        }, 3000);
      }
      // Show partial match animation for high similarity
      else if (similarity >= 80) {
        setIsCorrect(false);
        setCorrectSimilarity(similarity);
        setShowCorrectAnimation(true);

        toast({
          title: "Very close!",
          description: "You're getting very warm!",
          variant: "default",
        });

        // Hide animation after 1.5 seconds
        setTimeout(() => {
          setShowCorrectAnimation(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error processing guess:", error);
      toast({
        title: "Error",
        description: "Failed to process your guess. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    // Reset game state
    setGuesses([]);
    setGuessCount(0);
    setLatestGuess(null);
    setInputValue("");
    setIsCorrect(false);
    
    // Fetch new game data and update state
    const fetchNewGame = async () => {
      try {
        setIsLoadingGame(true);
        // Add difficulty filter to the refresh request
        const difficultyParam = difficultyFilter !== 'all' ? `?difficulty=${difficultyFilter}` : '';
        const response = await fetch(`/api/game/random-image${difficultyParam}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch new game data');
        }
        
        const data = await response.json() as GameImageResponse;
        setGameData({
          image: data.imagePath,
          targetWords: data.targetWords || [],
          difficulty: Number(data.difficulty) || 1,
        });
      } catch (error) {
        console.error('Error fetching new game data:', error);
        toast({
          title: "Error",
          description: "Failed to load new game. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingGame(false);
      }
    };
    
    // Execute the fetch function
    void fetchNewGame();
  };

  return (
    <div className="container mx-auto px-4">
      {/* Add title section here */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Picktle</h1>
        <p className="text-lg text-muted-foreground">
          Guess the two words that best describe the image
        </p>
      </div>

      {/* Difficulty selector */}
      <div className="flex justify-center mb-4 gap-2">
        <div className="text-sm text-muted-foreground flex items-center mr-2">Difficulty:</div>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant={difficultyFilter === 'easy' ? "default" : "outline"}
            onClick={() => setDifficultyFilter('easy')}
            className="h-7 px-3 text-xs"
          >
            Easy
          </Button>
          <Button 
            size="sm" 
            variant={difficultyFilter === 'medium' ? "default" : "outline"}
            onClick={() => setDifficultyFilter('medium')}
            className="h-7 px-3 text-xs"
          >
            Medium
          </Button>
          <Button 
            size="sm" 
            variant={difficultyFilter === 'hard' ? "default" : "outline"}
            onClick={() => setDifficultyFilter('hard')}
            className="h-7 px-3 text-xs"
          >
            Hard
          </Button>
          <Button 
            size="sm" 
            variant={difficultyFilter === 'all' ? "default" : "outline"}
            onClick={() => setDifficultyFilter('all')}
            className="h-7 px-3 text-xs"
          >
            All
          </Button>
        </div>
      </div>

      {/* Game stats header */}
      <div className="text-sm text-muted-foreground text-center mb-4">
        Nearest word similarity: <span className="font-medium">{similarityRanges.nearest}</span>
      </div>

      {/* Main game area - image and guess interface side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side - Image */}
        <div className="bg-gradient-to-br from-card/80 to-card rounded-xl overflow-hidden shadow-lg border border-border/50">
          <div className="relative aspect-[4/3] w-full">
            {isLoadingGame ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <>
                <div 
                  className="absolute right-2 top-2 z-10 cursor-pointer rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                  onClick={() => setImageModalOpen(true)}
                >
                  <Maximize2 size={16} />
                </div>
                  <Image
                    src={currentImage}
                    alt="Guess the words for this image"
                    fill
                    className="object-cover transition-all duration-500 ease-in-out"
                    sizes="(max-width: 768px) 100vw, 384px"
                    priority
                    onError={(e) => {
                      console.log("Image failed to load, retrying:", currentImage);
                      setImageError(true);
                      
                      // Retry fetching a new image
                      const retryFetch = async () => {
                        try {
                          setIsLoadingGame(true);
                          // Add difficulty filter to the retry request
                          const difficultyParam = difficultyFilter !== 'all' ? `?difficulty=${difficultyFilter}` : '';
                          const response = await fetch(`/api/game/random-image${difficultyParam}`);
                          
                          if (!response.ok) {
                            throw new Error('Failed to fetch new game data');
                          }
                          
                          const data = await response.json() as GameImageResponse;
                          setGameData({
                            image: data.imagePath,
                            targetWords: data.targetWords || [],
                            difficulty: Number(data.difficulty) || 1,
                          });
                          
                          // Reset image error state
                          setImageError(false);
                        } catch (error) {
                          console.error('Error fetching new game data:', error);
                          toast({
                            title: "Error",
                            description: "Failed to load image. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsLoadingGame(false);
                        }
                      };
                      
                      // Execute the retry
                      void retryFetch();
                    }}
                  />
              </>
            )}
          </div>
        </div>

        {/* Right side - Guess interface */}
        <div className="flex flex-col h-full">
          {/* Top section with difficulty and input */}
          <div className="bg-gradient-to-br from-card/80 to-card rounded-xl p-4 shadow-lg border border-border/50 mb-4">
            {/* Difficulty indicator */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="text-muted-foreground">Difficulty:</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-2 rounded-full ${
                      i < (gameData?.difficulty ?? 0)
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder={`Enter two words... (${gameData?.difficulty === 1 ? 'Pun' :
                  gameData?.difficulty === 2 ? 'Adj+Noun' : 'Any two'})`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleGuess()
                }}
                disabled={isLoading}
                className="flex-1 h-8 text-sm bg-background/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                className="h-8 px-3 rounded-md hover:scale-105 transition-transform"
                onClick={() => void handleGuess()}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Guess'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleRefresh}
                disabled={isLoadingGame || isLoading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Latest guess feedback */}
          {latestGuess && (
            <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-3 mb-4 shadow-sm border border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall:</span>
                <span className={getProximityColor(latestGuess.similarity)}>
                  {latestGuess.similarity}% ({getProximityLabel(latestGuess.similarity)})
                </span>
              </div>
              {latestGuess.wordSimilarities?.map((wordSim, i) => (
                <div key={i} className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">{wordSim.word}:</span>
                  <span className={getProximityColor(wordSim.similarity)}>
                    {wordSim.similarity}% ({getProximityLabel(wordSim.similarity)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Previous guesses - Card-based view with slide-in animation */}
          <div className="flex-1 bg-gradient-to-br from-card/80 to-card rounded-xl overflow-hidden shadow-lg border border-border/50 p-2 flex flex-col gap-1">
            {guesses.map((guess) => (
              <motion.div
                key={guess.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-2 rounded-md bg-background flex justify-between items-center gap-2 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="font-mono text-xs text-muted-foreground w-6">#{guess.id}</div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">{guess.words.join(" ")}</span>
                    <div className="flex gap-2 mt-0.5">
                      {guess.wordSimilarities?.map((wordSim, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">{wordSim.word}:</span>
                          <span className={`${getProximityColor(wordSim.similarity)} font-semibold`}>
                            {wordSim.similarity}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`font-mono text-lg font-bold ${getProximityColor(guess.similarity)}`}>
                    {guess.similarity}%
                  </div>
                  <div className={`text-xs ${getProximityColor(guess.similarity)} badge badge-outline px-1.5 py-0.5`}>
                    {getProximityLabel(guess.similarity)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Correct answer animation overlay */}
      <AnimatePresence>
        {showCorrectAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: correctSimilarity / 200 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500 z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Correct answer word animation */}
      <AnimatePresence>
        {showCorrectAnimation && isCorrect && (
          <motion.div 
            className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-foreground text-6xl font-bold px-4 py-2 bg-background/80 rounded-lg"
              >
                {currentTargetWords[0]}
              </motion.div>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-foreground text-6xl font-bold px-4 py-2 bg-background/80 rounded-lg"
              >
                {currentTargetWords[1]}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-size image modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] max-w-[90vw] aspect-[16/9]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 z-10"
              onClick={() => setImageModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={currentImage}
              alt="Full size image"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  )
} 