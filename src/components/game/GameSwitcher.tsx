"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MessageSquare, Image } from "lucide-react";

export default function GameSwitcher() {
  const pathname = usePathname();
  
  const isPromptGame = pathname === "/game";
  const isPicktleGame = pathname === "/game/picktle";
  
  return (
    <Card className="mb-8">
      <CardContent className="flex items-center justify-center gap-4 p-4">
        <Button
          variant={isPromptGame ? "default" : "outline"}
          size="lg"
          asChild
          className="flex-1"
        >
          <Link href="/game" className="flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Prompt Game</span>
          </Link>
        </Button>
        
        <Button
          variant={isPicktleGame ? "default" : "outline"}
          size="lg"
          asChild
          className="flex-1"
        >
          <Link href="/game/picktle" className="flex items-center justify-center gap-2">
            <Image className="h-4 w-4" />
            <span>Picktle</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 