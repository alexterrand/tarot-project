// Score display component (end of game)

import React from 'react';
import type { ContractModel, PlayerModel } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { getBidDisplayName } from '@/lib/utils/cardHelpers';

interface ScoreDisplayProps {
  contract: ContractModel;
  players: PlayerModel[];
  onNewGame: () => void;
}

export function ScoreDisplay({ contract, players, onNewGame }: ScoreDisplayProps) {
  const contractWon = contract.taker_points >= contract.points_needed;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Partie terminée !
      </h2>

      {/* Contract result */}
      <div className={`rounded-lg p-6 mb-6 ${contractWon ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
        <h3 className="text-xl font-bold mb-3">
          {contractWon ? '✓ Contrat réussi !' : '✗ Contrat échoué'}
        </h3>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Preneur:</span> {contract.taker_id}
          </p>
          <p>
            <span className="font-semibold">Contrat:</span> {getBidDisplayName(contract.contract_type)}
          </p>
          <p>
            <span className="font-semibold">Points requis:</span> {contract.points_needed}
          </p>
          <p>
            <span className="font-semibold">Points preneur:</span> {contract.taker_points.toFixed(1)} / 91
          </p>
          <p>
            <span className="font-semibold">Points défense:</span> {contract.defense_points.toFixed(1)} / 91
          </p>
          <p>
            <span className="font-semibold">Bouts:</span> {contract.oudlers_count}
          </p>
        </div>
      </div>

      {/* Player scores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Plis remportés</h3>
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded border-2 ${
                player.id === contract.taker_id
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <p className="font-semibold">{player.id}</p>
              <p className="text-sm text-gray-600">
                {player.tricks_won} plis
              </p>
              {player.id === contract.taker_id && (
                <span className="text-xs bg-blue-200 px-2 py-1 rounded">Preneur</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New game button */}
      <Button onClick={onNewGame} className="w-full" size="large">
        Nouvelle partie
      </Button>
    </div>
  );
}
