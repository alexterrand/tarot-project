'use client';

import { useGame } from '@/lib/context/GameContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function FinishedPhase() {
  const { contract, gameState } = useGame();
  const router = useRouter();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Chargement des résultats...</p>
      </div>
    );
  }

  // Case: All players passed - no contract
  if (!contract) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-2xl p-10 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Partie annulée
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tous les joueurs ont passé. Aucun contrat n&apos;a été établi.
          </p>
          <Button
            onClick={() => router.push('/')}
            size="large"
            className="min-w-[250px]"
          >
            Nouvelle partie
          </Button>
        </div>
      </div>
    );
  }

  const contractWon = contract.taker_points >= contract.points_needed;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-2xl p-10 max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          {contractWon ? (
            <span className="text-green-600">Contrat réussi ! 🎉</span>
          ) : (
            <span className="text-red-600">Contrat échoué</span>
          )}
        </h1>

        {/* Informations du contrat */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Détails du contrat
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Preneur</p>
              <p className="text-xl font-bold text-blue-600">{contract.taker_id}</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Contrat</p>
              <p className="text-xl font-bold text-purple-600">{contract.contract_type}</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Bouts</p>
              <p className="text-xl font-bold text-orange-600">{contract.oudlers_count}</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Points requis</p>
              <p className="text-xl font-bold text-gray-700">{contract.points_needed}</p>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Scores finaux
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className={`text-center p-6 rounded-lg ${contractWon ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="text-gray-700 text-sm mb-2">Points du preneur</p>
              <p className={`text-3xl font-bold ${contractWon ? 'text-green-600' : 'text-red-600'}`}>
                {contract.taker_points.toFixed(1)}
              </p>
            </div>

            <div className={`text-center p-6 rounded-lg ${contractWon ? 'bg-red-100' : 'bg-green-100'}`}>
              <p className="text-gray-700 text-sm mb-2">Points de la défense</p>
              <p className={`text-3xl font-bold ${contractWon ? 'text-red-600' : 'text-green-600'}`}>
                {contract.defense_points.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Plis remportés */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Plis remportés
          </h2>

          <div className="space-y-2">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-white rounded p-4"
              >
                <span className="font-semibold text-gray-700">
                  {player.id}
                  {player.id === contract.taker_id && (
                    <span className="ml-2 text-xs text-blue-600">(Preneur)</span>
                  )}
                </span>
                <span className="text-xl font-bold text-gray-800">
                  {player.tricks_won} plis
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton nouvelle partie */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/')}
            size="large"
            className="min-w-[250px]"
          >
            Nouvelle partie
          </Button>
        </div>
      </div>
    </div>
  );
}
