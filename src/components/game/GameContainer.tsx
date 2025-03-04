"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/use-toast";
import { Loader2, RefreshCw, Maximize2, X } from "lucide-react";
import Image from "next/image";
import GameLeaderboard from "./GameLeaderboard";
import UsedPrompts from "./UsedPrompts";
import GameHistory from "./GameHistory";

export default function GameContainer() {
  const [prompt, setPrompt] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("play");

  // Get a random game image
  const {
    data: gameData,
    isLoading: isLoadingGame,
    refetch: refetchGame,
    error: gameError,
  } = api.game.getRandomImage.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Submit a prompt
  const {
    mutate: submitPrompt,
    isPending: isSubmitting,
    data: submissionResult,
  } = api.game.submitPrompt.useMutation({
    onSuccess: () => {
      setPrompt("");
      toast({
        title: "Prompt submitted",
        description: "Your prompt has been processed successfully!",
        variant: "default",
      });
      // Refetch the game data to update the used prompts
      void refetchGame();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!gameData?.gameImage?.id) return;
    
    submitPrompt({
      gameImageId: gameData.gameImage.id,
      promptText: prompt,
    });
  };

  const handleRefresh = () => {
    setPrompt("");
    void refetchGame();
  };

  const handleImageClick = () => {
    setImageModalOpen(true);
  };
  
  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="play" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Game Image Card */}
            <Card>
              <CardHeader>
                <CardTitle>Target Image</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingGame ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <Skeleton className="h-64 w-64" />
                  </div>
                ) : gameError ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <p className="text-destructive">Failed to load image</p>
                  </div>
                ) : gameData?.gameImage ? (
                  <div className="relative h-96 w-full overflow-hidden rounded-md">
                    <div 
                      className="absolute right-2 top-2 z-10 cursor-pointer rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                      onClick={handleImageClick}
                    >
                      <Maximize2 size={16} />
                    </div>
                    <Image
                      src={gameData.gameImage.imagePath}
                      alt="Target image"
                      fill
                      className="object-contain cursor-pointer"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      onClick={handleImageClick}
                    />
                  </div>
                ) : (
                  <div className="flex h-64 w-full items-center justify-center">
                    <p>No images available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoadingGame || isSubmitting}
                >
                  {isLoadingGame ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  New Image
                </Button>
                {gameData?.gameImage?.difficulty && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Difficulty:</span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-4 rounded-full mx-0.5 ${
                            i < (gameData?.gameImage?.difficulty ?? 0)
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-sm font-medium">
                      {gameData.gameImage.difficulty}/5
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Prompt Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Write Your Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe what you see in the image..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-[100px]"
                  />
                  
                  {submissionResult && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="font-semibold">
                        Similarity Score: {submissionResult.similarityScore}%
                      </p>
                      {submissionResult.similarityScore > 90 && (
                        <p className="text-green-600">Excellent description!</p>
                      )}
                      {submissionResult.similarityScore > 70 && submissionResult.similarityScore <= 90 && (
                        <p className="text-yellow-600">Good description, but can you be more specific?</p>
                      )}
                      {submissionResult.similarityScore <= 70 && (
                        <p className="text-red-600">Try to be more detailed in your description.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isSubmitting || isLoadingGame}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Image
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isSubmitting || !gameData?.gameImage}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Prompt'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Used Prompts Section */}
          <div className="mt-6">
            <UsedPrompts
              usedPrompts={gameData?.usedPrompts ?? []}
              isLoading={isLoadingGame}
            />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <GameLeaderboard gameImageId={gameData?.gameImage?.id} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <GameHistory />
        </TabsContent>
      </Tabs>

      {/* Full-size image modal */}
      {imageModalOpen && gameData?.gameImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={closeImageModal}
              className="absolute -right-4 -top-4 rounded-full bg-black p-2 text-white hover:bg-gray-800"
            >
              <X size={24} />
            </button>
            <div className="relative h-[80vh] w-[80vw]">
              <Image
                src={gameData.gameImage.imagePath}
                alt="Target image full view"
                fill
                className="object-contain"
                sizes="80vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 