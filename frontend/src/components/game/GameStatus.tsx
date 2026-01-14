// Game status indicator

import React from 'react';
import type { GamePhase, ContractModel } from '@/types/game';
import { getPhaseDisplayName, getBidDisplayName } from '@/lib/utils/cardHelpers';

interface GameStatusProps {
  phase: GamePhase;
  currentPlayerId: string;
  humanPlayerId: string;
  contract?: ContractModel | null;
  trickPauseActive?: boolean;
  trickWinnerId?: string | null;
  timeSinceTrickCompleted?: number | null;
}

export function GameStatus({
  phase,
  currentPlayerId,
  humanPlayerId,
  contract,
  trickPauseActive,
  trickWinnerId,
  timeSinceTrickCompleted,
}: GameStatusProps) {
  const isMyTurn = currentPlayerId === humanPlayerId;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {getPhaseDisplayName(phase)}
          </h2>
          {isMyTurn && !trickPauseActive && (
            <p className="text-green-600 font-semibold">À vous de jouer</p>
          )}
          {!isMyTurn && !trickPauseActive && (
            <p className="text-gray-600">En attente de {currentPlayerId}</p>
          )}
          {trickPauseActive && trickWinnerId && timeSinceTrickCompleted !== null && (
            <p className="text-blue-600 font-semibold">
              Pli remporté par {trickWinnerId} - Prochain pli dans {Math.ceil(3 - timeSinceTrickCompleted)}s
            </p>
          )}
        </div>

        {contract && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Contrat</p>
            <p className="text-lg font-bold text-tarot-green">
              {getBidDisplayName(contract.contract_type)}
            </p>
            <p className="text-sm text-gray-600">
              Preneur: {contract.taker_id}
            </p>
            <p className="text-sm text-gray-600">
              Points requis: {contract.points_needed}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
