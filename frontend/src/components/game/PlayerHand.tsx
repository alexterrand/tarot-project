// Player hand display component

import React from 'react';
import type { CardModel } from '@/types/card';
import type { GamePhase } from '@/types/game';
import { Card } from '@/components/ui/Card';
import { sortCards, isCardPlayable, getCardKey } from '@/lib/utils/cardHelpers';

interface PlayerHandProps {
  cards: CardModel[];
  legalCards: CardModel[];
  selectedCards?: CardModel[];
  onCardClick: (card: CardModel) => void;
  phase: GamePhase;
  isMyTurn: boolean;
}

export function PlayerHand({
  cards,
  legalCards,
  selectedCards = [],
  onCardClick,
  phase,
  isMyTurn,
}: PlayerHandProps) {
  const sortedCards = sortCards(cards);

  const isCardSelected = (card: CardModel) =>
    selectedCards.some((c) => c.suit === card.suit && c.rank === card.rank);

  const canPlayCard = (card: CardModel) => {
    // Ne pas griser les cartes pendant la phase d'enchères, du chien et de l'écart
    if (phase === 'bidding' || phase === 'dog' || phase === 'discard') return true;
    // Pendant le jeu, vérifier si la carte est jouable
    if (phase === 'playing') return isCardPlayable(card, legalCards, isMyTurn);
    return true; // Par défaut, toutes les cartes sont visibles
  };

  // Diviser les cartes en 2 lignes
  const midPoint = Math.ceil(sortedCards.length / 2);
  const topRow = sortedCards.slice(0, midPoint);
  const bottomRow = sortedCards.slice(midPoint);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Votre main ({sortedCards.length} cartes)</h3>
      <div className="flex flex-col items-center gap-0">
        {/* Ligne du haut */}
        <div className="flex flex-wrap justify-center gap-1 mb-[-27px] z-10">
          {topRow.map((card) => (
            <Card
              key={getCardKey(card)}
              card={card}
              isPlayable={canPlayCard(card)}
              isSelected={isCardSelected(card)}
              size="medium"
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
        {/* Ligne du bas (recouvre à 75% la ligne du haut) */}
        <div className="flex flex-wrap justify-center gap-1">
          {bottomRow.map((card) => (
            <Card
              key={getCardKey(card)}
              card={card}
              isPlayable={canPlayCard(card)}
              isSelected={isCardSelected(card)}
              size="medium"
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
