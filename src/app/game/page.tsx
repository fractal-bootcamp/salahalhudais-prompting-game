// src/app/game/page.tsx
import { redirect } from 'next/navigation';

export default function GamePage() {
  redirect('/game/prompt');
}
