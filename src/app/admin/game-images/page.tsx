import { Metadata } from "next";
import { api } from "~/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Game Images Admin | Generative Art",
  description: "Manage game images for the prompt guessing game.",
};

// Define an interface for your image type
interface GameImage {
  id: number;
  imagePath: string;
  difficulty: number | null;
  createdAt: string | Date;
  originalPrompt: string;
  targetWords: string[];
  active: boolean | null;
  // Add other properties as needed
}

// Add a form to edit target words
const EditTargetWordsForm = ({ image, onUpdate }: { image: GameImage, onUpdate: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [targetWords, setTargetWords] = useState<string[]>(image.targetWords || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call your API to update the target words
      const response = await fetch(`/api/admin/game-images/${image.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetWords,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update target words');
      }
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating target words:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-2">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-muted-foreground">Target Words (2 words for Picktle)</label>
            <div className="flex gap-2">
              {targetWords.map((word, index) => (
                <input
                  key={index}
                  type="text"
                  value={word}
                  onChange={(e) => {
                    const newWords = [...targetWords];
                    newWords[index] = e.target.value;
                    setTargetWords(newWords);
                  }}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                />
              ))}
              {targetWords.length < 2 && (
                <button
                  type="button"
                  onClick={() => setTargetWords([...targetWords, ""])}
                  className="h-8 px-2 rounded-md bg-muted text-sm"
                >
                  + Add Word
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-8 px-3 rounded-md border text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">Target Words: </span>
            {targetWords && targetWords.length > 0 ? (
              <span className="text-sm font-medium">{targetWords.join(", ")}</span>
            ) : (
              <span className="text-sm text-muted-foreground italic">None set</span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="h-7 px-2 text-xs rounded-md bg-muted"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default async function GameImagesAdminPage() {
  const user = await currentUser();
  
  // Simple admin check - in a real app, you'd have more robust role checking
  if (!user) {
    redirect("/sign-in");
  }
  
  const gameImages = await api.game.getAllImages();
  
  const handleDeleteImage = async (image: GameImage) => {
    // ...
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Game Images Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Manage images used in the prompt guessing game
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
          <Button asChild>
            <Link href="/game">Play Game</Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Generate New Images</h2>
        <p className="mb-4">
          To generate new images, run the following command in your terminal:
        </p>
        <pre className="mb-4 rounded-md bg-muted p-4 font-mono">
          bun generate-and-seed
        </pre>
        <p>
          This will generate 10 new images using DALL-E 2 and add them to the game.
        </p>
      </div>
      
      <h2 className="mb-4 text-2xl font-semibold">Current Game Images ({gameImages.length})</h2>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gameImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-1 text-sm">
                Image #{image.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-square w-full">
                <Image
                  src={image.imagePath}
                  alt={`Game image ${image.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Difficulty:</span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-3 rounded-full mx-0.5 ${
                          i < (image.difficulty ?? 0) ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(image.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="line-clamp-3 text-xs text-muted-foreground">
                {image.originalPrompt}
              </p>
              
              {/* Add the EditTargetWordsForm */}
              <EditTargetWordsForm 
                image={image} 
                onUpdate={() => {
                  // Refresh the data
                  // You might need to implement a refresh function
                }} 
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 