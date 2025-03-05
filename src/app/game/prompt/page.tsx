import GameContainer from "./components/GameContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt Guessing Game | Generative Art",
  description: "Test your prompt engineering skills by recreating images with unique prompts.",
};

export default function PromptGamePage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <GameContainer />
    </div>
  );
} 