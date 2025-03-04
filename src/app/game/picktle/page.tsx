import { Metadata } from "next";
import PicktleGame from "~/components/game/PicktleGame";
import GameSwitcher from "~/components/game/GameSwitcher";

export const metadata: Metadata = {
  title: "Picktle | Generative Art",
  description: "Guess the two words that describe the image in this fun word guessing game.",
};

export default function PicktlePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Picktle</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        You&apos;ll be shown an image. Your task is to guess the two words that best describe it.
        The closer your words are to the target words, the higher your similarity score!
      </p>
      <GameSwitcher />
      <PicktleGame />
    </div>
  );
} 