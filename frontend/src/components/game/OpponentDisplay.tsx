// Opponent (bot) display component

import React from 'react';
import type { PlayerModel } from '@/types/game';
import { CardBack } from '@/components/ui/Card';

interface OpponentDisplayProps {
  player: PlayerModel;
  position: 'north' | 'east' | 'west';
}

export function OpponentDisplay({ player, position }: OpponentDisplayProps) {
  const positionStyles = {
    north: 'top-4 left-1/2 -translate-x-1/2',
    east: 'right-4 top-1/2 -translate-y-1/2',
    west: 'left-4 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={`absolute ${positionStyles[position]} bg-white rounded-lg shadow-lg p-3`}>
      <div className="flex items-center gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{player.id}</p>
          <p className="text-xs text-gray-600">{player.card_count} cartes</p>
          <p className="text-xs text-gray-600">{player.tricks_won} plis</p>
        </div>
        <div className="flex gap-1">
          {[...Array(Math.min(player.card_count, 3))].map((_, i) => (
            <CardBack key={i} size="small" />
          ))}
          {player.card_count > 3 && (
            <div className="w-16 h-24 flex items-center justify-center text-gray-500 text-sm">
              +{player.card_count - 3}
            </div>
          )}
        </div>
      </div>
      {player.is_current && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          En cours
        </div>
      )}
    </div>
  );
}
