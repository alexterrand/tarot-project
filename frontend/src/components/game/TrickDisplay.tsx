// Current trick display (4 cards in cross layout)

import React from 'react';
import type { CardModel } from '@/types/card';
import { Card } from '@/components/ui/Card';
import { getCardKey } from '@/lib/utils/cardHelpers';

interface TrickDisplayProps {
  trick: CardModel[];
  playerIds: string[];
  currentPlayerId: string;
  trickWinnerId?: string | null;
}

export function TrickDisplay({
  trick,
  playerIds,
  currentPlayerId,
  trickWinnerId,
}: TrickDisplayProps) {
  // Position cards in cross layout: North, East, South (human), West
  const positions = ['north', 'east', 'south', 'west'];

  // Rotate positions so human player (player_1) is at the bottom (south)
  const humanIndex = playerIds.indexOf('player_1');
  const rotatedPositions = positions.map((_, i) => {
    const playerIndex = (humanIndex + i) % 4;
    return playerIds[playerIndex];
  });

  const getCardForPosition = (position: string, index: number): CardModel | null => {
    const playerId = rotatedPositions[index];
    const cardIndex = trick.findIndex((_, i) => {
      // Find which player played each card based on play order
      return i < trick.length;
    });

    // For now, display cards in play order from left to right
    return trick[index] || null;
  };

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <div className="relative w-80 h-80">
        {/* North - Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          {trick.length > 0 && trick[0] && (
            <Card card={trick[0]} size="medium" />
          )}
        </div>

        {/* East - Right */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2">
          {trick.length > 1 && trick[1] && (
            <Card card={trick[1]} size="medium" />
          )}
        </div>

        {/* South - Bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          {trick.length > 2 && trick[2] && (
            <Card card={trick[2]} size="medium" />
          )}
        </div>

        {/* West - Left */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          {trick.length > 3 && trick[3] && (
            <Card card={trick[3]} size="medium" />
          )}
        </div>

        {/* Center - Current player indicator or trick count */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tarot-darkgreen/20 rounded-full w-24 h-24 flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {trick.length}/4
          </span>
        </div>
      </div>
    </div>
  );
}
