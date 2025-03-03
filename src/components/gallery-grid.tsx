"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

interface ArtPiece {
  id: number;
  title: string;
  config: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  likeCount: number;
  isLiked: boolean;
}

interface GalleryGridProps {
  artworks: ArtPiece[];
}

export function GalleryGrid({ artworks }: GalleryGridProps) {
  const [likedItems, setLikedItems] = useState<number[]>([]);
  const utils = api.useUtils();

  const likeMutation = api.art.like.useMutation({
    onSuccess: () => {
      utils.art.getAll.invalidate();
    },
  });
  
  const unlikeMutation = api.art.unlike.useMutation({
    onSuccess: () => {
      utils.art.getAll.invalidate();
    },
  });

  const handleLike = (id: number, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate({ artPieceId: id });
    } else {
      likeMutation.mutate({ artPieceId: id });
    }
  }

  // Function to format username for display
  const formatUsername = (user: { username: string; firstName?: string; lastName?: string }) => {
    // If we have first name and last name, use them
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // If we have just first name, use it
    if (user.firstName) {
      return user.firstName;
    }
    
    // Otherwise, format the username
    const username = user.username;
    
    // If the username already looks like a proper name (no underscores, not starting with "user"),
    // just return it as is with proper capitalization
    if (!username.includes('_') && !username.startsWith('user')) {
      return username;
    }
    
    // Otherwise, apply the formatting logic for auto-generated usernames
    // Remove the "@useruser_" prefix if it exists
    let displayName = username.replace(/^@?useruser_/, "");
    
    // Remove any numeric suffix (like _2to_1741022217067)
    displayName = displayName.replace(/_\d+to_\d+$/, "");
    
    // If the username is now empty, use "Artist" as fallback
    if (!displayName || displayName.trim() === "") {
      return "Artist";
    }
    
    // Capitalize the first letter of each word
    return displayName
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to render the art piece based on its config
  const renderArtPreview = (config: any) => {
    if (config.canvasData) {
      // If we have canvas data, render it as an image
      return (
        <div className="relative aspect-square">
          <img 
            src={config.canvasData} 
            alt="Artwork" 
            className="object-cover w-full h-full"
          />
        </div>
      );
    } else {
      // Fallback to a placeholder
      return (
        <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-md" 
            style={{ backgroundColor: config.color || '#000000' }}
          />
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group dark:bg-gray-800/10 dark:border-gray-700/20"
        >
          <CardContent className="p-0">
            {renderArtPreview(item.config)}
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {item.user.firstName ? item.user.firstName.charAt(0).toUpperCase() : item.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">by {formatUsername(item.user)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleLike(item.id, item.isLiked)}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${item.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span className="ml-1">{item.likeCount}</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

