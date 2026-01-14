'use client';

import { useState } from 'react';
import { useGame } from '@/lib/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCardKey } from '@/lib/utils/cardHelpers';
import type { CardModel } from '@/types/card';

export function DiscardPhase() {
  const { playerHand, discardCards, isLoading, humanPlayerId, contract, biddingStatus } = useGame();
  const [selectedCards, setSelectedCards] = useState<CardModel[]>([]);

  const takerId = contract?.taker_id || biddingStatus?.taker_id;
  const isHumanTaker = takerId === humanPlayerId;

  const toggleCard = (card: CardModel) => {
    const isSelected = selectedCards.some(
      (c) => c.suit === card.suit && c.rank === card.rank
    );

    if (isSelected) {
      setSelectedCards(selectedCards.filter(
        (c) => !(c.suit === card.suit && c.rank === card.rank)
      ));
    } else if (selectedCards.length < 6) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleConfirm = async () => {
    if (selectedCards.length === 6) {
      try {
        await discardCards(selectedCards);
        setSelectedCards([]);
      } catch (err) {
        console.error('Failed to discard:', err);
      }
    }
  };

  // Si ce n'est pas le preneur humain, afficher un message d'attente
  if (!isHumanTaker) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-xl text-gray-600">
            Le bot <span className="font-bold text-blue-600">{takerId}</span> effectue son écart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Écart ({selectedCards.length}/6)
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Choisissez 6 cartes à écarter (elles compteront dans vos points)
        </p>

        {/* Main du joueur avec sélection */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {playerHand.map((card) => {
              const isSelected = selectedCards.some(
                (c) => c.suit === card.suit && c.rank === card.rank
              );

              return (
                <div
                  key={getCardKey(card)}
                  onClick={() => toggleCard(card)}
                  className="cursor-pointer"
                >
                  <Card
                    card={card}
                    size="medium"
                    isSelected={isSelected}
                    isPlayable={true}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Cartes sélectionnées */}
        {selectedCards.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Cartes sélectionnées pour l&apos;écart:
            </h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {selectedCards.map((card) => (
                <div key={getCardKey(card)} className="text-sm text-gray-700">
                  {card.display_name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton de confirmation */}
        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={selectedCards.length !== 6 || isLoading}
            size="large"
            className="min-w-[250px]"
          >
            {selectedCards.length === 6
              ? 'Confirmer l\'écart'
              : `Sélectionnez ${6 - selectedCards.length} carte(s) supplémentaire(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
