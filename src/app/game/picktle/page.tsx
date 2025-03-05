import { Metadata } from "next";
import PicktleGame from "./components/PicktleGame";

export const metadata: Metadata = {
  title: "Picktle | Generative Art",
  description: "Guess the two words that describe the image in this fun word guessing game.",
};

export default function PicktlePage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <PicktleGame />
    </div>
  );
} 