// src/app/page.tsx
import { api } from "~/trpc/server";
import { ArtCard, ArtConfig, ArtPiece } from "./_components/ArtCard";
import Link from "next/link";

interface RawArtPiece {
  id: number;
  title: string;
  config: unknown;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: {
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date | null;
  };
  likeCount: number;
  isLiked: boolean;
}

export default async function Home() {
  const rawArts = await api.art.getAll();

  // Transform the raw art pieces to ensure config is properly typed
  const arts = rawArts.map(art => ({
    ...art,
    config: art.config as ArtConfig
  }));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Generative Art Gallery</h1>
        <p className="text-muted-foreground">
          Explore amazing generative art created by our community
        </p>
      </div>
      
      {arts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">No artwork yet</h2>
          <p className="text-muted-foreground mt-2">Be the first to create something amazing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arts.map((art) => (
            <ArtCard key={art.id} art={art} />
          ))}
        </div>
      )}
    </div>
  );
}