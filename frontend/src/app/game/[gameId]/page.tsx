'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { useGame } from '@/lib/context/GameContext';
import { Spinner } from '@/components/ui/Spinner';

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { gameState } = useGame();

  useEffect(() => {
    // Game context will start polling automatically when gameId is set
    // This happens from the home page when creating a game
  }, [gameId]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" />
          <p className="text-white mt-4">Chargement de la partie...</p>
        </div>
      </div>
    );
  }

  return <GameBoard />;
}
