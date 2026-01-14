'use client';

import { useGame } from '@/lib/context/GameContext';
import { BiddingPhase } from '@/components/phases/BiddingPhase';
import { DogPhase } from '@/components/phases/DogPhase';
import { DiscardPhase } from '@/components/phases/DiscardPhase';
import { PlayingPhase } from '@/components/phases/PlayingPhase';
import { FinishedPhase } from '@/components/phases/FinishedPhase';
import { LoadingOverlay } from '@/components/ui/Spinner';

/**
 * GameBoard - Main game component that routes to phase-specific components
 *
 * This component follows the exact game flow from the backend:
 * waiting → bidding → dog → discard → playing → finished
 *
 * Each phase has its own dedicated component that handles:
 * - Display logic
 * - User interactions
 * - Phase-specific state
 */
export function GameBoard() {
  const { gameState, error } = useGame();

  // Show loading state while game initializes
  if (!gameState) {
    return <LoadingOverlay message="Chargement de la partie..." />;
  }

  // Display error if any
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-2xl">
          <h3 className="font-bold text-lg mb-2">Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Route to phase-specific component
  switch (gameState.phase) {
    case 'waiting':
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              En attente de joueurs...
            </h2>
            <p className="text-gray-300">La partie va démarrer bientôt</p>
          </div>
        </div>
      );

    case 'bidding':
      return <BiddingPhase />;

    case 'dog':
      return <DogPhase />;

    case 'discard':
      return <DiscardPhase />;

    case 'playing':
      return <PlayingPhase />;

    case 'finished':
      return <FinishedPhase />;

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">
            Phase inconnue: {gameState.phase}
          </div>
        </div>
      );
  }
}
