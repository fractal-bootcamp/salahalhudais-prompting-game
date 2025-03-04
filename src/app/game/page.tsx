import { Metadata } from "next";
import GameContainer from "~/components/game/GameContainer";
import GameSwitcher from "~/components/game/GameSwitcher";

export const metadata: Metadata = {
  title: "Prompt Guessing Game | Generative Art",
  description: "Test your prompt engineering skills by recreating images with unique prompts.",
};

export default function GamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Prompt Guessing Game</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        You&apos;ll be shown an AI-generated image. Your task is to create a text prompt that
        generates an image as similar as possible to the original. Each prompt must be unique!
      </p>
      <GameSwitcher />
      <GameContainer />
    </div>
  );
} 