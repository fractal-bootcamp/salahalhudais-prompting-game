// src/app/_components/ArtCard.tsx
"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { toast } from "sonner";

// Add export to these interfaces
export interface ArtConfig {
  size: number;
  color: string;
  [key: string]: any;
}

export interface ArtPiece {
  id: number;
  title: string;
  config: ArtConfig;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: {
    id: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date | null;
  };
  likeCount: number;
  isLiked: boolean;
}

// Art rendering component
function ArtRenderer({ config }: { config: ArtConfig }) {
  // This is a simple example - you would replace this with your actual art rendering logic
  return (
    <mesh>
      <boxGeometry args={[config.size, config.size, config.size]} />
      <meshStandardMaterial color={config.color} />
    </mesh>
  );
}

export function ArtCard({ art }: { art: ArtPiece }) {
  const [isLiked, setIsLiked] = useState(art.isLiked);
  const [likeCount, setLikeCount] = useState(art.likeCount);
  
  const likeMutation = api.art.like.useMutation({
    onSuccess: () => {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      toast.success("Artwork liked!", {
        description: `You liked "${art.title}"`,
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    }
  });
  
  const unlikeMutation = api.art.unlike.useMutation({
    onSuccess: () => {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    }
  });
  
  const handleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate({ artPieceId: art.id });
    } else {
      likeMutation.mutate({ artPieceId: art.id });
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${art.user.username}`} />
                  <AvatarFallback>{art.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">{art.title}</CardTitle>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${art.user.username}`} />
                  <AvatarFallback>{art.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@{art.user.username}</h4>
                  <p className="text-sm">
                    Created on {new Date(art.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center pt-2">
                    <Heart className="mr-1 h-4 w-4 fill-primary text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {likeCount} likes
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <CardDescription>
          by @{art.user.username} • {new Date(art.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 aspect-square">
        <div className="h-full w-full bg-muted/20">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <ArtRenderer config={art.config} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between">
        <Button
          variant={isLiked ? "default" : "outline"}
          size="sm"
          className="gap-1"
          onClick={handleLike}
          disabled={likeMutation.isPending || unlikeMutation.isPending}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
          {likeCount}
        </Button>
      </CardFooter>
    </Card>
  );
}