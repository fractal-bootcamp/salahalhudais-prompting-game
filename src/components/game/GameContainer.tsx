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
import { Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import GameLeaderboard from "./GameLeaderboard";
import UsedPrompts from "./UsedPrompts";
import GameHistory from "./GameHistory";

export default function GameContainer() {
  const [prompt, setPrompt] = useState("");
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
                  <div className="relative h-64 w-full overflow-hidden rounded-md">
                    <Image
                      src={gameData.gameImage.imagePath}
                      alt="Target image"
                      fill
                      className="object-cover"
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
                  <div className="text-sm text-muted-foreground">
                    Difficulty: {gameData.gameImage.difficulty}/10
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Prompt Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submissionResult && submissionResult.prompt && (
                  <div className="space-y-4">
                    <div className="relative h-64 w-64 overflow-hidden rounded-md">
                      <Image
                        src={submissionResult.prompt.generatedImagePath ?? "/placeholder.jpg"}
                        alt="Generated image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        Similarity Score: {submissionResult.similarityScore.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}

                <Textarea
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isSubmitting || isLoadingGame || !gameData?.gameImage}
                  className="min-h-24"
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt || isSubmitting || isLoadingGame || !gameData?.gameImage}
                  className="w-full"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Prompt
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Used Prompts */}
          {gameData?.usedPrompts && gameData.usedPrompts.length > 0 && (
            <div className="mt-6">
              <UsedPrompts usedPrompts={gameData.usedPrompts} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <GameLeaderboard gameImageId={gameData?.gameImage?.id} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <GameHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
} 