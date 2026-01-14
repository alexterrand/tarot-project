'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGame } from '@/lib/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function HomePage() {
  const router = useRouter();
  const { createGame, gameId } = useGame();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const newGameId = await createGame();
      // Redirect immediately with the returned game ID
      router.push(`/game/${newGameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-tarot-green mb-4">Tarot</h1>
        <p className="text-gray-600 mb-8">Jeu de Tarot Français</p>

        <div className="space-y-4">
          <Button
            onClick={handleStartGame}
            disabled={isCreating}
            size="large"
            className="w-full"
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="small" />
                <span>Création...</span>
              </div>
            ) : (
              'Démarrer une partie'
            )}
          </Button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Règles du jeu</h2>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• 4 joueurs (vous + 3 bots)</li>
            <li>• 18 plis à remporter</li>
            <li>• Contrat à réaliser</li>
            <li>• Gestion stratégique des Atouts</li>
          </ul>
        </div>
      </div>

      <footer className="mt-8 text-white/70 text-sm">
        <p>Tarot Project V3 - Built with Next.js & FastAPI</p>
      </footer>
    </main>
  );
}
