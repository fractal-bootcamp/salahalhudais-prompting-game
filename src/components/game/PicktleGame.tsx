"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { Loader2, Search, RefreshCw } from "lucide-react"
import Image from "next/image"
import { api } from "~/trpc/react"
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

export default function PicktleGame() {
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [inputValue, setInputValue] = useState("")
  const [guessCount, setGuessCount] = useState(0)
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false)
  const [correctSimilarity, setCorrectSimilarity] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [latestGuess, setLatestGuess] = useState<Guess | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState("/game-images/dalle2_a_serene_underwater__1741120402972.png")
  const [gameData, setGameData] = useState<{
    image: string;
    targetWords: string[];
    difficulty: number;
  } | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Current target words (from game data)
  const currentTargetWords = gameData?.targetWords || []

  // Fetch game data on component mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoadingGame(true)
        // Fetch a random game image with target words
        const response = await fetch('/api/game/random-image')
        
        if (!response.ok) {
          throw new Error('Failed to fetch game data')
        }
        
        const data = await response.json()
        setGameData({
          image: data.imagePath,
          targetWords: data.targetWords || [],
          difficulty: data.difficulty || 1,
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
  }, [toast])

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
          targetWords: currentTargetWords,
          guessWords: words,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate similarity');
      }

      const data = await response.json();
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
      if (similarity === 100) {
        setIsCorrect(true);
        setCorrectSimilarity(similarity);
        setShowCorrectAnimation(true);

        toast({
          title: "Perfect match!",
          description: "You found the exact words!",
          variant: "default",
        });

        // Hide animation after 3 seconds
        setTimeout(() => {
          setShowCorrectAnimation(false);
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
    
    // Get a new image
    void fetch('/api/game/random-image');
  };

  return (
    <div className="container mx-auto py-6">
      {/* Correct answer animation overlay */}
      <AnimatePresence>
        {showCorrectAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: correctSimilarity / 200 }} // Max opacity 0.5 at 100% similarity
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500 z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Correct answer word animation */}
      <AnimatePresence>
        {showCorrectAnimation && isCorrect && (
          <>
            <motion.div
              initial={{ y: -50, x: 0, opacity: 0 }}
              animate={{ y: 200, x: -100, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <span className="text-foreground text-6xl font-bold">{currentTargetWords[0]}</span>
            </motion.div>
            <motion.div
              initial={{ y: -50, x: 0, opacity: 0 }}
              animate={{ y: 200, x: 100, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <span className="text-foreground text-6xl font-bold">{currentTargetWords[1]}</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">PICKTLE</h1>
          <p className="text-muted-foreground">
            Guess the two words that describe this image. The nearest word has a similarity of{" "}
            <span className="font-semibold">{similarityRanges.nearest}</span>, the tenth-nearest has a similarity of{" "}
            <span className="font-semibold">{similarityRanges.tenthNearest}</span> and the thousandth nearest word has a similarity of{" "}
            <span className="font-semibold">{similarityRanges.thousandthNearest}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Image Card */}
          <Card>
            <CardHeader>
              <CardTitle>Target Image</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingGame ? (
                <div className="flex aspect-video w-full items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={currentImage}
                    alt="Guess the words for this image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Find the two words that best describe this image
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoadingGame || isLoading}
              >
                {isLoadingGame ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                New Image
              </Button>
            </CardFooter>
          </Card>

          {/* Guess Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Make Your Guess</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter two words..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleGuess()
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={() => void handleGuess()} disabled={isLoading || !inputValue.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guessing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Guess
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Guess #{guessCount + 1} - Enter exactly two words
                </div>

                {/* Latest Guess */}
                {latestGuess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-md border ${
                      latestGuess.similarity >= 90
                        ? "border-red-500 bg-red-500/10"
                        : latestGuess.similarity >= 70
                        ? "border-orange-500 bg-orange-500/10"
                        : latestGuess.similarity >= 50
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-blue-500 bg-blue-500/10"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Overall similarity:</div>
                        <div className="flex items-center gap-2">
                          <span>{latestGuess.similarity}%</span>
                          <span className={getProximityColor(latestGuess.similarity)}>
                            ({getProximityLabel(latestGuess.similarity)})
                          </span>
                        </div>
                      </div>
                      
                      {/* Per-word similarities */}
                      {latestGuess.wordSimilarities && (
                        <div className="flex flex-col gap-1 mt-1 text-sm">
                          {latestGuess.wordSimilarities.map((wordSim, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="font-medium">{wordSim.word}:</div>
                              <div className="flex items-center gap-2">
                                <span>{wordSim.similarity}%</span>
                                <span className={getProximityColor(wordSim.similarity)}>
                                  ({getProximityLabel(wordSim.similarity)})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Progress Bar */}
                <div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-600"
                      initial={{ width: "0%" }}
                      animate={{
                        width: guesses.length > 0 ? `${Math.max(...guesses.map((g) => g.similarity))}%` : "0%",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guesses Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Previous Guesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 w-16">#</th>
                    <th className="pb-2">Guess</th>
                    <th className="pb-2">Similarity</th>
                    <th className="pb-2">Word Details</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {guesses.map((guess) => (
                      <motion.tr
                        key={guess.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-b"
                      >
                        <td className="py-2">{guess.id}</td>
                        <td className={`py-2 ${guess.isHint ? "text-purple-400" : ""}`}>
                          {guess.words.join(" ")}
                          {guess.isHint && <span className="ml-2">💡</span>}
                        </td>
                        <td className="py-2">{guess.similarity}%</td>
                        <td className="py-2">
                          {guess.wordSimilarities ? (
                            <div className="flex flex-col">
                              {guess.wordSimilarities.map((wordSim, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs">
                                  <span className="font-medium">{wordSim.word}:</span>
                                  <span className={getProximityColor(wordSim.similarity)}>
                                    {wordSim.similarity}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={getProximityColor(guess.similarity)}>
                              ({getProximityLabel(guess.similarity)})
                              <div className="inline-block ml-2 w-24 bg-muted rounded-full h-2">
                                <div
                                  className="h-full rounded-full bg-green-600"
                                  style={{
                                    width: `${(1000 - guess.rank) / 10}%`,
                                    opacity: 0.5 + (1000 - guess.rank) / 2000,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 